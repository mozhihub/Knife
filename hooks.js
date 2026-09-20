/**
 * Knife Hit - Firebase + Live HUD integration
 * Uses the Firebase project supplied by the game owner.
 */
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCaALqxdtEPCNxg5XPPG81T9853gOPO4qY",
    authDomain: "server-41203.firebaseapp.com",
    databaseURL: "https://server-41203-default-rtdb.firebaseio.com",
    projectId: "server-41203",
    storageBucket: "server-41203.firebasestorage.app",
    messagingSenderId: "26278139327",
    appId: "1:26278139327:web:db44a7e2d8d42d690abd0a"
};

var db = null;
var firebaseReady = false;
var liveSessionRef = null;
var liveSessionId = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

function setHud(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}
function safeNum(v, fallback) {
    return typeof v === 'number' && isFinite(v) ? v : (fallback || 0);
}
function initFirebaseLive() {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.database();
        firebaseReady = true;

        var statsRef = db.ref('knife/stats');
        statsRef.child('visitors').transaction(function(v){ return (v || 0) + 1; })
            .then(function(result){ setHud('visitorCount', safeNum(result.snapshot.val(), 0)); })
            .catch(function(){ });

        liveSessionRef = db.ref('knife/live/' + liveSessionId);
        liveSessionRef.set({ online:true, level:1, score:0, lastSeen:firebase.database.ServerValue.TIMESTAMP });
        liveSessionRef.onDisconnect().remove();

        db.ref('knife/live').on('value', function(snap){
            var count = 0;
            snap.forEach(function(child){ if (child.val() && child.val().online !== false) count++; });
            setHud('livePlayers', Math.max(1, count));
        });
    } catch (e) {
        console.warn('Firebase live disabled:', e);
    }
}
function updateLiveGame(level, score) {
    if (!liveSessionRef) return;
    liveSessionRef.update({ online:true, level:safeNum(level,1), score:safeNum(score,0), lastSeen:firebase.database.ServerValue.TIMESTAMP }).catch(function(){});
    setHud('liveLevel', safeNum(level,1));
}

window.gradle = {
    log: function(val){ console.log(val); },
    intervalAds: 1,
    fullsize: true,
    score: 0,
    isMobile: /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent),
    start: function(){
        initFirebaseLive();
        setTimeout(function(){
            if (typeof phaserInit === 'function') phaserInit();
            else if (typeof window.phsrI === 'function') window.phsrI();
        }, 50);
    },
    run: function(){
        document.addEventListener('visibilitychange', gradle.onVisibilityChanged, false);
        gradle.start();
    },
    save_score: function(score, level){
        gradle.score = safeNum(score,0);
        updateLiveGame(level || 1, gradle.score);
        if (db) {
            db.ref('knife/leaderboard').push({ score:gradle.score, level:safeNum(level,1), timestamp:firebase.database.ServerValue.TIMESTAMP });
        }
    },
    process: function(ev, msg){
        if (ev === 'btn_more') window.open('https://kaviyarasan-1997.github.io/Portfolio/', '_blank', 'noopener');
        else if (ev === 'btn_share') {
            if (typeof shareGame === 'function') shareGame();
        } else if (ev === 'btn_profile') window.top.location.href = 'https://t.me/gamendbot';
        else if (ev === 'btn_exit_game') { if (typeof exitGame === 'function') exitGame(); }
        else if (ev === 'btn_privacy') { if (typeof showPrivacyPopup === 'function') showPrivacyPopup(); }
        return true;
    },
    event: function(ev, msg){
        if (ev === 'game_over') {
            if (db) db.ref('knife/stats/total_plays').transaction(function(c){ return (c || 0) + 1; });
            updateLiveGame(1, gradle.score || 0);
        }
    },
    onVisibilityChanged: function(){
        if (!liveSessionRef) return;
        liveSessionRef.update({online:!document.hidden, lastSeen:firebase.database.ServerValue.TIMESTAMP}).catch(function(){});
    }
};

gradle.run();

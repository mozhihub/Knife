/**
 * @kaviyarasan-1997 | Modified for Telegram Mini App & Firebase
 * copyright @2021-2026
 */

// 1. Initialize Firebase (Using your provided config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBb0upYoLF4_isVBfJUAMOEflMCgl5_5aE",
    authDomain: "game-3a2e9.firebaseapp.com",
    databaseURL: "https://game-3a2e9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "game-3a2e9",
    storageBucket: "game-3a2e9.firebasestorage.app",
    messagingSenderId: "107429496573",
    appId: "1:107429496573:web:d713c43d7acf8a02232094",
    measurementId: "G-4CWEE32ZF7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. Main Game Logic Object
window.gradle = { 
    log: function(val){
        val && console.log( gradle.isMobile && (typeof val === 'object') ? JSON.stringify(val) : val );
    },

    intervalAds: 1,
    fullsize: true,
    score: 0,
    mute: false,
    currentInterval: 0,
    prefix: "gd.4026.",
    enable_music: true,
    enable_pause: true,

    // Events manager
    event: function(ev, msg){
        if(gradle.process(ev,msg))
        switch(ev){
            case 'first_start': break;
            case 'button_play': break;
            case 'over_button_restart':
                gradle.checkInterval();
                break;
            case 'game_over':
                // Track game over event in Firebase
                update(ref(db, 'stats/Knife'), { total_games_ended: increment(1) });
                break;
        }
    },

    start: function(){
        setTimeout(function(){ phaserInit(); }, 400);
    },

    run: function() {
        gradle.event('first_start');
        gradle.isMobile = ( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) );
        document.addEventListener("visibilitychange", gradle.onVisibilityChanged, false);
        gradle.start();
        
        // Track Live Visitor in Firebase
        update(ref(db, 'live_users'), { total: increment(1) });
    },

    save_score: function(score, level){
        // Save score to Firebase Live Database
        const userRef = ref(db, 'leaderboard/Knife');
        update(userRef, { 
            last_score: score,
            top_score: increment(0) // Logic to update if higher can be added here
        });
        console.log("Score Saved to Firebase: " + score);
    },

    process: function(ev, msg){
        console.log("Processing Event: " + ev); // Debugging
        
        switch(ev){
            case 'btn_more':
                window.top.location.href = "https://mozhihub.github.io/Mad-drive/";
                break;
            case 'btn_privacy':
                window.open("https://infolite-in.github.io/Hexa/privacy.html", "_blank");
                break;
            case 'btn_share':
                const shareText = encodeURIComponent("🎯 I scored high in Knife Hit! Can you beat me?");
                const shareUrl = encodeURIComponent("https://t.me/gamendbot");
                window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, "_blank");
                break;
            case 'btn_profile':
                window.top.location.href = "https://t.me/gamendbot";
                break;
            case 'btn_exit_game':
                // Redirect back to main hub or another game
                window.top.location.href = "https://infolite-in.github.io/Hexa/";
                break;
        }
        return true;
    },

    onVisibilityChanged: function(){
        if (document.hidden || document.mozHidden || document.webkitHidden || document.msHidden){
            gradle.pause();
        }else{
            gradle.resume();
        }
    },

    pause: function(){ console.log('Game Paused'); },
    resume: function(){ console.log('Game Resumed'); },
    checkInterval: function(){
        return (++gradle.currentInterval==gradle.intervalAds) ? !(gradle.currentInterval=0) : !1;
    },
    buildKey: function(key){ return gradle.prefix + key; },
    getItem: function(key, default_value){
        try {
            var value = localStorage.getItem(gradle.buildKey(key));
            return value ? window.atob(value) : default_value;
        } catch(e) { return default_value; }
    },
    setItem: function(key, value){
        try {
            localStorage.setItem(gradle.buildKey(key), window.btoa(value));
        } catch(e) {}
    }
};

// Start the game
gradle.run();

/**
 * @kaviyarasan-1997 | Fixed for Telegram & Firebase (No-Blank Version)
 */

// --- FIREBASE INITIALIZATION ---
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

// Initialize Firebase safely
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();
}

window.gradle = { 
    log: function(val){ console.log(val); },
    intervalAds: 1,
    fullsize: true,
    score: 0,
    isMobile: ( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) ),

    // Start the Phaser Game
    start: function(){
        setTimeout(function(){ 
            if(typeof phaserInit === 'function') phaserInit(); 
        }, 400);
    },

    run: function() {
        gradle.event('first_start');
        document.addEventListener("visibilitychange", gradle.onVisibilityChanged, false);
        gradle.start();
        
        // Track Visit in Firebase
        if(db) db.ref('live_users').child('total').transaction(current => (current || 0) + 1);
    },

    save_score: function(score, level){
        console.log("Saving Score: " + score);
        if(db) {
            db.ref('leaderboard/Knife').update({ 
                last_score: score,
                timestamp: Date.now()
            });
        }
    },

    process: function(ev, msg){
        console.log("Button Clicked: " + ev);
        
        switch(ev){
            case 'btn_more':
                window.top.location.href = "https://mozhihub.github.io/Mad-drive/";
                break;
            case 'btn_share':
                const shareText = encodeURIComponent("🎯 I'm playing Knife Hit! Can you beat me?");
                const shareUrl = encodeURIComponent("https://t.me/gamendbot");
                window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, "_blank");
                break;
            case 'btn_profile':
                window.top.location.href = "https://t.me/gamendbot";
                break;
            case 'btn_exit_game':
                // Breaks out of Telegram frame and goes to your other game
                window.top.location.href = "https://mozhihub.github.io/Hexa/";
                break;
            case 'btn_privacy':
                window.open("https://mozhihub.github.io/Knife/", "_blank"); 
                break;
        }
        return true;
    },

    event: function(ev, msg){
        if(gradle.process(ev,msg))
        switch(ev){
            case 'game_over':
                if(db) db.ref('stats/Knife/total_plays').transaction(c => (c || 0) + 1);
                break;
        }
    },

    onVisibilityChanged: function(){
        if (document.hidden) { console.log("Paused"); } else { console.log("Resumed"); }
    }
};

// Start everything
gradle.run();

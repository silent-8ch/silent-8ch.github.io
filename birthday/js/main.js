/* main: boot sequence  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */


/* ---------- boot ---------- */
// on load, drop into a random enabled location (then every change is random too)
(function(){
  if (DEBUG_MODE) {
    // Restore last scene from sessionStorage so reloads stay put
    const saved = sessionStorage.getItem('bpet_debug_scene');
    if (saved) {
      const idx = SCENES.indexOf(saved);
      if (idx >= 0) { currentScene = idx; return; }
    }
  }
  const en = enabledIndices(); if (en.length) currentScene = en[Math.floor(Math.random()*en.length)];
})();
resize();
refreshHUD();
offerTreat = pick(TREATS); updateFeedBtn();   // start with a random treat on offer
if (!state.favTreat){ state.favTreat = pick(TREATS).e; save(); }   // she secretly has a favorite
initDaysTogether();   // greets her, counts the day, updates the 💛 chip
welcomeBack();        // if you've been away a while, she happily greets you back
dailyCompliment();    // a sweet little truth from Paul, once a day
requestAnimationFrame(loop);
window.addEventListener('beforeunload', save);

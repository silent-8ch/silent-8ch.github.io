/* encounters: roaming visitors & little one-off events  —  part of the Birthday
   virtual-pet game (8-3.html). Loaded as a classic script; shares global scope.
   Loads after extras.js, before journal.js — all core globals are available.

   Self-contained via the engine.js hooks (never edit the core loop):
     EXTRA_UPDATERS.push(fn(dt))          // runs every frame
     EXTRA_DRAWERS.push(fn())             // draws over the scene every frame (ctx, W×H)
     EXTRA_TAPS.push(fn(px,py) -> bool)   // on a stage tap; return true to consume it

   Handy globals: pet, state, clamp, pick, rand, say, hearts, burst, burstAt, fxAt,
   sfx, showToast, isNight, currentHour, SCENES, currentScene, refreshHUD, save, W, H, ctx.

   An "encounter" is a little visitor or event that wanders in now and then with its
   OWN unique text — a ladybug that lands, a paper boat that drifts by, a shooting
   wish, a neighbor's cat. Tapping it (when relevant) gives a warm, unique reaction.
   Keep each one self-contained, scene-appropriate, low-risk, and defensively wrapped
   so a hiccup in one never disturbs the core game. Warm, personal tone — a gift for
   Krystal, from Paul. */

/* ============================================================================
   ENCOUNTERS (Thread B). Each is a self-contained IIFE, prefixed to avoid clashes.
   ========================================================================== */

function encNowSec(){ try{ return (performance && performance.now ? performance.now() : Date.now())/1000; }catch(e){ return Date.now()/1000; } }

/* ----------------------------------------------------------------------------
   EXAMPLE — WANDERING LADYBUG. On outdoor/grassy scenes a ladybug occasionally
   crawls across the ground. Tap it for a little wish of good luck. This is the
   pattern to follow: gated to fitting scenes, gentle spawn cadence, tappable via
   EXTRA_TAPS, drawn via EXTRA_DRAWERS, self-contained state.
   -------------------------------------------------------------------------- */
(function encLadybug(){
  try{
    const OUTDOORISH = new Set(['backyard','beach','river','cherryblossom','autumnforest',
      'lavender','pasture','orchard','tulipfield','pumpkinpatch','poppyfield','peonygarden',
      'duckpond','beekeepergarden','hummingbirdgarden','citrusgrove','meadow','alpinemeadow']);
    let bug = null, timer = 20 + Math.random()*40;
    function canHere(){ try{ return OUTDOORISH.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bug){
          bug.t += dt; bug.x += bug.vx*dt;
          bug.wob = Math.sin(bug.t*6)*2;
          if (bug.x < -20 || bug.x > W+20) bug = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            bug = { x: dir>0 ? -12 : W+12, y: H*(0.74+Math.random()*0.08),
                    vx: dir*rand(10,18), t:0, wob:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bug) return;
      try{
        const x = bug.x, y = bug.y + bug.wob;
        ctx.save();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath(); ctx.ellipse(x, y, 6, 5, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#2b1410'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y-5); ctx.lineTo(x, y+5); ctx.stroke();
        ctx.fillStyle = '#2b1410';
        ctx.beginPath(); ctx.arc(x-2, y-1, 1, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x+2, y+1, 1, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + (bug.vx>0?5:-5), y, 3, 0, 7); ctx.fill();  // head
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bug) return false;
      const dx = px - bug.x, dy = py - (bug.y + bug.wob);
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A ladybug! 🐞 Make a wish 🥰','Good luck landed on us 🐞','Hello, little one 🐞','She likes you best 💕']));
      burstAt('🐞', bug.x, bug.y); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      bug = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   PAPER BOAT. On watery scenes a little folded paper boat drifts across the
   surface, bobbing on the ripples. Tap it to send a tiny wish sailing downstream.
   -------------------------------------------------------------------------- */
(function encPaperBoat(){
  try{
    const WATERY = new Set(['river','beach','marina','koipond','duckpond','lotuspond','waterlily',
      'harbornight','fishingdock','moonlitjetty','driftwoodbeach','moonbeach','watermill','tidepools',
      'lighthouse','fireflypier','biobay','waterfall','frozenfalls','icepond','bayou','cliffs']);
    let boat = null, timer = 25 + Math.random()*45;
    function canHere(){ try{ return WATERY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (boat){
          boat.t += dt; boat.x += boat.vx*dt;
          boat.bob = Math.sin(boat.t*2.2)*3;
          boat.tilt = Math.sin(boat.t*2.2 + 0.5)*0.06;
          if (boat.x < -40 || boat.x > W+40) boat = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 35 + Math.random()*55;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            boat = { x: dir>0 ? -26 : W+26, y: H*(0.70+Math.random()*0.06),
                     vx: dir*rand(12,20), t:0, bob:0, tilt:0, dir };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!boat) return;
      try{
        const x = boat.x, y = boat.y + boat.bob;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(boat.tilt);
        // hull
        ctx.fillStyle = '#fbf4e6'; ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-15, 2); ctx.lineTo(15, 2); ctx.lineTo(9, 9); ctx.lineTo(-9, 9); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // sail (folded peak)
        ctx.beginPath();
        ctx.moveTo(-13, 2); ctx.lineTo(0, -14); ctx.lineTo(13, 2); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 2); ctx.stroke();  // fold crease
        // little wake reflection
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x-16, y+11); ctx.lineTo(x+16, y+11); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!boat) return false;
      const dx = px - boat.x, dy = py - (boat.y + boat.bob);
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['A little paper boat 🛶 I put a wish in it, just for you 💛',
                'Sail safe, tiny boat 🛶 carry my love downstream',
                'I folded that one thinking of you 💌',
                'Wherever it drifts, I hope it finds you happy 🥰']));
      burstAt('💧', boat.x, boat.y); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 2); refreshHUD();
      boat.vx *= 1.6;  // give it a happy little push onward
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   DUSK FIREFLY. As evening falls over gardens & meadows a single firefly drifts
   in, glowing on and off. Tap to gently cup it in your hands for a warm wish.
   -------------------------------------------------------------------------- */
(function encFirefly(){
  try{
    const GLOWABLE = new Set(['backyard','lavender','peonygarden','poppyfield','hummingbirdgarden',
      'starrymeadow','nightgarden','sunflowers','sunflowermaze','tulipfield','cherryblossom',
      'bonsaigarden','mossgarden','pasture','orchard','vineyard','teahouse','zengarden','koipond']);
    let fly = null, timer = 20 + Math.random()*40;
    function dusk(){ try{ return typeof currentHour==='function' ? currentHour() >= 18.5 || currentHour() < 5 : (typeof isNight==='function' && isNight()); }catch(e){ return false; } }
    function canHere(){ try{ return GLOWABLE.has(SCENES[currentScene]) && dusk(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (fly){
          fly.t += dt; fly.life -= dt;
          fly.x += fly.vx*dt + Math.sin(fly.t*1.3)*8*dt;
          fly.y += fly.vy*dt + Math.cos(fly.t*1.7)*6*dt;
          // gentle steering to stay on stage
          if (fly.x < 30) fly.vx += 6*dt; if (fly.x > W-30) fly.vx -= 6*dt;
          if (fly.y < H*0.35) fly.vy += 5*dt; if (fly.y > H*0.72) fly.vy -= 5*dt;
          fly.glow = 0.45 + 0.55*Math.max(0, Math.sin(fly.t*2.4));
          if (fly.life <= 0) fly = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            fly = { x: rand(W*0.2, W*0.8), y: rand(H*0.45, H*0.65),
                    vx: rand(-10,10), vy: rand(-6,6), t:0, glow:1, life: rand(12,20) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!fly) return;
      try{
        const g = fly.glow;
        ctx.save();
        ctx.globalAlpha = 0.25*g;
        ctx.fillStyle = '#eaff8a';
        ctx.beginPath(); ctx.arc(fly.x, fly.y, 9, 0, 7); ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#fffbcf';
        ctx.beginPath(); ctx.arc(fly.x, fly.y, 2.2, 0, 7); ctx.fill();
        ctx.globalAlpha = g;
        ctx.fillStyle = '#d8ff6b';
        ctx.beginPath(); ctx.arc(fly.x, fly.y, 3.4, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!fly) return false;
      const dx = px - fly.x, dy = py - fly.y;
      if (dx*dx + dy*dy > 24*24) return false;
      say(pick(['A firefly! 🌟 Cup it soft and make a wish',
                'I caught one for you — quick, wish 💫',
                'Little lantern in the dark 🪔 like you are for me',
                'Warm and blinking, just like my heart around you ✨']));
      fxAt(fly.x, fly.y-6, '✨'); burstAt('🌟', fly.x, fly.y); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      fly = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SPECIAL SNOWFLAKE. On snowy/wintry scenes one perfect snowflake tumbles down,
   swaying as it falls. Catch it on your fingertip before it lands.
   -------------------------------------------------------------------------- */
(function encSnowflake(){
  try{
    const WINTRY = new Set(['snowycabin','skilodge','icepond','iceskatingrink','igloo','winterchalet',
      'frozenfalls','icebergbay','reindeerbarn','penguincove','snowglobeshop','crystalcave','mountain',
      'aurora','cavehotspring','gingerbreadkitchen']);
    let flake = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return WINTRY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (flake){
          flake.t += dt;
          flake.y += flake.vy*dt;
          flake.x += Math.sin(flake.t*1.6)*16*dt;
          flake.spin += dt*1.2;
          if (flake.y > H*0.9) flake = null;  // it settled — missed this one
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 32 + Math.random()*48;
          if (canHere()){
            flake = { x: rand(W*0.2, W*0.8), y: -14, vy: rand(26,40), t:0, spin:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!flake) return;
      try{
        ctx.save();
        ctx.translate(flake.x, flake.y); ctx.rotate(flake.spin);
        ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        for (let i=0;i<6;i++){
          ctx.rotate(Math.PI/3);
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-8); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(3,-7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,-5); ctx.lineTo(-3,-7); ctx.stroke();
        }
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!flake) return false;
      const dx = px - flake.x, dy = py - flake.y;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['Caught it! ❄️ No two are alike — like you 🥰',
                'A perfect snowflake, just for a second 💙',
                'Look — it landed right on us before it melted ✨',
                'One in a billion, and it fell to you 💗']));
      fxAt(flake.x, flake.y-6, '❄️'); burstAt('✨', flake.x, flake.y); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 2); refreshHUD();
      flake = null;
      return true;
    });
  }catch(e){}
})();

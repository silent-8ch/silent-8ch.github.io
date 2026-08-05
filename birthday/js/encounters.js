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

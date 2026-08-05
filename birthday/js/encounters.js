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

/* ----------------------------------------------------------------------------
   HOT-AIR BALLOON. On wide outdoor daytime scenes a striped balloon drifts high
   across the sky. Tap it to wave — and daydream about riding away together.
   -------------------------------------------------------------------------- */
(function encBalloon(){
  try{
    const SKYWIDE = new Set(['beach','backyard','river','pasture','orchard','vineyard','wheatfield',
      'sunflowers','sunflowermaze','poppyfield','tulipfield','lavender','alpinemeadow','mountain',
      'kitehill','sanddunes','cliffs','desert','windmill','watermill','harvestbarn','cornmaze',
      'teaplantation','riceterraces','coveredbridge','canyon','prairiestorm','driftwoodbeach']);
    const PALETTE = ['#e07a7a','#e0a24a','#7ab6e0','#8fd07a','#c98ad0'];
    let bal = null, timer = 30 + Math.random()*50;
    function canHere(){ try{ return SKYWIDE.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bal){
          bal.t += dt; bal.x += bal.vx*dt;
          bal.y = bal.baseY + Math.sin(bal.t*0.5)*6;
          if (bal.x < -50 || bal.x > W+50) bal = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 45 + Math.random()*60;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.12+Math.random()*0.12);
            bal = { x: dir>0 ? -34 : W+34, baseY: by, y: by, vx: dir*rand(9,15), t:0,
                    col: pick(PALETTE) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bal) return;
      try{
        const x = bal.x, y = bal.y, R = 15;
        ctx.save();
        // envelope
        ctx.fillStyle = bal.col;
        ctx.beginPath(); ctx.ellipse(x, y, R, R*1.15, 0, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x-R, y); ctx.quadraticCurveTo(x, y+R*1.5, x+R, y); ctx.fill();
        // vertical stripe
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.ellipse(x, y-2, 3.5, R*1.1, 0, Math.PI, 0); ctx.fill();
        // ropes + basket
        ctx.strokeStyle = 'rgba(90,60,40,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x-6, y+R*1.1); ctx.lineTo(x-4, y+R*1.1+10);
        ctx.moveTo(x+6, y+R*1.1); ctx.lineTo(x+4, y+R*1.1+10); ctx.stroke();
        ctx.fillStyle = '#8a5a34';
        ctx.fillRect(x-4, y+R*1.1+10, 8, 6);
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bal) return false;
      const dx = px - bal.x, dy = py - (bal.y+6);
      if (dx*dx + dy*dy > 34*34) return false;
      say(pick(['A balloon! 🎈 One day let\'s ride one, just us two',
                'Up and away 🎈 I\'d go anywhere with you',
                'Wave hello! 👋 Somewhere up there is our next adventure',
                'Imagine the whole world small below us 🥰🎈']));
      fxAt(bal.x, bal.y-4, '🎈'); hearts(); if (typeof sfx==='function') sfx('day');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); refreshHUD();
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   BUTTERFLY. On flowery daytime scenes a butterfly flutters through in a lazy,
   looping path. Tap it to let it perch on your finger for a wish.
   -------------------------------------------------------------------------- */
(function encButterfly(){
  try{
    const FLOWERY = new Set(['florist','flowermarket','greenhouse','tulipfield','lavender','poppyfield',
      'peonygarden','sunflowers','sunflowermaze','hummingbirdgarden','cherryblossom','sakuratunnel',
      'butterflydome','topiary','nursery','orchard','vineyard','pasture','meadow','fairyring',
      'nightgarden','bonsaigarden','mossgarden','sunroom','citrusgrove']);
    const WINGS = ['#e08fb8','#e6a24a','#8fb0e0','#c98ad0','#e0d06a'];
    let bf = null, timer = 18 + Math.random()*36;
    function canHere(){ try{ return FLOWERY.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bf){
          bf.t += dt; bf.life -= dt;
          bf.x += bf.vx*dt;
          bf.y += Math.sin(bf.t*3.2)*22*dt;   // bobbing flutter
          bf.flap = 0.35 + 0.55*Math.abs(Math.sin(bf.t*10));
          if (bf.life <= 0 || bf.x < -24 || bf.x > W+24) bf = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 26 + Math.random()*44;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            bf = { x: dir>0 ? -16 : W+16, y: H*(0.45+Math.random()*0.2),
                   vx: dir*rand(14,22), t:0, flap:0, life: rand(9,16), col: pick(WINGS) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bf) return;
      try{
        const x = bf.x, y = bf.y, w = 6*bf.flap + 2;
        ctx.save();
        ctx.fillStyle = bf.col;
        // left wings
        ctx.beginPath(); ctx.ellipse(x-w, y-3, w, 5, 0.5, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x-w*0.9, y+3, w*0.8, 4, -0.4, 0, 7); ctx.fill();
        // right wings
        ctx.beginPath(); ctx.ellipse(x+w, y-3, w, 5, -0.5, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+w*0.9, y+3, w*0.8, 4, 0.4, 0, 7); ctx.fill();
        // body
        ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y-5); ctx.lineTo(x, y+5); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bf) return false;
      const dx = px - bf.x, dy = py - bf.y;
      if (dx*dx + dy*dy > 24*24) return false;
      say(pick(['A butterfly landed! 🦋 Make a wish, my love',
                'She trusts you enough to rest 🦋 so do I 💗',
                'Something this pretty, drawn right to you 🥰',
                'Soft little wings 🦋 like the flutter you give me']));
      fxAt(bf.x, bf.y-6, '🦋'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      bf = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SHOOTING STAR. On night/starry scenes a star streaks across the sky, leaving a
   bright tail. Tap it fast to catch the wish before it fades.
   -------------------------------------------------------------------------- */
(function encShootingStar(){
  try{
    const STARRY = new Set(['starrymeadow','moonlitjetty','moonbeach','harbornight','nightgarden',
      'nightmarket','observatory','planetarium','aurora','moontemple','fairyring','willowispmarsh',
      'lanternfestival','fireworks','rooftop','rooftoppool','cliffs','mountain','alpinemeadow',
      'campsite','skygondola','lighthouse','desertoasis','treehouse']);
    let star = null, timer = 26 + Math.random()*44;
    function nightish(){ try{ return typeof isNight==='function' ? isNight() : (currentHour() >= 20 || currentHour() < 6); }catch(e){ return true; } }
    function canHere(){ try{ return STARRY.has(SCENES[currentScene]) && nightish(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (star){
          star.t += dt;
          star.x += star.vx*dt; star.y += star.vy*dt;
          if (star.t > 2.4 || star.x > W+40 || star.y > H*0.75) star = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 34 + Math.random()*52;
          if (canHere()){
            const sx = rand(W*0.05, W*0.4), sy = rand(H*0.05, H*0.2);
            const sp = rand(150, 220);
            star = { x: sx, y: sy, vx: sp*0.9, vy: sp*0.45, t:0, len: rand(26,40) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!star) return;
      try{
        const a = Math.max(0, 1 - star.t/2.4);
        const nrm = Math.hypot(star.vx, star.vy) || 1;
        const tx = star.x - (star.vx/nrm)*star.len, ty = star.y - (star.vy/nrm)*star.len;
        ctx.save();
        const grad = ctx.createLinearGradient(star.x, star.y, tx, ty);
        grad.addColorStop(0, 'rgba(255,255,240,'+(0.95*a)+')');
        grad.addColorStop(1, 'rgba(255,255,240,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.globalAlpha = a; ctx.fillStyle = '#fffef0';
        ctx.beginPath(); ctx.arc(star.x, star.y, 2.4, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!star) return false;
      const dx = px - star.x, dy = py - star.y;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['You caught it! 🌠 My wish is always the same — you',
                'Quick, a shooting star! ✨ I already know what I\'d wish for',
                'A star just for us 💫 make it a good one, my love',
                'Wish granted the day I met you 🌠 the rest is bonus 💗']));
      fxAt(star.x, star.y-6, '🌠'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 3); refreshHUD();
      star = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   FLOATING LANTERN. On night water/festival scenes a paper sky-lantern drifts
   slowly upward, glowing warm. Tap it to send a wish up with it.
   -------------------------------------------------------------------------- */
(function encLantern(){
  try{
    const LANTERNY = new Set(['lanternfestival','harbornight','moonlitjetty','moonbeach','nightmarket',
      'nightgarden','rooftop','rooftoppool','willowispmarsh','fireflypier','koipond','lotuspond',
      'trainstation','marina','lighthouse','starrymeadow','moontemple','fairyring','duckpond']);
    let lan = null, timer = 26 + Math.random()*44;
    function nightish(){ try{ return typeof isNight==='function' ? isNight() : (currentHour() >= 19 || currentHour() < 6); }catch(e){ return true; } }
    function canHere(){ try{ return LANTERNY.has(SCENES[currentScene]) && nightish(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (lan){
          lan.t += dt;
          lan.y += lan.vy*dt;
          lan.x += Math.sin(lan.t*0.7)*10*dt;
          lan.glow = 0.7 + 0.3*Math.sin(lan.t*3);
          if (lan.y < -30) lan = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 34 + Math.random()*54;
          if (canHere()){
            lan = { x: rand(W*0.25, W*0.75), y: H*(0.72+Math.random()*0.08),
                    vy: -rand(10,16), t:0, glow:1 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!lan) return;
      try{
        const x = lan.x, y = lan.y, g = lan.glow;
        ctx.save();
        // warm halo
        ctx.globalAlpha = 0.22*g; ctx.fillStyle = '#ffca6b';
        ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill();
        // body
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(255,150,70,'+(0.55+0.35*g)+')';
        ctx.strokeStyle = '#b5641e'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x-6, y-7); ctx.lineTo(x+6, y-7);
        ctx.lineTo(x+7, y+6); ctx.lineTo(x-7, y+6); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // little flame glow at base
        ctx.globalAlpha = g; ctx.fillStyle = '#fff2b0';
        ctx.beginPath(); ctx.arc(x, y+3, 2.2, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!lan) return false;
      const cx = lan.x, cy = lan.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 28*28) return false;
      say(pick(['Up it goes 🏮 I tucked a wish for you inside',
                'A sky lantern 🏮 my hopes for you, floating up to the stars',
                'Watch it climb ✨ carrying how much I love you',
                'Make a wish and let go 🏮 I\'ll wish for more days with you']));
      fxAt(cx, cy-8, '🏮'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 2); refreshHUD();
      lan.vy *= 1.5;  // let it rise a touch faster after the wish
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   AUTUMN LEAF. On autumn/woodland scenes a single leaf spirals down on the
   breeze. Catch it before it lands for a cozy little wish.
   -------------------------------------------------------------------------- */
(function encAutumnLeaf(){
  try{
    const AUTUMNY = new Set(['autumnforest','mapleforest','orchard','cornmaze','pumpkinpatch','harvestbarn',
      'cidermill','coveredbridge','redwoods','birchgrove','mistyforest','sugarshack','cranberryharvest',
      'cranberrybog','wheatfield','vineyard','campsite','hedgemaze','treehouse','windmill']);
    const LEAFC = ['#d9772e','#c0392b','#e0a636','#a8531f','#cf6b3a'];
    let leaf = null, timer = 20 + Math.random()*38;
    function canHere(){ try{ return AUTUMNY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (leaf){
          leaf.t += dt;
          leaf.y += leaf.vy*dt;
          leaf.x += Math.sin(leaf.t*2.1)*26*dt + leaf.drift*dt;
          leaf.spin += dt*(2.4 + Math.sin(leaf.t*2.1));
          if (leaf.y > H*0.88) leaf = null;   // it settled — missed
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 28 + Math.random()*46;
          if (canHere()){
            leaf = { x: rand(W*0.2, W*0.8), y: -12, vy: rand(22,34), drift: rand(-14,14),
                     t:0, spin: rand(0,6), col: pick(LEAFC) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!leaf) return;
      try{
        ctx.save();
        ctx.translate(leaf.x, leaf.y); ctx.rotate(leaf.spin);
        ctx.fillStyle = leaf.col;
        ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(60,30,10,0.5)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 8); ctx.stroke();   // vein + stem
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!leaf) return false;
      const cx = leaf.x, cy = leaf.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['Caught it! 🍂 They say that\'s good luck — I say it\'s us',
                'A falling leaf 🍁 quick, a cozy wish, my love',
                'Sweater weather and you 🍂 my favorite season',
                'One perfect leaf, right into your hands 🥰🍁']));
      fxAt(cx, cy-6, '🍂'); burstAt('🍁', cx, cy); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); refreshHUD();
      leaf = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   TUMBLEWEED. On dry desert/canyon scenes a tumbleweed bounces across on the
   wind. Tap it as it rolls past for a playful, dusty little moment.
   -------------------------------------------------------------------------- */
(function encTumbleweed(){
  try{
    const DRY = new Set(['desert','desertoasis','sanddunes','canyon','savanna','prairiestorm','volcano',
      'geyser','wheatfield','cornmaze']);
    let tw = null, timer = 24 + Math.random()*42;
    function canHere(){ try{ return DRY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (tw){
          tw.t += dt; tw.x += tw.vx*dt;
          tw.hop = Math.abs(Math.sin(tw.t*4))*14;   // bouncing along the ground
          tw.spin += tw.vx*dt*0.09;
          if (tw.x < -30 || tw.x > W+30) tw = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 32 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            tw = { x: dir>0 ? -18 : W+18, groundY: H*0.8, hop:0,
                   vx: dir*rand(30,46), t:0, spin:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!tw) return;
      try{
        const x = tw.x, y = tw.groundY - tw.hop, R = 11;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(tw.spin);
        ctx.strokeStyle = 'rgba(150,120,70,0.85)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
        for (let i=0;i<7;i++){
          const a = i*0.9;
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.lineTo(Math.cos(a)*R, Math.sin(a)*R);
          ctx.lineTo(Math.cos(a+0.6)*R*0.7, Math.sin(a+0.6)*R*0.7); ctx.stroke();
        }
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!tw) return false;
      const cx = tw.x, cy = tw.groundY - tw.hop;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['Whoa, tumbleweed! 🌵 dusty out here without you',
                'Boing boing 🌾 catch it before it rolls to the horizon!',
                'Just us and the wide open road, cowgirl 🤠💕',
                'It rolled all this way just to say howdy 😄']));
      fxAt(cx, cy-8, '💨'); if (typeof sfx==='function') sfx('tap');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); refreshHUD();
      tw.vx *= 1.5;  // send it bouncing off with a laugh
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   KOI. On pond/water scenes a koi glides just under the surface and now and then
   dimples the water. Tap the ripple to say hello and feed it a crumb.
   -------------------------------------------------------------------------- */
(function encKoi(){
  try{
    const PONDY = new Set(['koipond','lotuspond','duckpond','waterlily','river','zengarden','teahouse',
      'watermill','marina','fishingdock','bamboo','bambootearoom','riceterraces','mossgarden',
      'lanternfestival','nightgarden','bonsaigarden']);
    const KOIC = ['#e8663a','#e0a03a','#d94f5c','#e8e0d0'];
    let koi = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return PONDY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (koi){
          koi.t += dt; koi.x += koi.vx*dt;
          koi.y = koi.baseY + Math.sin(koi.t*1.1)*10;
          koi.tail = Math.sin(koi.t*6)*0.4;
          koi.ripple = 0.5 + 0.5*Math.sin(koi.t*2.5);
          if (koi.x < -30 || koi.x > W+30) koi = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.70+Math.random()*0.08);
            koi = { x: dir>0 ? -22 : W+22, baseY: by, y: by, vx: dir*rand(14,22),
                    dir, t:0, tail:0, ripple:0, col: pick(KOIC) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!koi) return;
      try{
        const x = koi.x, y = koi.y, d = koi.dir;
        ctx.save();
        // surface ripple above the fish
        ctx.strokeStyle = 'rgba(255,255,255,'+(0.25*koi.ripple)+')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y-2, 12, 4, 0, 0, 7); ctx.stroke();
        // body (soft, seen through water)
        ctx.globalAlpha = 0.8; ctx.fillStyle = koi.col;
        ctx.beginPath(); ctx.ellipse(x, y, 11, 5, 0, 0, 7); ctx.fill();
        // tail
        ctx.beginPath();
        ctx.moveTo(x - d*10, y);
        ctx.lineTo(x - d*17, y - 4 + koi.tail*6);
        ctx.lineTo(x - d*17, y + 4 + koi.tail*6);
        ctx.closePath(); ctx.fill();
        // pale patch
        ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(x + d*3, y-1, 3, 2, 0, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!koi) return false;
      const cx = koi.x, cy = koi.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['A koi came to say hi 🐟 here, a little crumb for you',
                'Slow and graceful 🐟 like a quiet morning with you 💛',
                'Ooh, a lucky koi! ✨ they mean good fortune, my love',
                'She surfaced just for you 🥰 even the fish adore you']));
      fxAt(cx, cy-8, '💧'); burstAt('🐟', cx, cy); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 3); refreshHUD();
      koi = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SQUIRREL. On woodland/park scenes a squirrel scampers along the ground, pausing
   to nibble an acorn. Tap it before it dashes off for a bright-eyed little moment.
   -------------------------------------------------------------------------- */
(function encSquirrel(){
  try{
    const WOODSY = new Set(['autumnforest','mapleforest','redwoods','birchgrove','mistyforest','orchard',
      'backyard','campsite','treehouse','coveredbridge','pasture','hedgemaze','topiary','mossgarden',
      'cherryblossom','sakuratunnel','windmill','harvestbarn','alpinemeadow']);
    let sq = null, timer = 20 + Math.random()*38;
    function canHere(){ try{ return WOODSY.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (sq){
          sq.t += dt;
          if (sq.pause > 0){ sq.pause -= dt; sq.hop = 0; }
          else {
            sq.x += sq.vx*dt;
            sq.hop = Math.abs(Math.sin(sq.t*8))*7;   // scampering bounce
            if (Math.random() < 0.4*dt) sq.pause = rand(0.6, 1.4);  // stop to nibble
          }
          if (sq.x < -20 || sq.x > W+20) sq = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 28 + Math.random()*48;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            sq = { x: dir>0 ? -14 : W+14, groundY: H*0.8, hop:0, pause:0,
                   vx: dir*rand(22,34), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!sq) return;
      try{
        const x = sq.x, y = sq.groundY - sq.hop, d = sq.dir;
        ctx.save();
        ctx.fillStyle = '#a86b3c';
        // body
        ctx.beginPath(); ctx.ellipse(x, y, 8, 5, 0, 0, 7); ctx.fill();
        // head
        ctx.beginPath(); ctx.arc(x + d*7, y - 3, 4, 0, 7); ctx.fill();
        // ear
        ctx.beginPath(); ctx.moveTo(x + d*7, y-7); ctx.lineTo(x + d*8, y-11); ctx.lineTo(x + d*9, y-7); ctx.fill();
        // bushy tail (curled up behind)
        ctx.strokeStyle = '#8a5528'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - d*7, y);
        ctx.quadraticCurveTo(x - d*16, y - 2, x - d*13, y - 12);
        ctx.stroke();
        // eye
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(x + d*8, y - 4, 1, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!sq) return false;
      const cx = sq.x, cy = sq.groundY - sq.hop;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A squirrel! 🐿️ busy little thing — got a snack for us?',
                'Bright eyes and a big fluffy tail 🐿️ absolutely adorable',
                'He\'s stashing acorns for winter 🌰 planning ahead, like me with you',
                'Cheeks full and in a hurry 🐿️ you two would get along 😄']));
      fxAt(cx, cy-8, '🌰'); burstAt('🐿️', cx, cy); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); refreshHUD();
      sq = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   DANDELION SEED. On grassy/meadow scenes a dandelion puff drifts by on the
   breeze. Tap it to blow the seeds away and make a wish.
   -------------------------------------------------------------------------- */
(function encDandelion(){
  try{
    const GRASSY = new Set(['backyard','pasture','alpinemeadow','starrymeadow','wheatfield','kitehill',
      'lavender','poppyfield','tulipfield','sunflowers','sunflowermaze','orchard','vineyard','meadow',
      'hummingbirdgarden','peonygarden','campsite','riceterraces','teaplantation','cliffs']);
    let pf = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return GRASSY.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (pf){
          pf.t += dt;
          pf.x += pf.vx*dt + Math.sin(pf.t*0.9)*8*dt;
          pf.y += Math.sin(pf.t*1.4)*6*dt - 3*dt;   // drifts gently, slightly up
          if (pf.x < -20 || pf.x > W+20 || pf.y < H*0.2) pf = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            pf = { x: dir>0 ? -12 : W+12, y: H*(0.5+Math.random()*0.15), vx: dir*rand(12,20), t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!pf) return;
      try{
        const x = pf.x, y = pf.y;
        ctx.save();
        // stem
        ctx.strokeStyle = 'rgba(150,180,120,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y+2); ctx.lineTo(x-2, y+9); ctx.stroke();
        // puff filaments
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
        for (let i=0;i<12;i++){
          const a = (i/12)*Math.PI*2 + Math.sin(pf.t*2)*0.1;
          ctx.beginPath(); ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a)*6, y + Math.sin(a)*6); ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 1.4, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!pf) return false;
      const cx = pf.x, cy = pf.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 24*24) return false;
      say(pick(['Puff! 🌬️ make a wish, my love — I bet I can guess it',
                'A dandelion 🌼 close your eyes and blow — I wished for you',
                'There go the little seeds ✨ each one a hope for us',
                'Every wish I ever made on one of these came true when I found you 💛']));
      // scatter the seeds — capture coords first (pf may be nulled before timeouts fire)
      for (let i=0;i<4;i++) setTimeout(()=> fxAt(cx + rand(-18,18), cy - rand(0,16), '✨'), i*70);
      if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 2); refreshHUD();
      pf = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SEAGULL. On beach/coastal scenes a gull glides across the sky with slow wing
   beats, calling. Tap it as it passes for a breezy seaside moment.
   -------------------------------------------------------------------------- */
(function encSeagull(){
  try{
    const COASTAL = new Set(['beach','moonbeach','driftwoodbeach','marina','harbornight','lighthouse',
      'fishingdock','moonlitjetty','tidepools','cliffs','sanddunes','seasidecarousel','fireflypier',
      'icebergbay','tidalcave','rooftoppool','desertoasis']);
    let gull = null, timer = 24 + Math.random()*42;
    function canHere(){ try{ return COASTAL.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (gull){
          gull.t += dt; gull.x += gull.vx*dt;
          gull.y = gull.baseY + Math.sin(gull.t*0.6)*10;
          gull.flap = Math.sin(gull.t*3.2);
          if (gull.x < -40 || gull.x > W+40) gull = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 32 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.2+Math.random()*0.15);
            gull = { x: dir>0 ? -26 : W+26, baseY: by, y: by, vx: dir*rand(20,30), dir, t:0, flap:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!gull) return;
      try{
        const x = gull.x, y = gull.y, up = gull.flap*7;
        ctx.save();
        ctx.strokeStyle = '#f4f6f8'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x-11, y + up);
        ctx.quadraticCurveTo(x-4, y - 4, x, y);
        ctx.quadraticCurveTo(x+4, y - 4, x+11, y + up);
        ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!gull) return false;
      const cx = gull.x, cy = gull.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['A seagull! 🕊️ salt air, warm sun, and you — perfect',
                'Off it soars over the waves 🌊 wish I could bottle this day',
                'Cheeky thing — hide the fries! 🍟😄',
                'Free as anything up there 🕊️ but I\'d never fly from you 💗']));
      fxAt(cx, cy-8, '🕊️'); if (typeof sfx==='function') sfx('day');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); refreshHUD();
      gull.vx *= 1.4;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   BUMBLEBEE. On flowery/garden scenes a fuzzy bee bumbles from bloom to bloom,
   hovering with a busy little wobble. Tap it (gently!) for a sweet, honeyed wish.
   -------------------------------------------------------------------------- */
(function encBee(){
  try{
    const BLOOMY = new Set(['florist','flowermarket','greenhouse','tulipfield','lavender','poppyfield',
      'peonygarden','sunflowers','sunflowermaze','hummingbirdgarden','cherryblossom','citrusgrove',
      'beekeepergarden','orchard','vineyard','herbshed','sunroom','topiary','pasture','clover',
      'nursery','bonsaigarden','teaplantation']);
    let bee = null, timer = 18 + Math.random()*34;
    function canHere(){ try{ return BLOOMY.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bee){
          bee.t += dt; bee.life -= dt;
          bee.x += bee.vx*dt + Math.sin(bee.t*5)*10*dt;
          bee.y += Math.cos(bee.t*4)*12*dt;
          if (bee.y < H*0.4) bee.y = H*0.4; if (bee.y > H*0.75) bee.y = H*0.75;
          bee.wing = Math.abs(Math.sin(bee.t*18));
          if (bee.life <= 0 || bee.x < -20 || bee.x > W+20) bee = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 26 + Math.random()*44;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            bee = { x: dir>0 ? -14 : W+14, y: H*(0.5+Math.random()*0.18),
                    vx: dir*rand(12,20), t:0, wing:0, life: rand(9,15) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bee) return;
      try{
        const x = bee.x, y = bee.y;
        ctx.save();
        // wings
        ctx.globalAlpha = 0.5 + 0.3*bee.wing; ctx.fillStyle = '#e8f2ff';
        ctx.beginPath(); ctx.ellipse(x-2, y-5, 4, 2.5, -0.5, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+2, y-5, 4, 2.5, 0.5, 0, 7); ctx.fill();
        // body
        ctx.globalAlpha = 1; ctx.fillStyle = '#e8b53a';
        ctx.beginPath(); ctx.ellipse(x, y, 6, 4.5, 0, 0, 7); ctx.fill();
        // stripes
        ctx.strokeStyle = '#2a1c08'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x-2, y-4); ctx.lineTo(x-2, y+4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+2, y-4); ctx.lineTo(x+2, y+4); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bee) return false;
      const cx = bee.x, cy = bee.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 24*24) return false;
      say(pick(['A busy little bee 🐝 you\'re the sweetest thing in this garden',
                'Bzzz 🐝 off to make honey — nearly as sweet as you 🍯',
                'Hello, fuzzy friend 🐝 thank you for the flowers, my love',
                'She works so hard for a little sweetness 🍯 worth it, like us']));
      fxAt(cx, cy-8, '🍯'); burstAt('🐝', cx, cy); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 3); refreshHUD();
      bee = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SOAP BUBBLE. On spa/bath/cozy-water scenes a shimmering bubble drifts upward,
   catching rainbow light. Tap to pop it for a giggle and a soft wish.
   -------------------------------------------------------------------------- */
(function encBubble(){
  try{
    const SUDSY = new Set(['spa','hammam','hotspring','cavehotspring','rooftoppool','bamboo','bambootearoom',
      'aquarium','aquariumtunnel','jellyfishtank','kelpforest','coralreef','biobay','waterlily','pottery',
      'candyfactory','icecreamparlor','gelateria','sunroom','nursery','toyshop']);
    let bub = null, timer = 18 + Math.random()*34;
    function canHere(){ try{ return SUDSY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bub){
          bub.t += dt;
          bub.y += bub.vy*dt;
          bub.x += Math.sin(bub.t*1.6)*12*dt;
          bub.wob = 1 + Math.sin(bub.t*4)*0.08;
          if (bub.y < -20) bub = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 24 + Math.random()*42;
          if (canHere()){
            bub = { x: rand(W*0.2, W*0.8), y: H*(0.72+Math.random()*0.08),
                    vy: -rand(14,22), r: rand(8,14), t:0, wob:1 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bub) return;
      try{
        const x = bub.x, y = bub.y, r = bub.r*bub.wob;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = 'rgba(180,220,255,0.9)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
        // faint rainbow sheen
        ctx.globalAlpha = 0.18; ctx.fillStyle = '#d6b8ff';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        // highlight
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x - r*0.35, y - r*0.35, r*0.22, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bub) return false;
      const cx = bub.x, cy = bub.y, rr = bub.r*bub.wob + 6;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > rr*rr) return false;
      say(pick(['Pop! 🫧 got it — your giggle is my favorite sound',
                'A little rainbow bubble 🌈 delicate and lovely, like this moment',
                'Boop 🫧 I could watch these float with you all day',
                'Careful, it\'s fragile ✨ some things you just hold gently — like my heart with you']));
      // pop sparkle — capture coords first (bub may be null before timeouts fire)
      for (let i=0;i<3;i++) setTimeout(()=> fxAt(cx + rand(-12,12), cy + rand(-12,12), '🫧'), i*60);
      if (typeof sfx==='function') sfx('tap');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); refreshHUD();
      bub = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   BUNNY. On meadow/grassy/garden scenes a little rabbit hops across the ground,
   pausing to twitch its nose. Tap it before it bounds away for a soft, sweet moment.
   -------------------------------------------------------------------------- */
(function encBunny(){
  try{
    const GRASSY = new Set(['backyard','pasture','alpinemeadow','starrymeadow','kitehill','lavender',
      'poppyfield','tulipfield','sunflowers','sunflowermaze','clover','orchard','vineyard','topiary',
      'hedgemaze','cherryblossom','peonygarden','hummingbirdgarden','campsite','nursery','mossgarden']);
    let bun = null, timer = 20 + Math.random()*38;
    function canHere(){ try{ return GRASSY.has(SCENES[currentScene]) && !isNight(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (bun){
          bun.t += dt;
          if (bun.pause > 0){ bun.pause -= dt; bun.hop = 0; }
          else {
            bun.x += bun.vx*dt;
            bun.hop = Math.abs(Math.sin(bun.t*6))*16;   // big springy hops
            if (Math.random() < 0.4*dt) bun.pause = rand(0.7, 1.6);  // stop to sniff
          }
          if (bun.x < -20 || bun.x > W+20) bun = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            bun = { x: dir>0 ? -14 : W+14, groundY: H*0.8, hop:0, pause:0,
                    vx: dir*rand(24,36), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!bun) return;
      try{
        const x = bun.x, y = bun.groundY - bun.hop, d = bun.dir;
        ctx.save();
        ctx.fillStyle = '#e6ddd2';
        // body
        ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, 0, 7); ctx.fill();
        // head
        ctx.beginPath(); ctx.arc(x + d*7, y - 4, 4.5, 0, 7); ctx.fill();
        // ears
        ctx.beginPath(); ctx.ellipse(x + d*6, y - 12, 2, 6, -d*0.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + d*9, y - 12, 2, 6, d*0.2, 0, 7); ctx.fill();
        // tail
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x - d*8, y + 1, 3, 0, 7); ctx.fill();
        // eye
        ctx.fillStyle = '#2a1c14';
        ctx.beginPath(); ctx.arc(x + d*8, y - 5, 1, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!bun) return false;
      const cx = bun.x, cy = bun.groundY - bun.hop;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 28*28) return false;
      say(pick(['A bunny! 🐰 look at that twitchy little nose — melting 🥰',
                'So soft and shy 🐰 come here, sweet thing',
                'Hop hop hop 🐇 she\'s as cute as you, and that\'s saying a lot',
                'A wild rabbit trusted us 🐰 lucky, lucky day 💗']));
      fxAt(cx, cy-10, '🐰'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      bun = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   FROG. On pond/lily scenes a frog sits on a lily pad, then springs across with
   a plop. Tap it for a cheerful ribbit and a lucky little wish.
   -------------------------------------------------------------------------- */
(function encFrog(){
  try{
    const PONDY = new Set(['koipond','lotuspond','duckpond','waterlily','river','bayou','zengarden',
      'watermill','riceterraces','mossgarden','bamboo','bambootearoom','willowispmarsh','fairyring',
      'greenhouse','tidepools','cranberrybog']);
    let frog = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return PONDY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (frog){
          frog.t += dt;
          if (frog.wait > 0){ frog.wait -= dt; frog.hop = 0; }
          else {
            frog.x += frog.vx*dt;
            frog.hop = Math.sin(Math.min(Math.PI, frog.leap*Math.PI))*22;
            frog.leap += dt*1.4;
            if (frog.leap >= 1){ frog.leap = 0; frog.wait = rand(1.0, 2.2); }  // land, rest
          }
          if (frog.x < -20 || frog.x > W+20) frog = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            frog = { x: dir>0 ? -14 : W+14, groundY: H*0.78, hop:0, wait: rand(0.4,1.0),
                     leap:0, vx: dir*rand(20,30), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!frog) return;
      try{
        const x = frog.x, y = frog.groundY - frog.hop, d = frog.dir;
        ctx.save();
        // lily pad shadow when resting
        if (frog.hop < 2){
          ctx.fillStyle = 'rgba(60,120,70,0.5)';
          ctx.beginPath(); ctx.ellipse(x, frog.groundY + 5, 13, 4, 0, 0, 7); ctx.fill();
        }
        ctx.fillStyle = '#5fae4e';
        // body
        ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, 0, 7); ctx.fill();
        // eyes on top
        ctx.beginPath(); ctx.arc(x - d*3, y - 6, 2.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + d*3, y - 6, 2.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(x - d*3, y - 6, 1, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + d*3, y - 6, 1, 0, 7); ctx.fill();
        // back legs
        ctx.strokeStyle = '#4a9640'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - d*6, y+3); ctx.lineTo(x - d*10, y+5); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!frog) return false;
      const cx = frog.x, cy = frog.groundY - frog.hop;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 28*28) return false;
      say(pick(['Ribbit! 🐸 a frog on a lily pad — kiss it and see? 😘',
                'Plop! 🐸 he\'s showing off his jumps for you',
                'A little green friend 🐸 they say it means happy rain and luck',
                'Silly hoppy thing 🐸 you\'d name him in two seconds, I know you 🥰']));
      fxAt(cx, cy-10, '🐸'); burstAt('💚', cx, cy); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); refreshHUD();
      frog = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   COMET. On space/observatory/night scenes a comet drifts slowly across the sky,
   trailing a long glowing tail. Tap it to make a big, once-in-a-lifetime wish.
   -------------------------------------------------------------------------- */
(function encComet(){
  try{
    const SPACEY = new Set(['observatory','planetarium','planetlab','aurora','moontemple','starrymeadow',
      'nightgarden','rooftop','rooftoppool','moonlitjetty','moonbeach','harbornight','skygondola',
      'wizardtower','runecircle','arcanelibrary','mountain','alpinemeadow','campsite']);
    let com = null, timer = 34 + Math.random()*54;
    function nightish(){ try{ return typeof isNight==='function' ? isNight() : (currentHour() >= 19 || currentHour() < 6); }catch(e){ return true; } }
    function canHere(){ try{ const s = SCENES[currentScene]; if (!SPACEY.has(s)) return false;
      // always-dark scenes read fine by day; outdoor ones need night
      const alwaysDark = (s==='observatory'||s==='planetarium'||s==='planetlab'||s==='aurora'||
        s==='wizardtower'||s==='runecircle'||s==='arcanelibrary'||s==='moontemple');
      return alwaysDark || nightish(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (com){
          com.t += dt; com.x += com.vx*dt; com.y += com.vy*dt;
          com.glow = 0.7 + 0.3*Math.sin(com.t*4);
          if (com.x < -60 || com.x > W+60) com = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 46 + Math.random()*66;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const sy = H*(0.1+Math.random()*0.14);
            com = { x: dir>0 ? -34 : W+34, y: sy, vx: dir*rand(26,40), vy: rand(4,10),
                    dir, t:0, glow:1, len: rand(40,60) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!com) return;
      try{
        const x = com.x, y = com.y, d = com.dir, g = com.glow;
        const tx = x - d*com.len, ty = y - com.len*0.18;
        ctx.save();
        const grad = ctx.createLinearGradient(x, y, tx, ty);
        grad.addColorStop(0, 'rgba(180,220,255,'+(0.85*g)+')');
        grad.addColorStop(1, 'rgba(180,220,255,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
        // glowing head
        ctx.globalAlpha = 0.3*g; ctx.fillStyle = '#dff0ff';
        ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!com) return false;
      const cx = com.x, cy = com.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 32*32) return false;
      say(pick(['A comet! ☄️ it won\'t pass again for ages — wish big, my love',
                'Once in a lifetime, and we caught it together ☄️💫',
                'Whole galaxies out there, and I only want this — you 💗',
                'Make the biggest wish you\'ve got ☄️ I\'ll spend my life helping it come true']));
      fxAt(cx, cy-10, '☄️'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 3); refreshHUD();
      com = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   MOTH. On night scenes with lamps/glow a moth flutters in loopy circles, drawn
   to the light. Tap it gently to guide it back out into the soft dark.
   -------------------------------------------------------------------------- */
(function encMoth(){
  try{
    const LAMPLIT = new Set(['nightmarket','lanternfestival','harbornight','rainystreet','cafe','diner',
      'ramenshop','sushibar','jazzclub','trainstation','lighthouse','campsite','porch','nightgarden',
      'fireflypier','moonlitjetty','witchcottage','fortuneteller','streetlamp','rooftop']);
    let moth = null, timer = 20 + Math.random()*38;
    function nightish(){ try{ return typeof isNight==='function' ? isNight() : (currentHour() >= 19 || currentHour() < 6); }catch(e){ return true; } }
    function canHere(){ try{ return LAMPLIT.has(SCENES[currentScene]) && nightish(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (moth){
          moth.t += dt; moth.life -= dt;
          // loopy orbit around a drifting center
          moth.cx += moth.vx*dt;
          moth.x = moth.cx + Math.cos(moth.t*3)*moth.r;
          moth.y = moth.cy + Math.sin(moth.t*3)*moth.r*0.6;
          moth.flap = Math.abs(Math.sin(moth.t*16));
          if (moth.life <= 0 || moth.cx < -20 || moth.cx > W+20) moth = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 28 + Math.random()*46;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            moth = { cx: dir>0 ? 20 : W-20, cy: H*(0.35+Math.random()*0.2), r: rand(14,24),
                     vx: dir*rand(8,14), x:0, y:0, t:0, flap:0, life: rand(9,15) };
            moth.x = moth.cx; moth.y = moth.cy;
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!moth) return;
      try{
        const x = moth.x, y = moth.y, w = 6 - moth.flap*3;
        ctx.save();
        ctx.fillStyle = '#cbb89a';
        // wings (fold with flap)
        ctx.beginPath(); ctx.ellipse(x-3, y, w, 5, 0.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x+3, y, w, 5, -0.4, 0, 7); ctx.fill();
        // body
        ctx.strokeStyle = '#5a4a38'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y-4); ctx.lineTo(x, y+4); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!moth) return false;
      const cx = moth.x, cy = moth.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 24*24) return false;
      say(pick(['A little moth 🦋 chasing the light — I know the feeling, I chase you',
                'There, out you go 🌙 soft wings, gentle hands',
                'Drawn to the glow 🕯️ same way I\'m drawn to your smile',
                'Shoo, sweet thing 🌙 the porch light will keep till morning']));
      fxAt(cx, cy-6, '🌙'); if (typeof sfx==='function') sfx('tap');
      state.love = clamp(state.love + 3); state.fun = clamp(state.fun + 3); refreshHUD();
      moth = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   PAPER AIRPLANE. On indoor/study/playful scenes a folded paper plane glides in
   on a gentle arc. Tap it to catch it — there's a tiny love note on the wing.
   -------------------------------------------------------------------------- */
(function encPaperPlane(){
  try{
    const INDOORSY = new Set(['library','artstudio','musicroom','sciencelab','classroom','comicshop',
      'toyshop','arcade','trainroom','papercraftstudio','recordingstudio','cartographer','escaperoom',
      'planetlab','chesshall','bowling','nursery','sewingstudio','clockmaker','optician','naturalhistory']);
    let plane = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return INDOORSY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (plane){
          plane.t += dt; plane.x += plane.vx*dt;
          plane.y = plane.baseY + Math.sin(plane.t*1.3)*18;   // gentle gliding swoops
          plane.tilt = Math.cos(plane.t*1.3)*0.22 * (plane.dir>0?1:-1);
          if (plane.x < -30 || plane.x > W+30) plane = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.35+Math.random()*0.15);
            plane = { x: dir>0 ? -20 : W+20, baseY: by, y: by, vx: dir*rand(26,40), dir, t:0, tilt:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!plane) return;
      try{
        const x = plane.x, y = plane.y, d = plane.dir;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(plane.tilt); ctx.scale(d, 1);
        ctx.fillStyle = '#f7f2e6'; ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1;
        // top wing
        ctx.beginPath(); ctx.moveTo(-12, -5); ctx.lineTo(12, 0); ctx.lineTo(-12, 2); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // lower wing (shaded fold)
        ctx.fillStyle = '#e6ddca';
        ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(12, 0); ctx.lineTo(-12, 6); ctx.closePath();
        ctx.fill(); ctx.stroke();
        // center crease
        ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(12, 0); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!plane) return false;
      const cx = plane.x, cy = plane.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['Caught it! ✈️ unfold it — "I love you," it says (I wrote it)',
                'A paper plane, flown just to you 💌 mind the landing!',
                'There\'s a note on the wing 📝 "thinking of you, always"',
                'Whoosh 🛩️ every one of these is me sending love across the room']));
      fxAt(cx, cy-8, '💌'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      plane = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   COCOA STEAM HEART. On cozy warm scenes a curl of steam rises and, for a moment,
   forms a little heart. Tap the heart before it fades for a snug, loving wish.
   -------------------------------------------------------------------------- */
(function encCocoaHeart(){
  try{
    const COZY = new Set(['cafe','diner','bakery','chocolateshop','snowycabin','winterchalet','skilodge',
      'library','teahouse','bambootearoom','ramenshop','gingerbreadkitchen','sugarshack','cidermill',
      'igloo','winecellar','cheesecave','spa','hammam','hotspring','cavehotspring','sunroom','ballroom']);
    let steam = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return COZY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (steam){
          steam.t += dt;
          steam.y -= steam.vy*dt;
          steam.sway = Math.sin(steam.t*2)*6;
          // heart is "formed" and tappable during the middle of its rise
          steam.formed = steam.t > 1.0 && steam.t < 3.2;
          if (steam.t > 4 || steam.y < H*0.2) steam = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            steam = { x: rand(W*0.3, W*0.7), y: H*0.62, vy: rand(16,24), t:0, sway:0, formed:false };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!steam) return;
      try{
        const x = steam.x + steam.sway, y = steam.y;
        ctx.save();
        if (steam.formed){
          // draw a soft steam heart
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = 'rgba(255,240,235,0.8)';
          const s = 5;
          ctx.beginPath();
          ctx.moveTo(x, y + s*0.7);
          ctx.bezierCurveTo(x - s*1.6, y - s*0.4, x - s*0.4, y - s*1.4, x, y - s*0.5);
          ctx.bezierCurveTo(x + s*0.4, y - s*1.4, x + s*1.6, y - s*0.4, x, y + s*0.7);
          ctx.fill();
        } else {
          // wispy rising curl
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = 'rgba(255,245,240,0.8)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y+6);
          ctx.quadraticCurveTo(x+5, y, x, y-6);
          ctx.quadraticCurveTo(x-5, y-12, x, y-16);
          ctx.stroke();
        }
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!steam || !steam.formed) return false;
      const cx = steam.x + steam.sway, cy = steam.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 22*22) return false;
      say(pick(['Aww, a heart in the steam 💗 warm hands, warm hearts',
                'Even the cocoa\'s in love with you today ☕💕',
                'Cupped mug, cozy blanket, you 🥰 my whole heart',
                'It rose up just to say what I always feel — I love you ☕']));
      fxAt(cx, cy-6, '💗'); hearts(); if (typeof sfx==='function') sfx('hug');
      state.love = clamp(state.love + 5); state.energy = clamp(state.energy + 2); refreshHUD();
      steam = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   FLOATING FEATHER. On breezy/bird scenes a soft feather see-saws down through
   the air. Catch it before it lands for a light, tender little wish.
   -------------------------------------------------------------------------- */
(function encFeather(){
  try{
    const AIRY = new Set(['aviary','petshop','backyard','beach','pasture','alpinemeadow','kitehill',
      'cliffs','lighthouse','marina','rooftop','rooftoppool','birchgrove','treehouse','campsite',
      'butterflydome','greenhouse','sunroom','balloonfest','balloonride','skygondola','windmill']);
    const FC = ['#f4f0e6','#e8dfff','#dfeeff','#ffe9ef'];
    let fea = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return AIRY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (fea){
          fea.t += dt;
          fea.y += fea.vy*dt;
          fea.x += Math.sin(fea.t*1.5)*30*dt;      // wide see-saw drift
          fea.rot = Math.sin(fea.t*1.5)*0.7;
          if (fea.y > H*0.86) fea = null;           // landed — missed
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            fea = { x: rand(W*0.2, W*0.8), y: -12, vy: rand(16,26), t:0, rot:0, col: pick(FC) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!fea) return;
      try{
        ctx.save();
        ctx.translate(fea.x, fea.y); ctx.rotate(fea.rot);
        // quill
        ctx.strokeStyle = 'rgba(120,100,80,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
        // vane
        ctx.fillStyle = fea.col;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.quadraticCurveTo(6, -2, 0, 9);
        ctx.quadraticCurveTo(-6, -2, 0, -9);
        ctx.fill();
        // barb lines
        ctx.strokeStyle = 'rgba(150,140,130,0.5)'; ctx.lineWidth = 0.6;
        for (let i=-6;i<=6;i+=3){
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo((i<0? -1:1)* (4-Math.abs(i)*0.3), i+2); ctx.stroke();
        }
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!fea) return false;
      const cx = fea.x, cy = fea.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['Caught it! 🪶 a stray feather — they say an angel passed by',
                'So light it\'s barely there 🪶 tuck it somewhere to remember today',
                'A little wish on a feather 🕊️ soft as how I feel about you',
                'Right into your hand 🪶 like it was always meant for you 💗']));
      fxAt(cx, cy-6, '🪶'); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 2); refreshHUD();
      fea = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   HEDGEHOG. On autumn/woodland scenes a little hedgehog trundles along the ground,
   snuffling. Tap it before it curls away for a prickly-but-sweet moment.
   -------------------------------------------------------------------------- */
(function encHedgehog(){
  try{
    const WOODSY = new Set(['autumnforest','mapleforest','redwoods','birchgrove','mistyforest','orchard',
      'backyard','campsite','treehouse','coveredbridge','pumpkinpatch','harvestbarn','cornmaze',
      'hedgemaze','mossgarden','herbshed','cidermill','windmill','pasture']);
    let hog = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return WOODSY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (hog){
          hog.t += dt;
          if (hog.pause > 0){ hog.pause -= dt; hog.bob = Math.sin(hog.t*8)*0.6; }
          else {
            hog.x += hog.vx*dt;
            hog.bob = Math.sin(hog.t*10)*1.2;
            if (Math.random() < 0.35*dt) hog.pause = rand(0.6, 1.3);  // snuffle stop
          }
          if (hog.x < -20 || hog.x > W+20) hog = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            hog = { x: dir>0 ? -14 : W+14, groundY: H*0.81, bob:0, pause:0,
                    vx: dir*rand(16,26), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!hog) return;
      try{
        const x = hog.x, y = hog.groundY + hog.bob, d = hog.dir;
        ctx.save();
        // spiky back
        ctx.fillStyle = '#7a5c40';
        ctx.beginPath(); ctx.ellipse(x, y, 9, 6, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#4d3824'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (let i=-6;i<=6;i+=2.5){
          ctx.beginPath(); ctx.moveTo(x - d*i*0.6, y - 4); ctx.lineTo(x - d*i*0.6 - d*1.5, y - 9); ctx.stroke();
        }
        // face
        ctx.fillStyle = '#d8c2a6';
        ctx.beginPath(); ctx.ellipse(x + d*8, y + 1, 4, 3.5, 0, 0, 7); ctx.fill();
        // nose + eye
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(x + d*11, y + 1, 1.3, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + d*7, y - 1, 1, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!hog) return false;
      const cx = hog.x, cy = hog.groundY + hog.bob;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A hedgehog! 🦔 prickly outside, soft little heart — reminds me of no one 😄',
                'Snuffle snuffle 🦔 the most determined tiny creature',
                'He\'s hunting for beetles under the leaves 🍂 mind the spikes!',
                'Aww, he unrolled just for you 🦔 he can tell you\'re kind 💛']));
      fxAt(cx, cy-10, '🦔'); burstAt('🍂', cx, cy); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); refreshHUD();
      hog = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   WILL-O'-WISP. On marsh/fairy/enchanted scenes a pale teal spirit-flame bobs
   and drifts low over the ground. Tap it to make a quiet, mysterious wish.
   -------------------------------------------------------------------------- */
(function encWisp(){
  try{
    const ENCHANTED = new Set(['willowispmarsh','fairyring','bayou','mistyforest','mushroomglade',
      'runecircle','witchcottage','moontemple','crystalcave','cavehotspring','tidalcave','nightgarden',
      'wizardtower','arcanelibrary','enchantedmirrorhall','bamboo','redwoods','mossgarden']);
    let wisp = null, timer = 22 + Math.random()*40;
    function darkish(){ try{ const s = SCENES[currentScene];
      const alwaysDark = (s==='crystalcave'||s==='tidalcave'||s==='cavehotspring'||s==='wizardtower'||
        s==='arcanelibrary'||s==='enchantedmirrorhall'||s==='runecircle'||s==='moontemple'||s==='witchcottage');
      if (alwaysDark) return true;
      return typeof isNight==='function' ? isNight() : (currentHour() >= 18.5 || currentHour() < 6);
    }catch(e){ return true; } }
    function canHere(){ try{ return ENCHANTED.has(SCENES[currentScene]) && darkish(); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (wisp){
          wisp.t += dt; wisp.life -= dt;
          wisp.x += wisp.vx*dt + Math.sin(wisp.t*0.8)*10*dt;
          wisp.y = wisp.baseY + Math.sin(wisp.t*1.6)*14;
          wisp.glow = 0.55 + 0.45*Math.sin(wisp.t*2.2);
          if (wisp.life <= 0 || wisp.x < -20 || wisp.x > W+20) wisp = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.6+Math.random()*0.12);
            wisp = { x: dir>0 ? -12 : W+12, baseY: by, y: by, vx: dir*rand(8,14),
                     t:0, glow:1, life: rand(10,16) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!wisp) return;
      try{
        const x = wisp.x, y = wisp.y, g = wisp.glow;
        ctx.save();
        ctx.globalAlpha = 0.25*g; ctx.fillStyle = '#6bffd0';
        ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill();
        ctx.globalAlpha = 0.6*g; ctx.fillStyle = '#a6ffe6';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
        ctx.globalAlpha = 0.95; ctx.fillStyle = '#eafff8';
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!wisp) return false;
      const cx = wisp.x, cy = wisp.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A will-o\'-wisp 🪷 old tales say to follow — but I\'d only follow you',
                'A little spirit-light ✨ make a secret wish, my love',
                'Careful, they lead wanderers astray 💚 good thing I\'m already home, with you',
                'Cool and glowing 🌫️ the marsh is full of quiet magic tonight']));
      fxAt(cx, cy-8, '✨'); burstAt('💚', cx, cy); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); refreshHUD();
      wisp = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   CRAB. On beach/shore scenes a little crab scuttles sideways across the sand,
   claws up. Tap it before it burrows for a cheeky seaside moment.
   -------------------------------------------------------------------------- */
(function encCrab(){
  try{
    const SHORE = new Set(['beach','moonbeach','driftwoodbeach','tidepools','sanddunes','marina',
      'fishingdock','lighthouse','tidalcave','biobay','coralreef','harbornight','moonlitjetty',
      'seasidecarousel','fireflypier']);
    let crab = null, timer = 22 + Math.random()*40;
    function canHere(){ try{ return SHORE.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (crab){
          crab.t += dt;
          if (crab.pause > 0){ crab.pause -= dt; }
          else {
            crab.x += crab.vx*dt;
            if (Math.random() < 0.4*dt) crab.pause = rand(0.4, 1.0);  // freeze, claws up
          }
          crab.legw = Math.sin(crab.t*14);
          crab.claw = 0.5 + 0.5*Math.sin(crab.t*4);
          if (crab.x < -18 || crab.x > W+18) crab = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 30 + Math.random()*48;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            crab = { x: dir>0 ? -12 : W+12, groundY: H*0.82, pause:0, legw:0, claw:0,
                     vx: dir*rand(20,32), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!crab) return;
      try{
        const x = crab.x, y = crab.groundY, d = crab.dir;
        ctx.save();
        ctx.fillStyle = '#e0603c';
        // shell
        ctx.beginPath(); ctx.ellipse(x, y, 8, 5, 0, 0, 7); ctx.fill();
        // legs
        ctx.strokeStyle = '#c04e2e'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (let i=-1;i<=1;i++){
          const off = crab.legw*2;
          ctx.beginPath(); ctx.moveTo(x + i*4, y+3); ctx.lineTo(x + i*4 - 4, y+7+off); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + i*4, y+3); ctx.lineTo(x + i*4 + 4, y+7-off); ctx.stroke();
        }
        // claws (raised)
        const cl = 4 + crab.claw*3;
        ctx.strokeStyle = '#e0603c'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(x - 7, y-2); ctx.lineTo(x - 11, y - cl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 7, y-2); ctx.lineTo(x + 11, y - cl); ctx.stroke();
        ctx.fillStyle = '#e0603c';
        ctx.beginPath(); ctx.arc(x - 11, y - cl, 2.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 11, y - cl, 2.2, 0, 7); ctx.fill();
        // eyes on stalks
        ctx.strokeStyle = '#c04e2e'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x-2, y-4); ctx.lineTo(x-2, y-8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+2, y-4); ctx.lineTo(x+2, y-8); ctx.stroke();
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(x-2, y-8, 1.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x+2, y-8, 1.2, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!crab) return false;
      const cx = crab.x, cy = crab.groundY - 4;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A little crab! 🦀 sideways and sassy — I love him',
                'Claws up! 🦀 don\'t worry, he\'s all bluff, like a grump who adores you',
                'Scuttle scuttle 🦀 quick, before he digs in!',
                'He waved a claw at you 🦀 that\'s crab for "hello, gorgeous" 😄']));
      fxAt(cx, cy-8, '🦀'); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); refreshHUD();
      crab = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   LEAPING FISH. On river/waterfall/lake scenes a fish arcs up out of the water,
   catches the light, and splashes back. Tap it at the top of its jump for luck.
   -------------------------------------------------------------------------- */
(function encLeapingFish(){
  try{
    const RIVERY = new Set(['river','waterfall','frozenfalls','watermill','marina','fishingdock',
      'moonlitjetty','harbornight','bayou','riceterraces','cliffs','geyser','watermill','koipond',
      'lotuspond','duckpond','tidalcave']);
    let fish = null, timer = 24 + Math.random()*42;
    function canHere(){ try{ return RIVERY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (fish){
          fish.t += dt;
          // parabolic arc: p in [0,1]
          fish.p += dt / fish.dur;
          fish.x = fish.x0 + fish.dx*fish.p;
          fish.y = fish.waterY - Math.sin(fish.p*Math.PI)*fish.height;
          fish.ang = Math.cos(fish.p*Math.PI) * -1.1 * (fish.dx>0?1:-1);
          if (fish.p >= 1){
            const sx = fish.x, sy = fish.waterY;               // capture before nulling
            for (let i=0;i<3;i++) setTimeout(()=> fxAt(sx + rand(-10,10), sy - rand(0,8), '💧'), i*50);
            fish = null;
          }
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 32 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const wy = H*(0.7+Math.random()*0.05);
            fish = { x0: rand(W*0.25, W*0.75), waterY: wy, dx: dir*rand(50,90),
                     height: rand(60,90), dur: rand(1.1,1.5), p:0, x:0, y:wy, ang:0, t:0, dir };
            fish.x = fish.x0;
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!fish) return;
      try{
        const x = fish.x, y = fish.y, d = fish.dir;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(fish.ang); ctx.scale(d, 1);
        ctx.fillStyle = '#8fb8c8';
        // body
        ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.5, 0, 0, 7); ctx.fill();
        // tail
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-14, -4); ctx.lineTo(-14, 4); ctx.closePath(); ctx.fill();
        // belly sheen
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.ellipse(1, 1.5, 5, 2, 0, 0, 7); ctx.fill();
        // eye
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(5, -1, 1, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!fish) return false;
      const cx = fish.x, cy = fish.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['Caught it mid-jump! 🐟 they say a leaping fish is a wish granted',
                'Splash! 🐟 nature showing off, just for you',
                'Silver flash in the sun ✨ blink and you\'d miss it — but you didn\'t',
                'Up he goes! 🐟 chasing something better — I already caught mine 💗']));
      fxAt(cx, cy-8, '✨'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 4); refreshHUD();
      fish = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   MAPLE SEED. On woodland/autumn scenes a winged maple seed (samara) twirls down
   like a tiny helicopter. Catch it before it lands for a whimsical little wish.
   -------------------------------------------------------------------------- */
(function encMapleSeed(){
  try{
    const TREEY = new Set(['mapleforest','autumnforest','redwoods','birchgrove','mistyforest','orchard',
      'backyard','coveredbridge','treehouse','campsite','cherryblossom','sakuratunnel','windmill',
      'hedgemaze','pasture','sugarshack','cidermill','bonsaigarden']);
    let seed = null, timer = 20 + Math.random()*38;
    function canHere(){ try{ return TREEY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (seed){
          seed.t += dt;
          seed.y += seed.vy*dt;
          seed.x += Math.sin(seed.t*2.4)*20*dt + seed.drift*dt;
          seed.spin += dt*14;                     // fast helicopter spin
          if (seed.y > H*0.86) seed = null;        // landed — missed
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 28 + Math.random()*46;
          if (canHere()){
            seed = { x: rand(W*0.2, W*0.8), y: -12, vy: rand(18,28), drift: rand(-12,12),
                     t:0, spin: rand(0,6) };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!seed) return;
      try{
        ctx.save();
        ctx.translate(seed.x, seed.y); ctx.rotate(seed.spin);
        // seed pod
        ctx.fillStyle = '#9a6a3c';
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
        // wing
        ctx.fillStyle = 'rgba(200,170,110,0.85)';
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.quadraticCurveTo(14, -3, 16, 2);
        ctx.quadraticCurveTo(12, 4, 2, 2);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(140,110,60,0.6)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(3, 0.5); ctx.lineTo(15, 1.5); ctx.stroke();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!seed) return false;
      const cx = seed.x, cy = seed.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A helicopter seed! 🍁 we used to throw these as kids — catch, my love',
                'Twirling all the way down 🚁 nature\'s little confetti',
                'Caught it! 🌱 plant it and watch it grow — like us, a bit more each year',
                'Round and round it spun, right to you 🍁 whimsical thing 🥰']));
      fxAt(cx, cy-6, '🍁'); if (typeof sfx==='function') sfx('find');
      state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); refreshHUD();
      seed = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SWAN. On calm pond/lake scenes a swan glides serenely across the water. Tap it
   to watch it dip and preen — a graceful, tender moment about lasting love.
   -------------------------------------------------------------------------- */
(function encSwan(){
  try{
    const CALM = new Set(['duckpond','koipond','lotuspond','waterlily','river','marina','zengarden',
      'watermill','riceterraces','moonlitjetty','harbornight','lighthouse','icepond','waterfall',
      'lanternfestival','nightgarden','bambootearoom']);
    let swan = null, timer = 26 + Math.random()*44;
    function canHere(){ try{ return CALM.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (swan){
          swan.t += dt; swan.x += swan.vx*dt;
          swan.y = swan.baseY + Math.sin(swan.t*0.7)*3;
          swan.neck = Math.sin(swan.t*0.9)*0.15;
          if (swan.x < -34 || swan.x > W+34) swan = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 36 + Math.random()*54;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            const by = H*(0.68+Math.random()*0.06);
            swan = { x: dir>0 ? -26 : W+26, baseY: by, y: by, vx: dir*rand(10,16), dir, t:0, neck:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!swan) return;
      try{
        const x = swan.x, y = swan.y, d = swan.dir;
        ctx.save();
        // reflection ripple
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y+7, 16, 4, 0, 0, 7); ctx.stroke();
        // body
        ctx.fillStyle = '#fbfbfb';
        ctx.beginPath(); ctx.ellipse(x, y, 13, 7, 0, 0, 7); ctx.fill();
        // raised tail
        ctx.beginPath(); ctx.moveTo(x - d*11, y-2); ctx.lineTo(x - d*18, y-7); ctx.lineTo(x - d*11, y+2); ctx.fill();
        // curved neck
        ctx.strokeStyle = '#fbfbfb'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const nx = x + d*10, ny = y - 3;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.quadraticCurveTo(nx + d*8, ny - 12 + swan.neck*10, nx + d*4, ny - 18);
        ctx.stroke();
        // head + beak
        ctx.fillStyle = '#fbfbfb';
        ctx.beginPath(); ctx.arc(nx + d*4, ny - 19, 3.2, 0, 7); ctx.fill();
        ctx.fillStyle = '#e8973a';
        ctx.beginPath(); ctx.moveTo(nx + d*6, ny-19); ctx.lineTo(nx + d*10, ny-18); ctx.lineTo(nx + d*6, ny-17); ctx.fill();
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(nx + d*5, ny-20, 0.9, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!swan) return false;
      const cx = swan.x, cy = swan.y - 8;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 34*34) return false;
      say(pick(['A swan 🦢 they mate for life, you know — I understand them completely',
                'So graceful it hurts 🦢 all calm on top, paddling like mad beneath — relatable 😄',
                'Look how serene 🤍 this is the kind of quiet I want a lifetime of, with you',
                'She dipped her head like a little bow 🦢 even she thinks you\'re royalty']));
      fxAt(cx, cy-8, '🦢'); hearts(); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 5); state.energy = clamp(state.energy + 2); refreshHUD();
      swan = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SNAIL. On garden/greenhouse/mossy scenes a snail inches along a leaf, feelers
   waving. Tap it (no rush!) for a slow-down-and-savor-the-moment wish.
   -------------------------------------------------------------------------- */
(function encSnail(){
  try{
    const LEAFY = new Set(['greenhouse','mossgarden','herbshed','nursery','florist','flowermarket',
      'bonsaigarden','sunroom','zengarden','bamboo','bambootearoom','mushroomglade','fairyring',
      'orchard','vineyard','peonygarden','topiary','mistyforest','redwoods','tulipfield']);
    let snail = null, timer = 24 + Math.random()*42;
    function canHere(){ try{ return LEAFY.has(SCENES[currentScene]); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (snail){
          snail.t += dt; snail.x += snail.vx*dt;    // very slow
          snail.feel = Math.sin(snail.t*2)*0.3;
          snail.glide = Math.sin(snail.t*6)*0.6;
          if (snail.x < -16 || snail.x > W+16) snail = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 32 + Math.random()*50;
          if (canHere()){
            const dir = Math.random() < 0.5 ? 1 : -1;
            snail = { x: dir>0 ? -12 : W+12, groundY: H*0.8, feel:0, glide:0,
                      vx: dir*rand(4,8), dir, t:0 };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!snail) return;
      try{
        const x = snail.x, y = snail.groundY + snail.glide, d = snail.dir;
        ctx.save();
        // foot
        ctx.fillStyle = '#d8b98a';
        ctx.beginPath(); ctx.ellipse(x, y+3, 10, 3, 0, 0, 7); ctx.fill();
        // head/neck
        ctx.beginPath(); ctx.ellipse(x + d*9, y, 4, 3, 0, 0, 7); ctx.fill();
        // shell (spiral)
        ctx.fillStyle = '#c98a54';
        ctx.beginPath(); ctx.arc(x - d*2, y - 3, 7, 0, 7); ctx.fill();
        ctx.strokeStyle = '#8a5a2e'; ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let a=0;a<8;a+=0.3){ const r=a*0.9; const px2=x - d*2 + Math.cos(a*d)*r, py2=y-3 + Math.sin(a)*r; if(a===0) ctx.moveTo(px2,py2); else ctx.lineTo(px2,py2); }
        ctx.stroke();
        // feelers
        ctx.strokeStyle = '#d8b98a'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + d*11, y-1); ctx.lineTo(x + d*13 + d*snail.feel*3, y-7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + d*12, y-1); ctx.lineTo(x + d*15 + d*snail.feel*3, y-5); ctx.stroke();
        ctx.fillStyle = '#20130a';
        ctx.beginPath(); ctx.arc(x + d*13 + d*snail.feel*3, y-7, 1, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!snail) return false;
      const cx = snail.x, cy = snail.groundY - 3;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 26*26) return false;
      say(pick(['A snail 🐌 no rush, little one — the best days are the slow ones with you',
                'He carries his whole home on his back 🐌 as long as I\'m with you, I\'m home too',
                'Slow and steady 🐌 that\'s us — no hurry, we\'ve got forever',
                'Feelers up, saying hello 🐌 take your time, sweetheart, so will I 💛']));
      fxAt(cx, cy-8, '🐌'); if (typeof sfx==='function') sfx('find');
      state.love = clamp(state.love + 3); state.energy = clamp(state.energy + 3); refreshHUD();
      snail = null;
      return true;
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   SPARKLER. On festival/celebration scenes a hand-held sparkler crackles to life,
   throwing golden sparks. Tap it to write your initials in the air together.
   -------------------------------------------------------------------------- */
(function encSparkler(){
  try{
    const PARTY = new Set(['fireworks','lanternfestival','carnival','nightmarket','balloonfest','ferriswheel',
      'seasidecarousel','fairyring','harbornight','rooftop','rooftoppool','campsite','ballroom',
      'giftwrapshop','moonbeach','fireflypier']);
    let sp = null, timer = 24 + Math.random()*42;
    function nightish(){ try{ return typeof isNight==='function' ? isNight() : (currentHour() >= 19 || currentHour() < 6); }catch(e){ return true; } }
    function canHere(){ try{ const s = SCENES[currentScene];
      const alwaysOk = (s==='fireworks'||s==='lanternfestival'||s==='nightmarket'||s==='ballroom'||s==='ferriswheel');
      return PARTY.has(s) && (alwaysOk || nightish()); }catch(e){ return false; } }
    EXTRA_UPDATERS.push(function(dt){
      try{
        if (sp){
          sp.t += dt; sp.life -= dt;
          sp.sway = Math.sin(sp.t*1.5)*8;
          // spawn sparks
          sp.spawn -= dt;
          if (sp.spawn <= 0){ sp.spawn = 0.04; sp.sparks.push({ a: Math.random()*7, r:0, sp: rand(20,55), life: rand(0.3,0.6), t:0 }); }
          for (let i=sp.sparks.length-1;i>=0;i--){ const k=sp.sparks[i]; k.t+=dt; k.r+=k.sp*dt; if(k.t>=k.life) sp.sparks.splice(i,1); }
          if (sp.life <= 0) sp = null;
          return;
        }
        timer -= dt;
        if (timer <= 0){
          timer = 34 + Math.random()*52;
          if (canHere()){
            sp = { x: rand(W*0.3,W*0.7), y: H*(0.5+Math.random()*0.1), sway:0,
                   t:0, life: rand(5,8), spawn:0, sparks:[] };
          }
        }
      }catch(e){}
    });
    EXTRA_DRAWERS.push(function(){
      if (!sp) return;
      try{
        const x = sp.x + sp.sway, y = sp.y;
        ctx.save();
        // stick
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 18); ctx.stroke();
        // sparks
        for (const k of sp.sparks){
          const a = 1 - k.t/k.life;
          const sx = x + Math.cos(k.a)*k.r, sy = y + Math.sin(k.a)*k.r;
          ctx.globalAlpha = a;
          ctx.fillStyle = k.r < 12 ? '#fffde0' : (Math.random()<0.5 ? '#ffd24a' : '#ff9a3a');
          ctx.beginPath(); ctx.arc(sx, sy, 1.3, 0, 7); ctx.fill();
        }
        // hot core
        ctx.globalAlpha = 1; ctx.fillStyle = '#fffef0';
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
        ctx.restore();
      }catch(e){}
    });
    EXTRA_TAPS.push(function(px, py){
      if (!sp) return false;
      const cx = sp.x + sp.sway, cy = sp.y;
      const dx = px - cx, dy = py - cy;
      if (dx*dx + dy*dy > 30*30) return false;
      say(pick(['A sparkler! ✨ quick, write our initials in the air before it fades',
                'Golden and fizzing 🎇 hold it high, my love — happy birthday 🥳',
                'Careful, it\'s hot! 🔥 but so worth it — look at your face glow',
                'Round and round — I drew a heart 💛 did you see it?']));
      // little burst of sparks on tap — capture coords first
      for (let i=0;i<5;i++) setTimeout(()=> fxAt(cx + rand(-16,16), cy + rand(-16,10), pick(['✨','🎇','💛'])), i*60);
      if (typeof sfx==='function') sfx('day');
      state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 3); refreshHUD();
      sp = null;
      return true;
    });
  }catch(e){}
})();

/* extras: add-on features  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */
/*
  This file is the home for new self-contained features. It loads after everything
  except main.js (boot), so all core globals/functions are available.

  Extension points (defined in engine.js), so features never need to edit the core loop:
    EXTRA_UPDATERS.push(fn)  // fn(dt) runs every frame
    EXTRA_DRAWERS.push(fn)   // fn() draws over the scene every frame (canvas ctx, W×H)
    EXTRA_TAPS.push(fn)      // fn(px,py) on a stage tap; return true to consume it

  Handy globals: pet, state, clamp, pick, rand, say, hearts, burst, fxAt, sfx,
  showToast, isNight, currentHour, SCENES, currentScene, refreshHUD, save.
  Keep each feature additive and low-risk. Warm, personal tone (a gift for Krystal, from Paul).
*/

/* ============================================================================
   FEATURES (Thread A). Each is a self-contained IIFE, prefixed to avoid clashes,
   and wrapped defensively so a hiccup in one never disturbs the core game.
   ========================================================================== */

function fxNowSec(){ try{ return (performance && performance.now ? performance.now() : Date.now())/1000; }catch(e){ return Date.now()/1000; } }

/* ----------------------------------------------------------------------------
   1) BLOW A KISS  —  double-tap on/near her to send a kiss floating up.
   She blushes and warms a little. A single tap is left untouched, so the
   existing hug/nuzzle and walk-to-spot behaviours keep working exactly as before.
   -------------------------------------------------------------------------- */
(function fxKissFeature(){
  try{
    const kisses = [];              // drifting kiss particles (canvas)
    const WINDOW = 0.36;            // seconds allowed between the two taps
    let lastT = 0, lastX = 0, lastY = 0, reactCd = 0;

    function nearHer(px, py){
      try{
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        const cx = pet.x, cy = pet.y - h*0.5;          // roughly her upper body
        const dx = (px - cx) / 84;                     // generous oval around her
        const dy = (py - cy) / (h*0.62);
        return dx*dx + dy*dy <= 1;
      }catch(e){ return false; }
    }

    function spawnKiss(){
      try{
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        const mx = pet.x + rand(-6,6), my = pet.y - h*0.58;   // from around her face
        for (let i=0;i<3;i++){
          kisses.push({
            x: mx + rand(-6,6), y: my + rand(-4,4),
            vx: rand(-10,10), vy: rand(-30,-46),
            t: 0, life: rand(1.1,1.5),
            ch: pick(['💋','💋','💗']), rot: rand(-0.3,0.3), rv: rand(-0.6,0.6),
          });
          if (kisses.length > 24) kisses.shift();
        }
      }catch(e){}
    }

    EXTRA_UPDATERS.push(function(dt){
      if (reactCd > 0) reactCd -= dt;
      for (let i=kisses.length-1;i>=0;i--){
        const k = kisses[i];
        k.t += dt;
        k.x += k.vx*dt; k.y += k.vy*dt; k.vy *= 0.985; k.rot += k.rv*dt;
        if (k.t >= k.life) kisses.splice(i,1);
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!kisses.length) return;
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const k of kisses){
        const p = k.t / k.life;
        ctx.globalAlpha = Math.max(0, Math.min(1, (1-p) * 1.4));
        const size = 16 + p*8;
        ctx.font = size + 'px serif';
        ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot);
        ctx.fillText(k.ch, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (typeof pet === 'undefined') return false;
        if (pet.resting || pet.animLock > 0) return false;
        if (!nearHer(px, py)) return false;                 // only care about taps by her
        const now = fxNowSec();
        const quick = (now - lastT) <= WINDOW;
        const close = Math.hypot(px - lastX, py - lastY) < 64;
        lastT = now; lastX = px; lastY = py;
        if (quick && close){
          lastT = 0;                                        // reset so a 3rd tap won't chain
          spawnKiss();
          if (typeof sfx === 'function') sfx('hug');
          try{ pet.blush = Math.min(2.4, (pet.blush||0) + 1.6); }catch(e){}
          if (reactCd <= 0){                                // gate the reward/speech, not the sparkle
            reactCd = 1.4;
            try{ state.love = clamp(state.love + 4); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
            if (typeof say === 'function') say(pick(['Mwah! 💋','A kiss for me? 🥰','I love you too 💗','Oh, you 😊']));
          }
          return true;                                      // consume this (second) tap
        }
        return false;                                       // first tap: leave default behaviour alone
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   2) SEASONAL MOTES  —  a whisper of ambient particles keyed to the real month.
   Spring petals, summer fireflies, autumn leaves, winter snow. Kept very sparse
   and low-alpha so the scene never feels cluttered. Fireflies glow warmer at night.
   -------------------------------------------------------------------------- */
(function fxSeasonMotes(){
  try{
    function season(){
      const m = new Date().getMonth();                      // 0=Jan
      if (m>=2 && m<=4)  return 'spring';
      if (m>=5 && m<=7)  return 'summer';
      if (m>=8 && m<=10) return 'autumn';
      return 'winter';
    }
    const CFG = {
      spring: { count:9,  kind:'emoji', chars:['🌸','🌸','🌼'], size:[10,15], fall:[8,16],  sway:[10,20], alpha:0.55 },
      summer: { count:4,  kind:'glow',  color:'255,236,140',   size:[1.6,3.0], drift:[6,14], alpha:0.26 },
      autumn: { count:8,  kind:'emoji', chars:['🍂','🍁','🍂'], size:[11,16], fall:[10,20], sway:[14,26], alpha:0.6 },
      winter: { count:12, kind:'snow',  color:'255,255,255',   size:[1.2,2.6], fall:[8,18],  sway:[8,16],  alpha:0.75 },
    };
    let key = season(), cfg = CFG[key];
    const parts = [];
    let reseason = 0;

    function make(seed){
      const s = cfg;
      return {
        x: rand(0, W),
        y: seed ? rand(0, H) : -rand(4, 30),
        r: rand(s.size[0], s.size[1]),
        vy: rand((s.fall||s.drift)[0], (s.fall||s.drift)[1]),
        sway: rand((s.sway||[6,12])[0], (s.sway||[6,12])[1]),
        phase: rand(0, Math.PI*2),
        spin: rand(-0.8, 0.8), rot: rand(0, Math.PI*2),
        ch: s.chars ? pick(s.chars) : null,
        tw: rand(0.6, 1.6),                                   // firefly twinkle rate
      };
    }
    for (let i=0;i<cfg.count;i++) parts.push(make(true));

    EXTRA_UPDATERS.push(function(dt){
      reseason -= dt;
      if (reseason <= 0){                                     // re-check the month rarely (cheap)
        reseason = 30;
        const k = season();
        if (k !== key){ key = k; cfg = CFG[key]; parts.length = 0; for (let i=0;i<cfg.count;i++) parts.push(make(true)); }
      }
      for (const p of parts){
        p.phase += dt * (p.sway ? 0.7 : 1.0);
        p.rot += p.spin * dt;
        if (cfg.kind === 'glow'){
          // fireflies wander gently in both axes
          p.x += Math.cos(p.phase*0.8) * p.sway * dt;
          p.y += Math.sin(p.phase*0.6) * p.sway * dt * 0.6 + Math.sin(p.phase) * 4 * dt;
        } else {
          p.y += p.vy * dt;
          p.x += Math.sin(p.phase) * (p.sway||0) * dt;
        }
        // recycle when it leaves the frame
        if (cfg.kind === 'glow'){
          if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
          if (p.y < -10) p.y = H+10; if (p.y > H+10) p.y = -10;
        } else if (p.y > H + 12){
          const n = make(false); Object.assign(p, n);
        }
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!parts.length) return;
      ctx.save();
      if (cfg.kind === 'emoji'){
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const p of parts){
          ctx.globalAlpha = cfg.alpha;
          ctx.font = p.r + 'px serif';
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillText(p.ch, 0, 0);
          ctx.restore();
        }
      } else if (cfg.kind === 'snow'){
        ctx.fillStyle = 'rgba(' + cfg.color + ',1)';
        for (const p of parts){
          ctx.globalAlpha = cfg.alpha;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        }
      } else { // glow (fireflies) — only after dark, so they never wash over daytime scenes
        const night = (typeof isNight === 'function') && isNight();
        if (!night){ ctx.restore(); return; }
        for (const p of parts){
          const tw = 0.45 + 0.55 * (0.5 + 0.5*Math.sin(p.phase * p.tw * 3));
          const a = cfg.alpha * tw * (night ? 1.0 : 0.55);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
          g.addColorStop(0, 'rgba(' + cfg.color + ',' + a.toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + cfg.color + ',0)');
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r*4, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(' + cfg.color + ',' + Math.min(1,a+0.2).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        }
      }
      ctx.restore();
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   3) DRIFTING BALLOON  —  now and then a little heart balloon rises across the
   scene. Tap it to pop it for a small burst of fun + confetti. Purely optional
   delight; if left alone it simply drifts off the top and fades.
   -------------------------------------------------------------------------- */
(function fxBalloon(){
  try{
    const COLORS = ['#ff8fab','#ffd166','#8ad3ff','#c8a2ff','#9be59b','#ff9e7a'];
    let b = null;                                            // at most one balloon at a time
    let spawnT = rand(14, 26);

    function spawn(){
      const col = pick(COLORS);
      b = {
        x: rand(W*0.2, W*0.8),
        y: H + 30,
        rx: 15, ry: 19,
        vy: rand(20, 30),
        sway: rand(8, 16), phase: rand(0, Math.PI*2),
        color: col, popped: false,
      };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!b){
        spawnT -= dt;
        if (spawnT <= 0){ spawnT = rand(22, 46); spawn(); }
        return;
      }
      b.phase += dt;
      b.y -= b.vy * dt;
      b.x += Math.sin(b.phase) * b.sway * dt;
      if (b.y < -40) b = null;                               // drifted away untouched
    });

    EXTRA_DRAWERS.push(function(){
      if (!b) return;
      ctx.save();
      const x = b.x, y = b.y;
      // string
      ctx.strokeStyle = 'rgba(120,120,120,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y + b.ry);
      ctx.quadraticCurveTo(x + Math.sin(b.phase*1.6)*4, y + b.ry + 12, x, y + b.ry + 22);
      ctx.stroke();
      // body
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.ellipse(x, y, b.rx, b.ry, 0, 0, 7); ctx.fill();
      // little knot
      ctx.beginPath(); ctx.moveTo(x-3, y+b.ry); ctx.lineTo(x+3, y+b.ry); ctx.lineTo(x, y+b.ry+4); ctx.closePath(); ctx.fill();
      // soft highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(x - b.rx*0.35, y - b.ry*0.35, b.rx*0.28, b.ry*0.32, -0.5, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!b) return false;
        const dx = (px - b.x) / (b.rx + 8);                  // a forgiving hit area
        const dy = (py - b.y) / (b.ry + 8);
        if (dx*dx + dy*dy > 1) return false;
        // pop!
        const x = b.x, y = b.y; b = null;
        if (typeof sfx === 'function') sfx('find');
        try{ state.fun = clamp(state.fun + 6); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        if (typeof burstAt === 'function'){
          burstAt('🎉', x, y); burstAt(pick(['🎊','✨','🎈']), x + rand(-10,10), y + rand(-6,6));
        } else if (typeof fxAt === 'function'){
          for (let i=0;i<4;i++) setTimeout(()=> fxAt(x+rand(-16,16), y+rand(-10,10), pick(['🎉','🎊','✨'])), i*70);
        }
        spawnT = rand(24, 48);
        return true;                                         // consume the pop tap
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 2). Appended below the round-1 set; unrelated to and
   non-overlapping with the kiss / motes / balloon features above.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   4) COMPANION BUTTERFLY  —  a gentle butterfly flutters about the upper scene,
   pausing now and then. Tap it for a little cheer (a wink of fun + love). It
   keeps to the sky/mid area so it never obscures her, and drifts on its own.
   -------------------------------------------------------------------------- */
(function fxButterfly(){
  try{
    const WINGS = pick(['#ff9ec4','#ffd27a','#a9c8ff','#c8a2ff','#ffb08a']);
    const bf = {
      x: rand(W*0.2, W*0.8), y: rand(H*0.18, H*0.42),
      tx: rand(W*0.2, W*0.8), ty: rand(H*0.18, H*0.42),
      phase: rand(0,Math.PI*2), flap: rand(9,12),
      retarget: rand(2,4), speed: rand(22,34), dir: 1,
    };
    let cheerCd = 0;

    EXTRA_UPDATERS.push(function(dt){
      if (cheerCd > 0) cheerCd -= dt;
      bf.phase += dt * bf.flap;
      bf.retarget -= dt;
      if (bf.retarget <= 0){
        bf.retarget = rand(2.2, 4.5);
        bf.tx = rand(W*0.14, W*0.86);
        bf.ty = rand(H*0.16, H*0.5);
      }
      const dx = bf.tx - bf.x, dy = bf.ty - bf.y;
      const d = Math.hypot(dx, dy) || 1;
      const step = bf.speed * dt;
      if (d > 2){
        bf.x += dx/d * step + Math.sin(bf.phase*0.5) * 8 * dt;   // fluttery wobble
        bf.y += dy/d * step + Math.cos(bf.phase*0.7) * 6 * dt;
        bf.dir = dx >= 0 ? 1 : -1;
      }
    });

    EXTRA_DRAWERS.push(function(){
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(bf.phase));   // 0.35 (closed) .. 1 (open)
      ctx.save();
      ctx.translate(bf.x, bf.y);
      ctx.scale(bf.dir, 1);
      // body
      ctx.fillStyle = '#5a463a';
      ctx.beginPath(); ctx.ellipse(0, 0, 1.4, 5, 0, 0, 7); ctx.fill();
      // wings (upper + lower, each side) — squished horizontally by the flap
      ctx.fillStyle = WINGS;
      ctx.globalAlpha = 0.92;
      for (const sx of [-1, 1]){
        ctx.beginPath(); ctx.ellipse(sx*4.5*flap, -2.2, 4.2*flap, 3.2, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(sx*3.6*flap,  2.6, 3.2*flap, 2.6, 0, 0, 7); ctx.fill();
      }
      // antennae
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#5a463a'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(0,-4); ctx.quadraticCurveTo(2,-8, 3.5,-8.5); ctx.moveTo(0,-4); ctx.quadraticCurveTo(-2,-8, -3.5,-8.5); ctx.stroke();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (Math.hypot(px - bf.x, py - bf.y) > 16) return false;
        // little cheer, gently rate-limited
        if (typeof burstAt === 'function') burstAt(pick(['🦋','✨','💛']), bf.x, bf.y);
        else if (typeof fxAt === 'function') fxAt(bf.x, bf.y-4, '🦋');
        if (cheerCd <= 0){
          cheerCd = 2.2;
          try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          if (typeof sfx === 'function') sfx('tap');
          if (typeof say === 'function') say(pick(['A butterfly! 🦋','So pretty 🥰','Hello, little one ✨','It likes you 💛']));
        }
        // dart away after being tapped
        bf.tx = rand(W*0.14, W*0.86); bf.ty = rand(H*0.14, H*0.34); bf.retarget = rand(2,3.5);
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   5) WISHING COMET  —  once in a while after dark, a bright comet arcs across the
   sky. Tap it while it flies to make a wish: a sparkle blooms and she warms a
   little. If untouched it simply sails on. Distinct from the core shooting star
   (that one is purely decorative) — this one is catchable.
   -------------------------------------------------------------------------- */
(function fxWishComet(){
  try{
    let comet = null;
    let timer = rand(25, 50);

    function spawn(){
      const fromLeft = Math.random() < 0.5;
      const y0 = rand(H*0.05, H*0.22);
      comet = {
        x: fromLeft ? -20 : W+20,
        y: y0,
        vx: (fromLeft ? 1 : -1) * rand(70, 100),
        vy: rand(16, 30),
        life: 0, max: rand(2.4, 3.4),
        wished: false,
      };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!comet){
        timer -= dt;
        if (timer <= 0){
          timer = rand(45, 90);
          if (typeof isNight === 'function' && isNight() && !(pet && pet.resting)) spawn();
        }
        return;
      }
      comet.life += dt;
      comet.x += comet.vx * dt;
      comet.y += comet.vy * dt;
      if (comet.life >= comet.max || comet.x < -40 || comet.x > W+40 || comet.y > H*0.6) comet = null;
    });

    EXTRA_DRAWERS.push(function(){
      if (!comet) return;
      const dirx = comet.vx >= 0 ? 1 : -1;
      const tailLen = 26;
      const tx = comet.x - dirx * tailLen, ty = comet.y - comet.vy/ (Math.abs(comet.vx)||1) * tailLen;
      ctx.save();
      // tail
      const grad = ctx.createLinearGradient(comet.x, comet.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,235,0.9)');
      grad.addColorStop(1, 'rgba(255,255,235,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(tx, ty); ctx.stroke();
      // glowing head
      const g = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 8);
      g.addColorStop(0, 'rgba(255,255,245,1)');
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(comet.x, comet.y, 8, 0, 7); ctx.fill();
      ctx.fillStyle = '#fffef2';
      ctx.beginPath(); ctx.arc(comet.x, comet.y, 2.2, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!comet || comet.wished) return false;
        if (Math.hypot(px - comet.x, py - comet.y) > 22) return false;  // forgiving, it moves fast
        comet.wished = true;
        const cx = comet.x, cy = comet.y;
        comet = null;
        if (typeof fxAt === 'function'){
          for (let i=0;i<5;i++) setTimeout(()=> fxAt(cx+rand(-14,14), cy+rand(-10,10), pick(['✨','🌟','💫','💛'])), i*70);
        }
        if (typeof sfx === 'function') sfx('find');
        try{ state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        if (typeof say === 'function') say(pick(['I wished for us 💫','Make a wish… ✨','Caught it! 🌟','My wish came true — you 🥰']));
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   6) CONTENTED HUMMING  —  when she's genuinely happy and idle, every so often a
   tiny music note or soft smile drifts up. Kept rarer than the core idle bubbles
   and only when her mood is high, so it never competes with them.
   -------------------------------------------------------------------------- */
(function fxHum(){
  try{
    let t = rand(12, 20);
    EXTRA_UPDATERS.push(function(dt){
      t -= dt;
      if (t > 0) return;
      t = rand(16, 26);                                        // deliberately infrequent
      try{
        if (!pet || pet.moving || pet.resting || pet.animLock > 0) return;
        if (typeof isCrying === 'function' && isCrying()) return;
        if (typeof speech !== 'undefined' && speech.classList && speech.classList.contains('show')) return;
        const mood = (typeof moodScore === 'function') ? moodScore() : 60;
        if (mood < 78) return;                                 // only when she's really content
        if (Math.random() < 0.4) return;                       // and only sometimes even then
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        if (typeof fxAt === 'function'){
          fxAt(pet.x + rand(-8,8), pet.y - h*0.95, pick(['♪','🎵','😊','🎶']));
        }
      }catch(e){}
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 3). Appended below rounds 1-2; none duplicate the
   kiss / motes / balloon / butterfly / comet / humming features.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   7) TIME-OF-DAY LIGHT LEAK  —  a barely-there foreground wash of soft bokeh that
   shifts with the clock: warm gold at dawn, gentle at midday, rosy at dusk, cool
   blue at night. Alpha is tiny by design so it only adds depth, never haze.
   -------------------------------------------------------------------------- */
(function fxLightLeak(){
  try{
    // a few slow-drifting bokeh orbs, seeded once
    const orbs = [];
    for (let i=0;i<5;i++){
      orbs.push({ bx: rand(0.08,0.92), by: rand(0.05,0.5), r: rand(24,52), ph: rand(0,Math.PI*2), sp: rand(0.05,0.12) });
    }
    let t = 0;
    function palette(){
      const h = (typeof currentHour === 'function') ? currentHour() : new Date().getHours();
      if (h >= 5 && h < 8)   return { c:'255,205,120', a:0.075 };   // dawn — warm gold
      if (h >= 8 && h < 17)  return { c:'255,244,220', a:0.045 };   // day  — soft cream
      if (h >= 17 && h < 20) return { c:'255,170,150', a:0.075 };   // dusk — rosy
      return { c:'150,180,255', a:0.06 };                            // night — cool blue
    }
    EXTRA_UPDATERS.push(function(dt){ t += dt; });
    EXTRA_DRAWERS.push(function(){
      const pal = palette();
      ctx.save();
      for (const o of orbs){
        const x = (o.bx * W) + Math.sin(t*o.sp + o.ph) * 10;
        const y = (o.by * H) + Math.cos(t*o.sp*0.8 + o.ph) * 8;
        const a = pal.a * (0.65 + 0.35*Math.sin(t*0.5 + o.ph));      // gentle breathing
        const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
        g.addColorStop(0, 'rgba(' + pal.c + ',' + Math.max(0,a).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + pal.c + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, o.r, 0, 7); ctx.fill();
      }
      ctx.restore();
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   8) JOY RAINBOW  —  when her fun is brimming, a soft rainbow eases in across the
   top of the scene, then fades away again as the moment passes. Low overall
   opacity so it reads as a happy shimmer, not a solid band.
   -------------------------------------------------------------------------- */
(function fxRainbow(){
  try{
    const BANDS = ['255,120,120','255,180,110','255,235,130','150,220,150','130,190,255','160,150,240','210,150,230'];
    let alpha = 0;
    EXTRA_UPDATERS.push(function(dt){
      let target = 0;
      // only when fun is truly brimming, and only in daylight (a rainbow is a sky thing)
      try{ const day = !((typeof isNight === 'function') && isNight()); target = (day && state && state.fun >= 99) ? 1 : 0; }catch(e){}
      // ease toward target so it drifts in/out gently
      alpha += (target - alpha) * Math.min(1, dt * 0.7);
    });
    EXTRA_DRAWERS.push(function(){
      if (alpha < 0.01) return;
      const cx = W*0.5, cy = H*0.98, r0 = W*0.60;              // centre low so the arc curves over the top
      ctx.save();
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i=0;i<BANDS.length;i++){
        ctx.strokeStyle = 'rgba(' + BANDS[i] + ',' + (0.08 * alpha).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(cx, cy, r0 - i*5, Math.PI*1.02, Math.PI*1.98); ctx.stroke();
      }
      ctx.restore();
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   9) CATCH A GLIMMER  —  now and then a single catchable glimmer drifts through
   (a firefly after dark, a floating leaf by day). Tap it to catch it; a little
   keepsake badge in the corner keeps count. Purely optional, gently rewarding.
   -------------------------------------------------------------------------- */
(function fxCatch(){
  try{
    const KEY = 'bpet_fx_caught';
    let count = 0;
    try{ const r = localStorage.getItem(KEY); if (r) count = parseInt(r,10) || 0; }catch(e){}

    // small keepsake badge appended to the stage (never edits the HTML)
    let badge = null;
    function ensureBadge(){
      try{
        if (badge) return badge;
        const host = document.getElementById('stagewrap') || document.getElementById('game');
        if (!host) return null;
        badge = document.createElement('div');
        badge.id = 'fxCatchBadge';
        badge.style.cssText = [
          'position:absolute','left:8px','bottom:8px','z-index:6','pointer-events:none',
          'font:600 12px system-ui,sans-serif','color:#fff',
          'background:rgba(0,0,0,0.32)','padding:3px 8px','border-radius:12px',
          'backdrop-filter:blur(2px)','opacity:0','transition:opacity .4s','user-select:none',
        ].join(';');
        host.appendChild(badge);
        return badge;
      }catch(e){ return null; }
    }
    function refreshBadge(flash){
      const b = ensureBadge(); if (!b) return;
      b.textContent = '✨ ' + count + ' caught';
      b.style.opacity = count > 0 ? '0.9' : '0';
      if (flash){
        b.style.transform = 'scale(1.18)';
        setTimeout(()=>{ try{ b.style.transform = 'scale(1)'; }catch(e){} }, 160);
      }
    }
    // show existing tally once the DOM is ready
    setTimeout(()=> refreshBadge(false), 400);

    let glimmer = null;
    let timer = rand(18, 34);
    function isNightNow(){ try{ return typeof isNight === 'function' && isNight(); }catch(e){ return false; } }
    function spawn(){
      const night = isNightNow();
      glimmer = {
        x: rand(W*0.14, W*0.86), y: rand(H*0.2, H*0.5),
        tx: rand(W*0.14, W*0.86), ty: rand(H*0.18, H*0.5),
        ph: rand(0,Math.PI*2), life: 0, max: rand(8, 12),
        night, retarget: rand(1.6, 3),
      };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!glimmer){
        timer -= dt;
        if (timer <= 0){ timer = rand(28, 55); if (!(pet && pet.resting)) spawn(); }
        return;
      }
      const gm = glimmer;
      gm.life += dt; gm.ph += dt; gm.retarget -= dt;
      if (gm.retarget <= 0){ gm.retarget = rand(1.8,3.2); gm.tx = rand(W*0.12,W*0.88); gm.ty = rand(H*0.16,H*0.52); }
      const dx = gm.tx-gm.x, dy = gm.ty-gm.y, d = Math.hypot(dx,dy)||1;
      const step = 20*dt;
      gm.x += dx/d*step + Math.sin(gm.ph*0.9)*6*dt;
      gm.y += dy/d*step + Math.cos(gm.ph*0.7)*5*dt;
      if (gm.life >= gm.max) glimmer = null;                    // drifts off if not caught
    });

    EXTRA_DRAWERS.push(function(){
      if (!glimmer) return;
      const gm = glimmer;
      ctx.save();
      if (gm.night){
        const tw = 0.5 + 0.5*Math.sin(gm.ph*4);
        const g = ctx.createRadialGradient(gm.x, gm.y, 0, gm.x, gm.y, 11);
        g.addColorStop(0, 'rgba(255,240,150,' + (0.85*tw+0.1).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,240,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gm.x, gm.y, 11, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,250,200,0.95)';
        ctx.beginPath(); ctx.arc(gm.x, gm.y, 2.4, 0, 7); ctx.fill();
      } else {
        ctx.globalAlpha = 0.9;
        ctx.font = '15px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.save(); ctx.translate(gm.x, gm.y); ctx.rotate(Math.sin(gm.ph)*0.5);
        ctx.fillText('🍃', 0, 0); ctx.restore();
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!glimmer) return false;
        if (Math.hypot(px - glimmer.x, py - glimmer.y) > 18) return false;
        const gx = glimmer.x, gy = glimmer.y, wasNight = glimmer.night;
        glimmer = null;
        count++;
        try{ localStorage.setItem(KEY, String(count)); }catch(e){}
        refreshBadge(true);
        if (typeof fxAt === 'function'){
          for (let i=0;i<4;i++) setTimeout(()=> fxAt(gx+rand(-12,12), gy+rand(-8,8), wasNight ? pick(['✨','🌟','💛']) : pick(['🍃','🌿','✨'])), i*70);
        }
        if (typeof sfx === 'function') sfx('find');
        try{ state.fun = clamp(state.fun + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        if (typeof say === 'function') say(pick(['Caught one! ✨','Ooh, got it! 🥰','For you 💛','A little treasure 🌟']));
        timer = rand(30, 60);
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 4). Interactive / contained — no new always-on
   overlays. Objects appear only occasionally and clear themselves.
   ========================================================================== */

/* small shared helper: send her walking to a floor spot (mirrors tapScene). */
function fxWalkHerTo(px, py){
  try{
    pet.tx = Math.max(W*0.14, Math.min(W*0.86, px));
    pet.ty = Math.max(H*0.66, Math.min(H*0.82, py));
    pet.dir = (px < pet.x) ? 'left' : 'right';
    pet.wanderTimer = rand(4, 6);        // don't wander off immediately
  }catch(e){}
}

/* ----------------------------------------------------------------------------
   10) PLAY BALL  —  every so often a little ball rolls to a stop on the floor.
   Tap it to toss it; she trots over and plays, delighted. Only one at a time,
   and it clears itself, so nothing lingers on screen.
   -------------------------------------------------------------------------- */
(function fxBall(){
  try{
    let ball = null;                     // {x,y,vx,r,spin,rot,ttl}
    let timer = rand(40, 75);
    const FLOOR = () => rand(H*0.70, H*0.80);

    function spawn(){
      ball = { x: rand(W*0.24, W*0.76), y: FLOOR(), vx: 0, r: 8, spin: 0, rot: 0, ttl: 16, playCd: 0 };
    }
    function toss(){
      const dir = (Math.random() < 0.5 ? -1 : 1);
      ball.vx = dir * rand(70, 120);
      ball.spin = dir * rand(6, 10);
      ball.ttl = 16;                     // refresh its patience when played with
      fxWalkHerTo(ball.x + dir*40, ball.y);   // she heads toward where it's rolling
      if (typeof sfx === 'function') sfx('tap');
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!ball){
        timer -= dt;
        if (timer <= 0){ timer = rand(55, 95); if (!(pet && pet.resting) && !(pet && pet.animLock>0)) spawn(); }
        return;
      }
      const b = ball;
      b.ttl -= dt;
      if (Math.abs(b.vx) > 1){
        b.x += b.vx * dt; b.vx *= 0.94; b.rot += b.spin * dt * (b.vx>=0?1:1);
        if (b.x < W*0.12){ b.x = W*0.12; b.vx = Math.abs(b.vx)*0.5; }
        if (b.x > W*0.88){ b.x = W*0.88; b.vx = -Math.abs(b.vx)*0.5; }
        fxWalkHerTo(b.x, b.y);           // keep leading her to the ball
      } else { b.vx = 0; }
      // reached and settled? she plays.
      if (b.vx === 0 && b.playCd <= 0){
        const near = Math.hypot(pet.x - b.x, pet.y - b.y) < 30;
        if (near){
          b.playCd = 1;
          try{ state.fun = clamp(state.fun + 6); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          if (typeof burstAt === 'function') burstAt(pick(['⚽','🎾','✨']), b.x, b.y-6);
          if (typeof say === 'function') say(pick(['Wheee! ⚽','Again, again!','Got it! 🥰','So much fun! 🎾']));
          if (typeof sfx === 'function') sfx('find');
          ball = null;                   // she caught it; tidy up
          timer = rand(45, 80);
          return;
        }
      }
      if (b.playCd > 0) b.playCd -= dt;
      if (b.ttl <= 0) ball = null;       // ignored too long — it rolls away
    });

    EXTRA_DRAWERS.push(function(){
      if (!ball) return;
      const b = ball;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath(); ctx.ellipse(b.x, b.y+ b.r*0.7, b.r*0.9, b.r*0.34, 0, 0, 7); ctx.fill();
      ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-b.r,0); ctx.lineTo(b.r,0); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,b.r*0.55, Math.PI*0.15, Math.PI*0.85); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(-b.r*0.35, -b.r*0.35, b.r*0.25, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!ball) return false;
        if (Math.hypot(px - ball.x, py - ball.y) > ball.r + 10) return false;
        toss();
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   11) SURPRISE GIFT  —  once in a while a little wrapped box waits on the floor.
   Tap to open it: sometimes a keepsake trinket for her collection, sometimes a
   sweet note. The box appears occasionally and vanishes once opened or ignored.
   -------------------------------------------------------------------------- */
(function fxGift(){
  try{
    let gift = null;                     // {x,y,ttl,hue,bob}
    let timer = rand(60, 110);
    const NOTES = ['You make ordinary days feel like gifts.','I still get butterflies, you know.','Happy birthday, my love. 💛','Every day with you is the present.','You are my favorite everything.'];

    function spawn(){
      gift = { x: rand(W*0.24, W*0.76), y: rand(H*0.72, H*0.80), ttl: 22, hue: pick(['#ff8fab','#8ad3ff','#ffd166','#c8a2ff']), bob: rand(0,Math.PI*2) };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!gift){
        timer -= dt;
        if (timer <= 0){ timer = rand(80, 150); if (!(pet && pet.resting)) spawn(); }
        return;
      }
      gift.bob += dt; gift.ttl -= dt;
      if (gift.ttl <= 0) gift = null;    // not opened — quietly taken away
    });

    EXTRA_DRAWERS.push(function(){
      if (!gift) return;
      const g = gift;
      const y = g.y + Math.sin(g.bob*2) * 1.5;
      const s = 14;                      // box half-size
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath(); ctx.ellipse(g.x, g.y + s*0.9, s*0.9, s*0.3, 0, 0, 7); ctx.fill();
      // box
      if (typeof roundRect === 'function'){ ctx.fillStyle = g.hue; roundRect(g.x - s, y - s, s*2, s*2, 3); ctx.fill(); }
      else { ctx.fillStyle = g.hue; ctx.fillRect(g.x - s, y - s, s*2, s*2); }
      // ribbon
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(g.x - 2, y - s, 4, s*2);
      ctx.fillRect(g.x - s, y - 2, s*2, 4);
      // bow
      ctx.beginPath(); ctx.arc(g.x - 4, y - s - 2, 4, 0, 7); ctx.arc(g.x + 4, y - s - 2, 4, 0, 7); ctx.fill();
      // sparkle hint
      ctx.globalAlpha = 0.5 + 0.5*Math.sin(g.bob*3);
      ctx.fillStyle = '#fff'; ctx.font = '10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('✨', g.x + s, y - s);
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!gift) return false;
        const s = 16;
        if (px < gift.x - s || px > gift.x + s || py < gift.y - s*1.6 || py > gift.y + s) return false;
        const gx = gift.x, gy = gift.y; gift = null;
        if (typeof sfx === 'function') sfx('find');
        if (typeof burstAt === 'function') burstAt(pick(['🎁','✨','💫']), gx, gy-6);
        if (Math.random() < 0.6 && typeof collection === 'object'){
          // a keepsake trinket for her collection
          let pool = ['🌷','🐚','🍬','🎀','⭐'];
          try{ if (typeof TRINKET_POOL === 'object' && typeof SCENES!=='undefined'){ pool = TRINKET_POOL[SCENES[currentScene]] || (typeof TRINKET_DEFAULT!=='undefined' ? TRINKET_DEFAULT : pool); } }catch(e){}
          const t = pick(pool);
          collection[t] = (collection[t]||0) + 1;
          if (typeof saveCollection === 'function') saveCollection();
          if (typeof say === 'function') say('A gift… a ' + t + '! 🥰');
          if (typeof hearts === 'function') hearts();
          try{ state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 4); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        } else {
          // a sweet note instead
          const note = pick(NOTES);
          if (typeof showToast === 'function') showToast('💌','A little note', note);
          else if (typeof say === 'function') say(note);
          try{ state.love = clamp(state.love + 5); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        timer = rand(90, 160);
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   12) HEART SHOWER  —  double-tap an empty patch of sky to send a one-shot
   shower of hearts drifting down. Cooldowned; not a persistent overlay. A single
   sky tap still behaves normally (she looks over to the spot).
   -------------------------------------------------------------------------- */
(function fxHeartShower(){
  try{
    let lastT = 0, lastX = 0, lastY = 0, cd = 0;
    const WINDOW = 0.36;

    function nearHer(px, py){
      try{
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        return Math.hypot(px - pet.x, py - (pet.y - h*0.5)) < 90;
      }catch(e){ return false; }
    }

    EXTRA_UPDATERS.push(function(dt){ if (cd > 0) cd -= dt; });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (py > H*0.42) return false;          // only the upper sky area
        if (nearHer(px, py)) return false;       // leave the kiss zone alone
        const now = fxNowSec();
        const quick = (now - lastT) <= WINDOW;
        const close = Math.hypot(px - lastX, py - lastY) < 70;
        lastT = now; lastX = px; lastY = py;
        if (!(quick && close)) return false;     // first tap: let default look-over happen
        lastT = 0;
        if (cd > 0) return true;                  // still consume the double-tap, just no re-shower
        cd = 6;
        if (typeof fxAt === 'function'){
          for (let i=0;i<12;i++){
            setTimeout(()=> fxAt(rand(W*0.1, W*0.9), rand(H*0.06, H*0.2), pick(['💛','💗','💖','✨','💕'])), i*70);
          }
        }
        if (typeof sfx === 'function') sfx('day');
        try{ state.love = clamp(state.love + 3); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        if (typeof say === 'function') say(pick(['A sky full of love 💗','For you, always 💛','It’s raining hearts! 🥰']));
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 5). More interactive / contained moments — occasional,
   self-clearing, scene-aware. No always-on overlays.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   13) SHE BRINGS YOU A FLOWER  —  every great while she wanders to a spot, picks
   a little something, and offers it to you with a note. No taps needed; it's a
   quiet, spontaneous moment of affection that clears itself.
   -------------------------------------------------------------------------- */
(function fxFlowerGift(){
  try{
    let phase = 'idle';                  // 'idle' | 'goto' | 'done'
    let timer = rand(80, 150);
    let guard = 0, target = null, flower = '🌸';
    const NOTES = ['I picked this just for you 🌸','A little something, because I love you 💛','For you, my favorite person 🥰','Thinking of you always 💐'];

    function busy(){
      try{
        return (pet.animLock>0) || pet.resting || (typeof isCrying==='function' && isCrying())
          || (typeof speech!=='undefined' && speech.classList && speech.classList.contains('show'));
      }catch(e){ return true; }
    }

    EXTRA_UPDATERS.push(function(dt){
      if (phase === 'idle'){
        timer -= dt;
        if (timer <= 0){
          timer = rand(120, 220);
          if (busy()) return;
          const mood = (typeof moodScore==='function') ? moodScore() : 60;
          if (mood < 45) return;                       // only when she's in good spirits
          flower = pick(['🌸','🌷','🌼','💐','🌹','🌻']);
          target = { x: rand(W*0.2, W*0.8), y: rand(H*0.7, H*0.8) };
          if (typeof fxWalkHerTo === 'function') fxWalkHerTo(target.x, target.y);
          phase = 'goto'; guard = 5;
        }
        return;
      }
      if (phase === 'goto'){
        guard -= dt;
        const near = target && Math.hypot(pet.x - target.x, pet.y - target.y) < 22;
        if (near || guard <= 0){
          phase = 'done';
          if (typeof burstAt === 'function') burstAt(flower, pet.x, pet.y - 8);
          if (typeof say === 'function') say('Look what I found for you… ' + flower);
          if (typeof hearts === 'function') hearts();
          if (typeof sfx === 'function') sfx('find');
          setTimeout(()=>{ try{ if (typeof showToast==='function') showToast(flower,'A gift for you', pick(NOTES)); }catch(e){} }, 1400);
          try{ state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          setTimeout(()=>{ phase = 'idle'; }, 2500);
        }
      }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   14) MUSIC IN THE AIR  —  only in music-y scenes, tiny notes drift up from her
   now and then (a little more lively when she's walking). Scene-gated, so it
   never plays elsewhere and adds no clutter to other places.
   -------------------------------------------------------------------------- */
(function fxMusicNotes(){
  try{
    const MUSIC = new Set(['musicroom','recordshop','recordingstudio','jazzclub','concerthall','ballroom','bandstand','cinema','carnival','arcade','operahouse']);
    let t = rand(2, 4);
    EXTRA_UPDATERS.push(function(dt){
      t -= dt;
      if (t > 0) return;
      try{
        const scene = (typeof SCENES!=='undefined') ? SCENES[currentScene] : null;
        if (!scene || !MUSIC.has(scene)){ t = rand(2, 4); return; }
        if (!pet || pet.resting || pet.animLock>0 || (typeof isCrying==='function' && isCrying())){ t = rand(2,4); return; }
        t = pet.moving ? rand(0.9, 1.6) : rand(2.2, 3.6);     // livelier on the move
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        if (typeof fxAt === 'function') fxAt(pet.x + rand(-14,14), pet.y - h*rand(0.8,1.0), pick(['♪','♫','🎵','🎶']));
      }catch(e){ t = rand(2,4); }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   15) SLEEPY VISITOR CAT  —  once in a while a little cat curls up on the floor
   for a nap. Tap to give it a gentle pet — it purrs, she coos, and everyone's a
   bit happier. It naps for a while, then quietly wanders off.
   -------------------------------------------------------------------------- */
(function fxNapCat(){
  try{
    let cat = null;                      // {x,y,ttl,breathe,zzz,petCd,color}
    let timer = rand(60, 110);
    const COLORS = ['#d9a066','#8a8a8a','#e8c07a','#5a5a5a','#c98a5a'];

    function spawn(){
      cat = { x: rand(W*0.22, W*0.78), y: rand(H*0.72, H*0.80), ttl: rand(26, 40), breathe: rand(0,Math.PI*2), zzz: 2, petCd: 0, color: pick(COLORS) };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!cat){
        timer -= dt;
        if (timer <= 0){ timer = rand(80, 140); if (!(pet && pet.resting)) spawn(); }
        return;
      }
      cat.breathe += dt; cat.ttl -= dt;
      if (cat.petCd > 0) cat.petCd -= dt;
      cat.zzz -= dt;
      if (cat.zzz <= 0){ cat.zzz = rand(3.5, 5.5); if (typeof fxAt === 'function') fxAt(cat.x + 14, cat.y - 12, '💤'); }
      if (cat.ttl <= 0) cat = null;      // nap's over — it slips away
    });

    EXTRA_DRAWERS.push(function(){
      if (!cat) return;
      const c = cat;
      const br = 1 + Math.sin(c.breathe*2) * 0.04;            // slow breathing
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 5, 22, 5, 0, 0, 7); ctx.fill();
      // curled body
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 20, 11*br, 0, 0, 7); ctx.fill();
      // tail curling around the front
      ctx.strokeStyle = c.color; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(c.x + 14, c.y + 2, 10, Math.PI*1.1, Math.PI*2.1); ctx.stroke();
      // head resting on the left
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.arc(c.x - 15, c.y - 2, 8, 0, 7); ctx.fill();
      // ears
      ctx.beginPath();
      ctx.moveTo(c.x - 20, c.y - 8); ctx.lineTo(c.x - 17, c.y - 15); ctx.lineTo(c.x - 13, c.y - 9); ctx.closePath();
      ctx.moveTo(c.x - 12, c.y - 9); ctx.lineTo(c.x - 9, c.y - 15); ctx.lineTo(c.x - 6, c.y - 8); ctx.closePath();
      ctx.fill();
      // closed sleepy eye
      ctx.strokeStyle = 'rgba(40,30,25,0.8)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(c.x - 16, c.y - 2, 2.4, Math.PI*0.15, Math.PI*0.85); ctx.stroke();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!cat) return false;
        if (px < cat.x - 24 || px > cat.x + 24 || py < cat.y - 18 || py > cat.y + 12) return false;
        if (typeof fxAt === 'function') for (let i=0;i<3;i++) setTimeout(()=> fxAt(cat.x + rand(-14,14), cat.y - 10, pick(['🐾','💗','😺'])), i*80);
        if (cat.petCd <= 0){
          cat.petCd = 1.4; cat.ttl = Math.max(cat.ttl, 10);   // a good pet keeps it around a little
          if (typeof sfx === 'function') sfx('tap');
          if (typeof say === 'function') say(pick(['So soft 🐱','Purrr…','Kitty! 🐈','Hello, sweet thing 🥰']));
          try{ state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 6). Quality over quantity — two polished, contained
   moments. No always-on overlays; both are conditional/occasional and self-clear.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   16) A LITTLE PICNIC  —  when her fun and love are both brimming, she lays out a
   gingham blanket and basket beside her for the two of you. Tap the basket to
   share a treat. It stays a short while, then she gently packs it away.
   -------------------------------------------------------------------------- */
(function fxPicnic(){
  try{
    let pic = null;                      // {x,y,ttl,bob,basketCd,treatShown}
    let timer = rand(70, 120);
    const TREATS = ['🍓','🥪','🧁','🍇','🍒','🥐'];

    function busy(){
      try{
        return (pet.animLock>0) || pet.resting || (typeof isCrying==='function' && isCrying());
      }catch(e){ return true; }
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!pic){
        timer -= dt;
        if (timer <= 0){
          timer = rand(110, 190);
          if (busy()) return;
          if (!(state && state.fun >= 82 && state.love >= 82)) return;   // only in a truly happy moment
          const side = (pet.x < W*0.5) ? 1 : -1;                          // set it on the roomier side
          const bx = Math.max(W*0.24, Math.min(W*0.76, pet.x + side*46));
          const by = Math.max(H*0.72, Math.min(H*0.80, pet.y + 6));
          pic = { x: bx, y: by, ttl: rand(26, 36), bob: 0, basketCd: 0, treatShown: 0 };
          if (typeof say === 'function') say(pick(['A little picnic? 🧺','Come sit with me 💛','Perfect day for this 🥪']));
          if (typeof sfx === 'function') sfx('day');
          setTimeout(()=>{ try{ if (typeof showToast==='function') showToast('🧺','Picnic time','Just the two of us 💛'); }catch(e){} }, 900);
          try{ state.fun = clamp(state.fun + 3); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return;
      }
      pic.bob += dt; pic.ttl -= dt;
      if (pic.basketCd > 0) pic.basketCd -= dt;
      if (pic.treatShown > 0) pic.treatShown -= dt;
      if (pic.ttl <= 0) pic = null;      // packed away
    });

    EXTRA_DRAWERS.push(function(){
      if (!pic) return;
      const p = pic, bw = 62, bh = 30;
      const x0 = p.x - bw/2, y0 = p.y - bh/2;
      ctx.save();
      // soft shadow
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + bh*0.42, bw*0.52, 5, 0, 0, 7); ctx.fill();
      // blanket base
      if (typeof roundRect === 'function'){ ctx.fillStyle = '#f4ece0'; roundRect(x0, y0, bw, bh, 4); ctx.fill(); }
      else { ctx.fillStyle = '#f4ece0'; ctx.fillRect(x0, y0, bw, bh); }
      // gingham checks (clipped to the blanket)
      ctx.save();
      if (typeof roundRect === 'function'){ roundRect(x0, y0, bw, bh, 4); ctx.clip(); }
      const cols = 6, rows = 3, cwd = bw/cols, chd = bh/rows;
      ctx.fillStyle = 'rgba(210,90,90,0.5)';
      for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) if ((r+c)%2===0) ctx.fillRect(x0 + c*cwd, y0 + r*chd, cwd, chd);
      ctx.restore();
      // basket on the right end
      const bkx = p.x + bw*0.28, bky = p.y - 5;
      ctx.strokeStyle = '#9c6b3f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bkx, bky - 2, 7, Math.PI, 0); ctx.stroke();      // handle
      ctx.fillStyle = '#b5794a';
      if (typeof roundRect === 'function'){ roundRect(bkx - 9, bky - 2, 18, 12, 2); ctx.fill(); }
      else ctx.fillRect(bkx - 9, bky - 2, 18, 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bkx-9, bky+3); ctx.lineTo(bkx+9, bky+3); ctx.stroke();
      // a couple of treats on the blanket
      ctx.font = '11px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🍓', p.x - bw*0.28, p.y + 1);
      ctx.fillText('🥪', p.x - bw*0.06, p.y + 2);
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!pic) return false;
        const bkx = pic.x + 62*0.28, bky = pic.y - 5;
        if (px < bkx - 13 || px > bkx + 13 || py < bky - 12 || py > bky + 12) return false;
        const treat = pick(TREATS);
        if (typeof burstAt === 'function') burstAt(treat, bkx, bky - 6);
        if (pic.basketCd <= 0){
          pic.basketCd = 1.2; pic.ttl = Math.max(pic.ttl, 8);
          if (typeof sfx === 'function') sfx('feed');
          if (typeof say === 'function') say(pick(['Yum! ' + treat, 'Share with me? 🥰', 'My favorite ' + treat, 'Mmm 💛']));
          try{ state.hunger = clamp(state.hunger + 4); state.love = clamp(state.love + 3); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   17) CONNECT THE STARS  —  now and then after dark, a scatter of soft stars
   twinkles in the sky. Tap them one by one to draw your own little constellation;
   join them all and a wish lights up. If left, they simply fade back into night.
   -------------------------------------------------------------------------- */
(function fxConstellation(){
  try{
    let stars = null;                    // array of {x,y,tw,on}
    let order = [];                      // indices in the sequence you connect
    let timer = rand(45, 85);
    let ttl = 0, done = 0;

    function isNightNow(){ try{ return typeof isNight === 'function' && isNight(); }catch(e){ return false; } }

    function spawn(){
      const n = 5, pts = [];
      let tries = 0;
      while (pts.length < n && tries < 120){
        tries++;
        const cand = { x: rand(W*0.14, W*0.86), y: rand(H*0.06, H*0.30), tw: rand(0,Math.PI*2), on: false };
        if (pts.every(p => Math.hypot(p.x-cand.x, p.y-cand.y) > 34)) pts.push(cand);
      }
      if (pts.length < 3) { stars = null; return; }
      stars = pts; order = []; ttl = 16; done = 0;
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!stars){
        timer -= dt;
        if (timer <= 0){ timer = rand(70, 120); if (isNightNow() && !(pet && pet.resting)) spawn(); }
        return;
      }
      for (const s of stars) s.tw += dt * 2.2;
      if (done > 0){ done -= dt; if (done <= 0) stars = null; return; }
      ttl -= dt;
      if (ttl <= 0) stars = null;        // faded back into the night
    });

    EXTRA_DRAWERS.push(function(){
      if (!stars) return;
      ctx.save();
      // connecting lines (in the order you tapped)
      if (order.length > 1){
        ctx.strokeStyle = 'rgba(210,225,255,0.55)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(stars[order[0]].x, stars[order[0]].y);
        for (let i=1;i<order.length;i++) ctx.lineTo(stars[order[i]].x, stars[order[i]].y);
        ctx.stroke();
      }
      const complete = (done > 0);
      for (const s of stars){
        const tw = 0.55 + 0.45*Math.sin(s.tw);
        const r = s.on ? 2.8 : 2.0;
        const a = s.on ? 1 : (0.45 + 0.35*tw);
        if (s.on || complete){
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 7);
          g.addColorStop(0, 'rgba(255,255,235,' + (0.8*a).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(255,255,235,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,245,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 7); ctx.fill();
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!stars || done > 0) return false;
        let hit = -1, best = 20;
        for (let i=0;i<stars.length;i++){
          if (stars[i].on) continue;
          const d = Math.hypot(px - stars[i].x, py - stars[i].y);
          if (d < best){ best = d; hit = i; }
        }
        if (hit < 0) return false;
        stars[hit].on = true; order.push(hit); ttl = Math.max(ttl, 6);
        if (typeof sfx === 'function') sfx('tap');
        if (typeof fxAt === 'function') fxAt(stars[hit].x, stars[hit].y - 4, '✨');
        if (order.length >= stars.length){
          // constellation complete — a wish lights up
          done = 2.2;
          let cx=0, cy=0; stars.forEach(s=>{ cx+=s.x; cy+=s.y; });
          cx/=stars.length; cy/=stars.length;
          if (typeof fxAt === 'function') for (let i=0;i<5;i++) setTimeout(()=> fxAt(cx+rand(-16,16), cy+rand(-10,10), pick(['🌟','✨','💫','💛'])), i*80);
          if (typeof sfx === 'function') sfx('find');
          try{ state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          if (typeof say === 'function') say(pick(['Our own little constellation ✨','I wished for us 💫','You hung the stars 🌟','Made just for you 💛']));
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 7). Two small, polished touches. No always-on
   overlays; the tap feature is scene-gated and returns false on misses.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   18) WAVE HELLO  —  when you take her somewhere new, she looks over and gives a
   happy little wave with a greeting suited to the place. Brief and one-shot per
   scene change; skipped if she's busy so it never interrupts anything.
   -------------------------------------------------------------------------- */
(function fxWaveHello(){
  try{
    let lastScene = -1, warmup = 1.2;    // small delay so the first load doesn't wave
    function greetFor(scene){
      const S = (n)=>scene===n;
      if (['snowycabin','icepond','frozenfalls','icebergbay'].includes(scene)) return 'Brr — cozy though! ❄️';
      if (['beach','marina','fishingdock','tidepools','coralreef'].includes(scene)) return 'The sea! 🌊';
      if (['musicroom','recordshop','ballroom','jazzclub','concerthall'].includes(scene)) return 'I hear music! 🎶';
      if (['catcafe','petshop','butterflydome','aviary','backyard'].includes(scene)) return 'Little friends! 🐾';
      return pick(['Ooh, somewhere new! 👋','I love it here 💛','What a lovely spot ✨','Take my hand 🥰']);
    }
    EXTRA_UPDATERS.push(function(dt){
      if (warmup > 0){ warmup -= dt; if (warmup <= 0) lastScene = currentScene; return; }
      if (currentScene === lastScene) return;
      lastScene = currentScene;
      try{
        if (!pet || pet.resting || pet.animLock>0 || (typeof isCrying==='function' && isCrying())) return;
        if (typeof birthday !== 'undefined' && birthday) return;   // don't wave over the birthday scene
        const h = (typeof SHEETS!=='undefined' && SHEETS.walk && SHEETS.walk.displayH) || 150;
        if (typeof fxAt === 'function') fxAt(pet.x + 14, pet.y - h*0.72, '👋');
        try{ pet.blush = Math.min(2.0, (pet.blush||0) + 0.8); }catch(e){}
        const scene = (typeof SCENES!=='undefined') ? SCENES[currentScene] : null;
        setTimeout(()=>{ try{ if (typeof say==='function') say(greetFor(scene)); }catch(e){} }, 260);
        if (typeof sfx === 'function') sfx('tap');
      }catch(e){}
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   19) KITE ON THE HILL  —  only on Kite Hill, a little kite dances in the sky on
   its string. Give it a tap to send it into a swooping loop-the-loop. Purely for
   the joy of it; it lives only in that scene and drifts on the breeze.
   -------------------------------------------------------------------------- */
(function fxKite(){
  try{
    let kite = null;                     // {t,loop,loopT,hue,cd}
    function onHill(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'kitehill'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!onHill()){ kite = null; return; }
      if (!kite) kite = { t: rand(0,Math.PI*2), loop: 0, loopT: 0, hue: pick(['#ff8fab','#8ad3ff','#ffd166','#c8a2ff']), cd: 0 };
      kite.t += dt; if (kite.cd > 0) kite.cd -= dt;
      if (kite.loop > 0){ kite.loopT += dt * 6; if (kite.loopT >= Math.PI*2){ kite.loop = 0; kite.loopT = 0; } }
    });

    function kitePos(){
      // anchor near her hand; kite sways on a breeze up and to the side
      const ax = pet.x + 10, ay = pet.y - 30;
      let kx = W*0.30 + Math.sin(kite.t*0.5) * 46;
      let ky = H*0.16 + Math.cos(kite.t*0.7) * 18;
      if (kite.loop > 0){ kx += Math.cos(kite.loopT) * 20; ky += Math.sin(kite.loopT) * 20 - 6; }
      return { kx, ky, ax, ay };
    }

    EXTRA_DRAWERS.push(function(){
      if (!kite || !onHill()) return;
      const { kx, ky, ax, ay } = kitePos();
      ctx.save();
      // string (gentle catenary sag)
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo((ax+kx)/2, Math.max(ay, ky) + 24, kx, ky); ctx.stroke();
      // kite diamond
      const s = 11;
      const ang = Math.atan2(ky - ay, kx - ax) + Math.PI/2;
      ctx.translate(kx, ky); ctx.rotate(ang * 0.25);
      ctx.fillStyle = kite.hue;
      ctx.beginPath(); ctx.moveTo(0,-s); ctx.lineTo(s*0.8,0); ctx.lineTo(0,s); ctx.lineTo(-s*0.8,0); ctx.closePath(); ctx.fill();
      // cross spars
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0,-s); ctx.lineTo(0,s); ctx.moveTo(-s*0.8,0); ctx.lineTo(s*0.8,0); ctx.stroke();
      // little tail bows
      ctx.rotate(-ang*0.25);
      ctx.fillStyle = kite.hue;
      for (let i=1;i<=3;i++){ const ty = s + i*6 + Math.sin(kite.t*3 + i)*2; ctx.beginPath(); ctx.arc(Math.sin(kite.t*3+i)*3, ty, 2, 0, 7); ctx.fill(); }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!kite || !onHill()) return false;
        const { kx, ky } = kitePos();
        if (Math.hypot(px - kx, py - ky) > 20) return false;
        if (kite.cd <= 0){
          kite.cd = 1.2; kite.loop = 1; kite.loopT = 0;
          if (typeof sfx === 'function') sfx('find');
          if (typeof fxAt === 'function') fxAt(kx, ky - 6, pick(['🪁','✨','💨']));
          if (typeof say === 'function') say(pick(['Wheee, look at it go! 🪁','Loop-the-loop! 🥰','Higher! 💨','Such a lovely breeze ✨']));
          try{ state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 8). Two scene-gated interactive builds. No always-on
   overlays; both live only in their scenes and their taps return false on misses.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   20) BUILD A SNOWMAN  —  in wintery scenes, tap the little snow pile to build it
   up, ball by ball, into a cheerful snowman (with a carrot nose and a scarf).
   She helps and celebrates when it's finished. It only lives in winter scenes.
   -------------------------------------------------------------------------- */
(function fxSnowman(){
  try{
    const WINTER = new Set(['snowycabin','icepond','skilodge','gingerbreadkitchen','frozenfalls','icebergbay']);
    let sm = null;                       // {x,y,stage,cd,doneT}
    function inWinter(){ try{ return (typeof SCENES!=='undefined') && WINTER.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inWinter()){ sm = null; return; }
      if (!sm){ sm = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.28)), y: rand(H*0.74, H*0.80), stage: 0, cd: 0, doneT: 0 }; }
      if (sm.cd > 0) sm.cd -= dt;
      if (sm.doneT > 0) sm.doneT -= dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!sm || !inWinter()) return;
      const x = sm.x, base = sm.y;
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath(); ctx.ellipse(x, base + 4, 18, 5, 0, 0, 7); ctx.fill();
      if (sm.stage === 0){
        // a small starter pile of snow
        ctx.fillStyle = '#f2f7ff';
        ctx.beginPath(); ctx.ellipse(x, base, 15, 8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath(); ctx.ellipse(x-4, base-2, 5, 3, 0, 0, 7); ctx.fill();
      } else {
        // bottom ball (stage>=1)
        ctx.fillStyle = '#f4f9ff';
        ctx.beginPath(); ctx.arc(x, base - 11, 14, 0, 7); ctx.fill();
        if (sm.stage >= 2){ ctx.beginPath(); ctx.arc(x, base - 30, 10, 0, 7); ctx.fill(); }   // middle ball
        if (sm.stage >= 3){
          ctx.beginPath(); ctx.arc(x, base - 45, 7.5, 0, 7); ctx.fill();                        // head
          // face
          ctx.fillStyle = '#333';
          ctx.beginPath(); ctx.arc(x-2.6, base-47, 1, 0, 7); ctx.arc(x+2.6, base-47, 1, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(x-3, base-41, 0.8, 0, 7); ctx.arc(x, base-40.5, 0.8, 0, 7); ctx.arc(x+3, base-41, 0.8, 0, 7); ctx.fill(); // smile of coal
          // carrot nose
          ctx.fillStyle = '#ff8c3a';
          ctx.beginPath(); ctx.moveTo(x, base-45); ctx.lineTo(x+8, base-44); ctx.lineTo(x, base-43); ctx.closePath(); ctx.fill();
          // buttons
          ctx.fillStyle = '#333';
          ctx.beginPath(); ctx.arc(x, base-32, 1.1, 0, 7); ctx.arc(x, base-28, 1.1, 0, 7); ctx.fill();
          // scarf
          ctx.fillStyle = '#e05a6a';
          ctx.fillRect(x-8, base-38, 16, 3);
          ctx.fillRect(x+4, base-38, 3, 8);
          // twig arms
          ctx.strokeStyle = '#7a5233'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(x-9, base-30); ctx.lineTo(x-18, base-34);
                           ctx.moveTo(x+9, base-30); ctx.lineTo(x+18, base-34); ctx.stroke();
        }
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!sm || !inWinter()) return false;
        if (Math.hypot(px - sm.x, py - (sm.y - 20)) > 30) return false;   // generous around the whole build
        if (sm.cd > 0) return true;                                        // consume, but pace the taps
        sm.cd = 0.4;
        if (typeof fxAt === 'function') fxAt(sm.x, sm.y - sm.stage*10 - 8, '❄️');
        if (typeof sfx === 'function') sfx('tap');
        if (sm.stage < 3){
          sm.stage++;
          if (sm.stage === 3){
            // finished!
            sm.doneT = 3;
            if (typeof burstAt === 'function') burstAt('⛄', sm.x, sm.y - 40);
            if (typeof hearts === 'function') hearts();
            if (typeof sfx === 'function') sfx('day');
            if (typeof say === 'function') say(pick(['Our snowman! ⛄','He’s perfect 🥰','Ta-daa! ❄️','I love him 💛']));
            try{ state.fun = clamp(state.fun + 8); state.love = clamp(state.love + 4); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          } else {
            if (typeof say === 'function') say(pick(['Roll another! ⛄','Pat, pat… ❄️','Almost there!']));
            try{ state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          }
        } else {
          // already complete — a friendly boop resets to a fresh pile after a moment
          if (typeof say === 'function') say(pick(['Hi, snowman! ☃️','Boop his nose 🥕','So jolly 🥰']));
          if (sm.doneT <= 0){ sm.stage = 0; }
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   21) PUDDLE SPLASH  —  only on the rainy street, little puddles gather on the
   ground. Tap one and she hops in with a splash and a giggle. Rain washes the
   puddles fresh now and then. Contained entirely to that scene.
   -------------------------------------------------------------------------- */
(function fxPuddle(){
  try{
    let puddles = null;                  // array of {x,y,rx,cd}
    let refreshT = 0;
    function onRainy(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'rainystreet'; }catch(e){ return false; } }
    function seed(){
      const n = 3, arr = [];
      for (let i=0;i<n;i++) arr.push({ x: rand(W*0.2, W*0.8), y: rand(H*0.74, H*0.82), rx: rand(12,18), cd: 0, ripple: 0 });
      puddles = arr;
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!onRainy()){ puddles = null; return; }
      if (!puddles){ seed(); refreshT = rand(18, 30); }
      refreshT -= dt;
      if (refreshT <= 0){ refreshT = rand(18, 30); seed(); }    // fresh puddles as the rain falls
      for (const p of puddles){ if (p.cd > 0) p.cd -= dt; if (p.ripple > 0) p.ripple -= dt; }
    });

    EXTRA_DRAWERS.push(function(){
      if (!puddles || !onRainy()) return;
      ctx.save();
      for (const p of puddles){
        // puddle
        ctx.fillStyle = 'rgba(150,185,210,0.35)';
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.rx*0.34, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(220,235,245,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.rx*0.34, 0, 0, 7); ctx.stroke();
        // expanding ripple after a splash
        if (p.ripple > 0){
          const k = 1 - (p.ripple / 0.6);
          ctx.globalAlpha = Math.max(0, p.ripple / 0.6);
          ctx.strokeStyle = 'rgba(230,245,255,0.8)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx*(0.4+k*0.9), p.rx*0.34*(0.4+k*0.9), 0, 0, 7); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!puddles || !onRainy()) return false;
        for (const p of puddles){
          const dx = (px - p.x) / (p.rx + 6), dy = (py - p.y) / (p.rx*0.34 + 8);
          if (dx*dx + dy*dy > 1) continue;
          if (p.cd > 0) return true;
          p.cd = 0.8; p.ripple = 0.6;
          // she skips over and splashes
          if (typeof fxWalkHerTo === 'function') fxWalkHerTo(p.x, p.y);
          if (typeof fxAt === 'function') for (let i=0;i<4;i++) setTimeout(()=> fxAt(p.x + rand(-p.rx,p.rx), p.y - rand(2,14), pick(['💧','💦'])), i*60);
          if (typeof sfx === 'function') sfx('find');
          if (typeof say === 'function') say(pick(['Splash! 💦','Wheee! 🌧️','Jump in the puddles! 💧','Muddy toes 😄']));
          try{ state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          return true;
        }
        return false;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 9). Two scene-gated, contained little moments. No
   always-on overlays; each lives only in its scenes and taps return false on miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   22) PAPER BOAT  —  by the water, a little folded paper boat bobs on the surface.
   Give it a tap and it sets sail across the ripples while she watches it go. Lives
   only in watery scenes and gently resets when it reaches the far side.
   -------------------------------------------------------------------------- */
(function fxPaperBoat(){
  try{
    const WATER = new Set(['river','koipond','moonlitjetty','marina','fishingdock']);
    let boat = null;                     // {x,y,vx,bob,hue,cd,wake}
    function onWater(){ try{ return (typeof SCENES!=='undefined') && WATER.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!onWater()){ boat = null; return; }
      if (!boat){ boat = { x: rand(W*0.2, W*0.35), y: rand(H*0.5, H*0.6), vx: 6, bob: rand(0,Math.PI*2), hue: pick(['#ffffff','#ffe0a8','#cfe8ff']), cd: 0, wake: 0 }; }
      const b = boat;
      b.bob += dt; if (b.cd > 0) b.cd -= dt; if (b.wake > 0) b.wake -= dt;
      b.x += b.vx * dt; b.vx *= 0.995;
      if (b.x > W*0.9){ boat = { x: rand(W*0.14, W*0.28), y: rand(H*0.48, H*0.6), vx: 6, bob: rand(0,Math.PI*2), hue: b.hue, cd:0, wake:0 }; }
    });

    EXTRA_DRAWERS.push(function(){
      if (!boat || !onWater()) return;
      const b = boat, y = b.y + Math.sin(b.bob*2) * 1.6;
      ctx.save();
      // wake ripple behind the boat
      if (b.wake > 0){
        ctx.globalAlpha = Math.max(0, b.wake / 0.8) * 0.5;
        ctx.strokeStyle = 'rgba(230,245,255,0.9)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(b.x - 10, y + 5, 12, 3.5, 0, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // reflection
      ctx.globalAlpha = 0.18; ctx.fillStyle = b.hue;
      ctx.beginPath(); ctx.moveTo(b.x-9, y+6); ctx.lineTo(b.x+9, y+6); ctx.lineTo(b.x, y+13); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      // hull
      ctx.fillStyle = b.hue;
      ctx.beginPath(); ctx.moveTo(b.x-10, y+2); ctx.lineTo(b.x+10, y+2); ctx.lineTo(b.x+6, y+7); ctx.lineTo(b.x-6, y+7); ctx.closePath(); ctx.fill();
      // sail (folded paper triangle)
      ctx.beginPath(); ctx.moveTo(b.x, y-9); ctx.lineTo(b.x+8, y+2); ctx.lineTo(b.x, y+2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(b.x, y-9); ctx.lineTo(b.x-8, y+2); ctx.lineTo(b.x, y+2); ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fill();
      // crease line
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(b.x, y-9); ctx.lineTo(b.x, y+2); ctx.stroke();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!boat || !onWater()) return false;
        if (Math.hypot(px - boat.x, py - boat.y) > 16) return false;
        if (boat.cd > 0) return true;
        boat.cd = 0.9; boat.vx = rand(26, 40); boat.wake = 0.8;
        if (typeof sfx === 'function') sfx('tap');
        if (typeof fxAt === 'function') fxAt(boat.x, boat.y - 10, pick(['⛵','💨','✨']));
        if (typeof say === 'function') say(pick(['Set sail! ⛵','Off it goes 🥰','Bon voyage, little boat 💛','Sail away ✨']));
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   23) SHARED MILKSHAKE  —  in the diner, café or ice-cream parlor, a tall shake
   with two straws waits to be shared. Tap to take a sip together — hearts, a
   little sweetness, and rising bubbles. Only appears in those cozy spots.
   -------------------------------------------------------------------------- */
(function fxMilkshake(){
  try{
    const SPOTS = new Set(['diner','cafe','icecreamparlor']);
    let shake = null;                    // {x,y,ttl,cd,sips,bob}
    let timer = rand(8, 16);
    function inSpot(){ try{ return (typeof SCENES!=='undefined') && SPOTS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inSpot()){ shake = null; timer = rand(8,16); return; }
      if (!shake){
        timer -= dt;
        if (timer <= 0){ timer = rand(30, 55); shake = { x: Math.max(W*0.2, Math.min(W*0.8, pet.x + (pet.x<W*0.5?44:-44))), y: rand(H*0.72, H*0.80), ttl: rand(30, 45), cd: 0, sips: 0, bob: 0 }; }
        return;
      }
      shake.bob += dt; shake.ttl -= dt; if (shake.cd > 0) shake.cd -= dt;
      if (shake.ttl <= 0) shake = null;
    });

    EXTRA_DRAWERS.push(function(){
      if (!shake || !inSpot()) return;
      const x = shake.x, base = shake.y;
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath(); ctx.ellipse(x, base + 2, 12, 3.5, 0, 0, 7); ctx.fill();
      // glass (tapered tumbler)
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.moveTo(x-8, base-26); ctx.lineTo(x+8, base-26); ctx.lineTo(x+6, base); ctx.lineTo(x-6, base); ctx.closePath(); ctx.fill();
      // shake fill
      ctx.fillStyle = '#f7c7d6';
      ctx.beginPath(); ctx.moveTo(x-7.4, base-22); ctx.lineTo(x+7.4, base-22); ctx.lineTo(x+6, base-1); ctx.lineTo(x-6, base-1); ctx.closePath(); ctx.fill();
      // whipped top + cherry
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x-3, base-27, 4, 0, 7); ctx.arc(x+3, base-27, 4.5, 0, 7); ctx.arc(x, base-30, 4, 0, 7); ctx.fill();
      ctx.fillStyle = '#e0405a'; ctx.beginPath(); ctx.arc(x, base-33, 2, 0, 7); ctx.fill();
      // two straws
      ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x-2, base-24); ctx.lineTo(x-7, base-40); ctx.stroke();
      ctx.strokeStyle = '#6bb6ff';
      ctx.beginPath(); ctx.moveTo(x+2, base-24); ctx.lineTo(x+7, base-40); ctx.stroke();
      // a rising bubble now and then
      const bp = (shake.bob*1.3) % 1;
      ctx.globalAlpha = 0.5 * (1 - bp);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + Math.sin(shake.bob*3)*3, base - 4 - bp*16, 1.4, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!shake || !inSpot()) return false;
        if (px < shake.x - 12 || px > shake.x + 12 || py < shake.y - 42 || py > shake.y + 6) return false;
        if (shake.cd > 0) return true;
        shake.cd = 1; shake.sips++; shake.ttl = Math.max(shake.ttl, 8);
        if (typeof sfx === 'function') sfx('feed');
        if (typeof fxAt === 'function') fxAt(shake.x, shake.y - 34, pick(['💗','🥤','✨']));
        if (typeof hearts === 'function' && shake.sips % 2 === 0) hearts();
        if (typeof say === 'function') say(pick(['Sip with me 🥤','Mmm, so sweet 🥰','Two straws, just us 💛','Share the last sip? 💗']));
        try{ state.hunger = clamp(state.hunger + 3); state.love = clamp(state.love + 3); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 10). Two scene-gated, contained moments. No always-on
   overlays; each lives only in its scenes and taps return false on misses.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   24) FEED THE KOI  —  by the koi pond (or at the aquarium) a few fish drift near
   the surface. Tap the water to sprinkle a little food; the nearest fish glide
   over to nibble it with a ripple, and she loves watching them. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxKoi(){
  try{
    const PONDS = new Set(['koipond','aquarium']);
    let fish = null;                     // array of {x,y,tx,ty,phase,hue,speed}
    let food = [];                       // {x,y,ttl,ripple}
    let cd = 0;
    function inPond(){ try{ return (typeof SCENES!=='undefined') && PONDS.has(SCENES[currentScene]); }catch(e){ return false; } }
    function seed(){
      const hues = ['#ff8a5b','#ffffff','#ffb03a','#ff5b7a'];
      fish = [];
      for (let i=0;i<3;i++) fish.push({ x: rand(W*0.2,W*0.8), y: rand(H*0.44,H*0.6), tx: rand(W*0.2,W*0.8), ty: rand(H*0.44,H*0.6), phase: rand(0,Math.PI*2), hue: hues[i%hues.length], speed: rand(14,22), retarget: rand(2,4) });
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!inPond()){ fish = null; food = []; return; }
      if (!fish) seed();
      if (cd > 0) cd -= dt;
      // food pellets fade; ripple animates
      for (let i=food.length-1;i>=0;i--){ const f=food[i]; f.ttl -= dt; if (f.ripple>0) f.ripple -= dt; if (f.ttl<=0) food.splice(i,1); }
      for (const fs of fish){
        fs.phase += dt;
        // head to the nearest food if any, else wander
        let tgt = null, bd = 1e9;
        for (const f of food){ const d = Math.hypot(f.x-fs.x, f.y-fs.y); if (d<bd){ bd=d; tgt=f; } }
        if (tgt){ fs.tx = tgt.x; fs.ty = tgt.y; if (bd < 8){ tgt.ttl = Math.min(tgt.ttl, 0.15); tgt.ripple = 0.5; } }
        else { fs.retarget -= dt; if (fs.retarget<=0){ fs.retarget=rand(2,4); fs.tx=rand(W*0.16,W*0.84); fs.ty=rand(H*0.42,H*0.6); } }
        const dx=fs.tx-fs.x, dy=fs.ty-fs.y, d=Math.hypot(dx,dy)||1, step=fs.speed*dt*(tgt?1.5:1);
        fs.x += dx/d*step; fs.y += dy/d*step; fs.dir = dx>=0?1:-1;
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!fish || !inPond()) return;
      ctx.save();
      // food + ripples
      for (const f of food){
        if (f.ripple>0){ ctx.globalAlpha=Math.max(0,f.ripple/0.5)*0.6; ctx.strokeStyle='rgba(230,245,255,0.9)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(f.x,f.y,10*(1-f.ripple/0.5)+3,4*(1-f.ripple/0.5)+1,0,0,7); ctx.stroke(); ctx.globalAlpha=1; }
        ctx.fillStyle='rgba(190,150,90,0.9)'; ctx.beginPath(); ctx.arc(f.x,f.y,1.4,0,7); ctx.fill();
      }
      // koi (simple teardrop body + tail, drawn under a faint water sheen)
      for (const fs of fish){
        const dir = fs.dir||1, y = fs.y + Math.sin(fs.phase*2)*1.2;
        ctx.save(); ctx.translate(fs.x, y); ctx.scale(dir,1);
        ctx.fillStyle = fs.hue; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.ellipse(0,0,7,3.4,0,0,7); ctx.fill();
        const tw = Math.sin(fs.phase*6)*2;
        ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-11, -3+tw); ctx.lineTo(-11, 3+tw); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!fish || !inPond()) return false;
        if (py < H*0.40 || py > H*0.64) return false;    // only the water band reacts
        if (cd > 0) return true;
        cd = 0.5;
        for (let i=0;i<3;i++) food.push({ x: px+rand(-8,8), y: py+rand(-4,4), ttl: 5, ripple: 0.5 });
        if (food.length > 12) food.splice(0, food.length-12);
        if (typeof sfx === 'function') sfx('tap');
        if (typeof say === 'function') say(pick(['Here, fishies! 🐟','They’re so pretty 🥰','Come and eat 🐠','Look at them go! ✨']));
        try{ state.fun = clamp(state.fun + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   25) MAKE A WISH (DANDELION)  —  in meadows a dandelion puff sways in the grass.
   Tap it to blow the seeds away on the breeze and make a little wish together.
   She gets a wishful, happy glow. Lives only in meadow scenes and regrows.
   -------------------------------------------------------------------------- */
(function fxDandelion(){
  try{
    const MEADOWS = new Set(['poppyfield','alpinemeadow','pasture']);
    let dan = null;                      // {x,y,full,seeds:[],bob,regrow}
    function inMeadow(){ try{ return (typeof SCENES!=='undefined') && MEADOWS.has(SCENES[currentScene]); }catch(e){ return false; } }
    function grow(){ dan = { x: Math.max(W*0.2, Math.min(W*0.8, rand(W*0.25,W*0.75))), y: rand(H*0.68,H*0.78), full:true, seeds:[], bob:rand(0,Math.PI*2), regrow:0 }; }

    EXTRA_UPDATERS.push(function(dt){
      if (!inMeadow()){ dan = null; return; }
      if (!dan) grow();
      dan.bob += dt;
      // drifting seeds
      for (let i=dan.seeds.length-1;i>=0;i--){ const s=dan.seeds[i]; s.t+=dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+= -2*dt; if (s.t>=s.life) dan.seeds.splice(i,1); }
      if (!dan.full){ dan.regrow -= dt; if (dan.regrow<=0 && dan.seeds.length===0) grow(); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!dan || !inMeadow()) return;
      const sway = Math.sin(dan.bob*1.5)*2;
      const hx = dan.x + sway, hy = dan.y - 22;
      ctx.save();
      // stem
      ctx.strokeStyle = '#5a8a3a'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(dan.x, dan.y); ctx.quadraticCurveTo(dan.x+sway*0.5, dan.y-12, hx, hy); ctx.stroke();
      if (dan.full){
        // fluffy seed head
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.6;
        for (let a=0;a<12;a++){ const an=a/12*Math.PI*2; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+Math.cos(an)*9, hy+Math.sin(an)*9); ctx.stroke(); }
      } else {
        // bare head after blowing
        ctx.fillStyle = '#cbd8a0'; ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, 7); ctx.fill();
      }
      // floating seeds
      for (const s of dan.seeds){
        ctx.globalAlpha = Math.max(0, 1 - s.t/s.life) * 0.85;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.3, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y+3); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!dan || !inMeadow() || !dan.full) return false;
        const hx = dan.x + Math.sin(dan.bob*1.5)*2, hy = dan.y - 22;
        if (Math.hypot(px-hx, py-hy) > 16) return false;
        dan.full = false; dan.regrow = rand(6, 10);
        const dir = (px < W*0.5) ? 1 : -1;
        for (let i=0;i<14;i++) dan.seeds.push({ x:hx, y:hy, vx: dir*rand(14,40)+rand(-6,6), vy: rand(-14,-4), t:0, life: rand(1.6,2.6) });
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') fxAt(hx, hy-6, pick(['✨','🌬️','💛']));
        if (typeof say === 'function') say(pick(['Make a wish… ✨','I wished for us 💛','Off they float 🌬️','Did you wish too? 🥰']));
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 11). Two scene-gated, contained moments — one magic,
   one cosy. No always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   26) SPELL ORB  —  in the magic scenes a little enchanted orb floats and pulses
   with an inner glow. Tap it to cast a shimmer of sparkles and a whispered charm.
   Its hue drifts through the spectrum. Lives only in magical places.
   -------------------------------------------------------------------------- */
(function fxSpellOrb(){
  try{
    const MAGIC = new Set(['magicshop','potionkitchen','crystalcave','apothecary','wizardtower','tarotparlor','alchemylab','enchantedforest','witchcottage']);
    let orb = null;                      // {x,y,t,hue,cd,flash}
    function inMagic(){ try{ return (typeof SCENES!=='undefined') && MAGIC.has(SCENES[currentScene]); }catch(e){ return false; } }
    const CHARMS = ['✨ Bibbidi… ✨','A little magic 🔮','Sparkle, sparkle 💫','For you, a charm 🪄','Shazam! 🌟'];

    EXTRA_UPDATERS.push(function(dt){
      if (!inMagic()){ orb = null; return; }
      if (!orb){ orb = { bx: rand(W*0.3,W*0.7), by: rand(H*0.28,H*0.44), t: rand(0,Math.PI*2), hue: rand(0,360), cd:0, flash:0 }; }
      orb.t += dt; orb.hue = (orb.hue + dt*24) % 360;
      if (orb.cd > 0) orb.cd -= dt; if (orb.flash > 0) orb.flash -= dt;
    });
    function orbPos(){ return { x: orb.bx + Math.sin(orb.t*0.8)*20, y: orb.by + Math.cos(orb.t*1.1)*10 }; }

    EXTRA_DRAWERS.push(function(){
      if (!orb || !inMagic()) return;
      const { x, y } = orbPos();
      const pulse = 0.5 + 0.5*Math.sin(orb.t*3);
      const r = 9 + pulse*1.5 + (orb.flash>0 ? orb.flash*8 : 0);
      const col = 'hsl(' + orb.hue.toFixed(0) + ',80%,70%)';
      ctx.save();
      // aura
      const g = ctx.createRadialGradient(x, y, 0, x, y, r*2.4);
      g.addColorStop(0, 'hsla(' + orb.hue.toFixed(0) + ',80%,70%,0.55)');
      g.addColorStop(1, 'hsla(' + orb.hue.toFixed(0) + ',80%,70%,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r*2.4, 0, 7); ctx.fill();
      // orb body
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      // inner light
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(x - r*0.3, y - r*0.3, r*0.32, 0, 7); ctx.fill();
      // orbiting sparks
      for (let i=0;i<3;i++){ const a = orb.t*2 + i*(Math.PI*2/3); const ox = x + Math.cos(a)*(r+5), oy = y + Math.sin(a)*(r+5); ctx.globalAlpha = 0.6+0.4*Math.sin(orb.t*4+i); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ox, oy, 1.4, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!orb || !inMagic()) return false;
        const { x, y } = orbPos();
        if (Math.hypot(px - x, py - y) > 20) return false;
        if (orb.cd > 0) return true;
        orb.cd = 1; orb.flash = 0.6; orb.hue = (orb.hue + 60) % 360;
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') for (let i=0;i<5;i++) setTimeout(()=> fxAt(x+rand(-16,16), y+rand(-14,14), pick(['✨','💫','🔮','🪄','🌟'])), i*70);
        if (typeof say === 'function') say(pick(CHARMS));
        try{ state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   27) CAMPFIRE  —  at the campsite a little fire crackles on the ground. Tap it to
   toss on a twig; it flares up warm and bright, embers rising, and she cosies up.
   Feeding it also restores a bit of energy. Only appears at the campsite.
   -------------------------------------------------------------------------- */
(function fxCampfire(){
  try{
    let fire = null;                     // {x,y,flare,t,embers:[]}
    function atCamp(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'campsite'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!atCamp()){ fire = null; return; }
      if (!fire){ fire = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.30)), y: rand(H*0.76,H*0.82), flare:0, t:rand(0,10), cd:0, embers:[] }; }
      fire.t += dt; if (fire.flare > 0) fire.flare -= dt*0.6; if (fire.cd > 0) fire.cd -= dt;
      // embers drift up and fade
      for (let i=fire.embers.length-1;i>=0;i--){ const e=fire.embers[i]; e.t+=dt; e.x+=e.vx*dt; e.y+=e.vy*dt; e.vy*=0.99; if (e.t>=e.life) fire.embers.splice(i,1); }
      // steady gentle embers
      if (Math.random() < (0.5 + fire.flare) * dt * 6){ fire.embers.push({ x: fire.x+rand(-4,4), y: fire.y-8, vx: rand(-6,6), vy: rand(-24,-14), t:0, life: rand(0.8,1.6) }); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!fire || !atCamp()) return;
      const x = fire.x, base = fire.y;
      const flick = Math.sin(fire.t*12)*0.12 + Math.sin(fire.t*7)*0.08;
      const scale = 1 + fire.flare*0.5 + flick;
      ctx.save();
      // logs
      ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x-10, base+3); ctx.lineTo(x+10, base-1);
                       ctx.moveTo(x-10, base-1); ctx.lineTo(x+10, base+3); ctx.stroke();
      // glow
      const g = ctx.createRadialGradient(x, base-6, 0, x, base-6, 26*scale);
      g.addColorStop(0, 'rgba(255,170,60,' + (0.4+fire.flare*0.3).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, base-6, 26*scale, 0, 7); ctx.fill();
      // flame layers
      function flame(h, w, col){ ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x-w, base); ctx.quadraticCurveTo(x-w*0.5, base-h*0.6, x, base-h); ctx.quadraticCurveTo(x+w*0.5, base-h*0.6, x+w, base); ctx.closePath(); ctx.fill(); }
      flame(24*scale, 9, '#ff6a2a');
      flame(17*scale, 6, '#ffb03a');
      flame(9*scale, 3.5, '#ffe89a');
      // embers
      for (const e of fire.embers){ ctx.globalAlpha = Math.max(0, 1 - e.t/e.life); ctx.fillStyle = pick(['#ffcf6a']); ctx.fillStyle = '#ffcf6a'; ctx.beginPath(); ctx.arc(e.x, e.y, 1.1, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!fire || !atCamp()) return false;
        if (Math.hypot(px - fire.x, py - (fire.y - 10)) > 26) return false;
        if (fire.cd > 0) return true;
        fire.cd = 0.7; fire.flare = Math.min(1.4, fire.flare + 0.9);
        for (let i=0;i<8;i++) fire.embers.push({ x: fire.x+rand(-6,6), y: fire.y-10, vx: rand(-14,14), vy: rand(-34,-18), t:0, life: rand(0.9,1.7) });
        if (typeof sfx === 'function') sfx('rest');
        if (typeof fxAt === 'function') fxAt(fire.x, fire.y-24, pick(['🔥','✨','🪵']));
        if (typeof say === 'function') say(pick(['So warm 🔥','Cosy… 🥰','Marshmallows? 🍡','Stay by the fire with me 💛']));
        try{ state.energy = clamp(state.energy + 4); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 12). Two scene-gated, contained moments — one mystic,
   one starry. No always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   28) TAROT CARD  —  in the fortune teller's parlour (or the wizard's tower) a
   card lies face-down on the cloth. Tap to flip it: a gentle, always-kind reading
   appears with a little sparkle. Tap again to draw another. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxTarot(){
  try{
    const PARLORS = new Set(['fortuneteller','wizardtower','tarotparlor','tarotstudy','runecircle','apothecary']);
    let card = null;                     // {x,y,flip,face,cd,bob}
    const READINGS = [
      { icon:'☀️', name:'The Sun',   note:'Joy is coming your way 💛' },
      { icon:'⭐', name:'The Star',   note:'Hope, and a wish that comes true ✨' },
      { icon:'💗', name:'The Lovers', note:'A love that only grows 🥰' },
      { icon:'🌙', name:'The Moon',   note:'Sweet dreams tonight 🌙' },
      { icon:'🍀', name:'Fortune',    note:'Luck smiles on you today 🍀' },
      { icon:'🕊️', name:'Peace',      note:'Calm hearts and easy days 🕊️' },
    ];
    function inParlor(){ try{ return (typeof SCENES!=='undefined') && PARLORS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inParlor()){ card = null; return; }
      if (!card){ card = { x: Math.max(W*0.24, Math.min(W*0.76, W*0.5)), y: rand(H*0.6,H*0.68), flip:0, face:null, cd:0, bob:rand(0,Math.PI*2) }; }
      card.bob += dt; if (card.cd > 0) card.cd -= dt;
      if (card.flip > 0){ card.flip = Math.min(1, card.flip + dt*2.2); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!card || !inParlor()) return;
      const cw = 34, ch = 50;
      const x = card.x, y = card.y + Math.sin(card.bob*2)*1.2;
      // flip: scaleX goes 1 -> 0 (halfway) -> 1, swapping to the face at the midpoint
      const showFace = card.flip >= 0.5 || (card.flip === 0 ? false : false);
      const sx = card.flip === 0 ? 1 : Math.abs(Math.cos(Math.min(card.flip,1)*Math.PI));
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath(); ctx.ellipse(x, y + ch/2 + 4, cw*0.5, 4, 0, 0, 7); ctx.fill();
      ctx.translate(x, y); ctx.scale(Math.max(0.04, sx), 1);
      if (typeof roundRect === 'function'){ ctx.fillStyle = showFace ? '#fbf3e0' : '#3a2a6a'; roundRect(-cw/2, -ch/2, cw, ch, 4); ctx.fill(); }
      else { ctx.fillStyle = showFace ? '#fbf3e0' : '#3a2a6a'; ctx.fillRect(-cw/2, -ch/2, cw, ch); }
      // border
      ctx.strokeStyle = showFace ? '#caa24a' : '#8a7ad0'; ctx.lineWidth = 1.5;
      if (typeof roundRect === 'function'){ roundRect(-cw/2+2, -ch/2+2, cw-4, ch-4, 3); ctx.stroke(); }
      if (showFace && card.face){
        ctx.font = '18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle = '#3a2a20'; ctx.fillText(card.face.icon, 0, -6);
        ctx.font = '6px system-ui,sans-serif'; ctx.fillStyle = '#6b4a34';
        ctx.fillText(card.face.name, 0, 14);
      } else {
        // back pattern
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font = '16px serif'; ctx.fillText('✦', 0, 0);
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!card || !inParlor()) return false;
        if (px < card.x - 22 || px > card.x + 22 || py < card.y - 30 || py > card.y + 30) return false;
        if (card.cd > 0) return true;
        card.cd = 1.2;
        card.face = pick(READINGS); card.flip = 0.001;         // start the flip
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') for (let i=0;i<3;i++) setTimeout(()=> fxAt(card.x+rand(-14,14), card.y-20, pick(['✨','🔮','🌟'])), i*90);
        setTimeout(()=>{ try{ if (typeof showToast==='function') showToast(card.face.icon, card.face.name, card.face.note); else if (typeof say==='function') say(card.face.note); }catch(e){} }, 500);
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   29) STARGAZE  —  in starry night spots a little telescope stands ready. Tap it
   to peek through: a soft vignette iris shows a twinkling constellation for a few
   seconds while she names it, then fades. Only appears in those scenes.
   -------------------------------------------------------------------------- */
(function fxTelescope(){
  try{
    const SKIES = new Set(['starrymeadow','observatory','planetarium','moonlitjetty','campsite','starrycampsite']);
    let scope = null;                    // {x,y,cd,view,viewT,stars,name}
    function inSky(){ try{ return (typeof SCENES!=='undefined') && SKIES.has(SCENES[currentScene]); }catch(e){ return false; } }
    const NAMED = ['the Little Bear 🐻','the Swan 🦢','the Two Hearts 💞','the Wishing Star ⭐','the Lovers’ Knot 💗'];

    EXTRA_UPDATERS.push(function(dt){
      if (!inSky()){ scope = null; return; }
      if (!scope){ scope = { x: Math.max(W*0.18, Math.min(W*0.82, W*0.72)), y: rand(H*0.66,H*0.74), cd:0, view:0, viewT:0, stars:null, name:'' }; }
      if (scope.cd > 0) scope.cd -= dt;
      if (scope.view > 0){ scope.viewT += dt; if (scope.viewT >= 4) { scope.view = 0; scope.viewT = 0; } }
    });

    EXTRA_DRAWERS.push(function(){
      if (!scope || !inSky()) return;
      const x = scope.x, base = scope.y;
      ctx.save();
      // tripod + tube
      ctx.strokeStyle = '#4a4a55'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, base-6); ctx.lineTo(x-7, base+8); ctx.moveTo(x, base-6); ctx.lineTo(x+7, base+8); ctx.moveTo(x, base-6); ctx.lineTo(x, base+9); ctx.stroke();
      ctx.strokeStyle = '#6b6b7a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x-5, base-2); ctx.lineTo(x+11, base-14); ctx.stroke();
      ctx.fillStyle = '#8a8a9a'; ctx.beginPath(); ctx.arc(x+12, base-15, 3.4, 0, 7); ctx.fill();

      // the "look through" vision — a soft iris in the upper sky
      if (scope.view > 0 && scope.stars){
        const a = Math.min(1, scope.viewT < 0.4 ? scope.viewT/0.4 : (4 - scope.viewT)/0.6);
        const vx = W*0.5, vy = H*0.2, vr = 58;
        ctx.globalAlpha = Math.max(0, a);
        // dark disc
        ctx.fillStyle = 'rgba(10,12,30,0.92)';
        ctx.beginPath(); ctx.arc(vx, vy, vr, 0, 7); ctx.fill();
        // stars inside
        for (const s of scope.stars){
          const tw = 0.5 + 0.5*Math.sin(scope.viewT*4 + s.p);
          ctx.fillStyle = 'rgba(255,255,240,' + (0.4+0.6*tw).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(vx + s.dx, vy + s.dy, s.r, 0, 7); ctx.fill();
        }
        // connecting lines
        ctx.strokeStyle = 'rgba(190,210,255,0.5)'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i=0;i<scope.stars.length;i++){ const s=scope.stars[i]; if (i===0) ctx.moveTo(vx+s.dx, vy+s.dy); else ctx.lineTo(vx+s.dx, vy+s.dy); }
        ctx.stroke();
        // iris ring
        ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(vx, vy, vr+2, 0, 7); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,130,160,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!scope || !inSky()) return false;
        if (Math.hypot(px - scope.x, py - (scope.y - 8)) > 22) return false;
        if (scope.cd > 0) return true;
        scope.cd = 1.5;
        // compose a little constellation
        const n = 5, stars = [];
        for (let i=0;i<n;i++) stars.push({ dx: rand(-38,38), dy: rand(-34,34), r: rand(1.2,2.4), p: rand(0,Math.PI*2) });
        scope.stars = stars; scope.view = 1; scope.viewT = 0; scope.name = pick(NAMED);
        if (typeof sfx === 'function') sfx('find');
        if (typeof say === 'function') say('Look — ' + scope.name);
        try{ state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 13). Two scene-gated, contained moments — one calm,
   one playful. No always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   30) WIND CHIME  —  in the zen garden or tea house a chime hangs from above. Tap
   it to set the tubes swaying with a soft, peaceful ring; a few notes drift off
   and she breathes easy. Restores a touch of calm energy. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxWindChime(){
  try{
    const CALM = new Set(['zengarden','teahouse','teagarden','bamboo','hotspring','spa','bonsaigarden']);
    let chime = null;                    // {x,topY,swing,phase,cd}
    function inCalm(){ try{ return (typeof SCENES!=='undefined') && CALM.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inCalm()){ chime = null; return; }
      if (!chime){ chime = { x: Math.max(W*0.18, Math.min(W*0.86, W*0.80)), topY: H*0.10, swing: 0.04, phase: rand(0,Math.PI*2), cd:0 }; }
      chime.phase += dt * 3;
      chime.swing = Math.max(0.04, chime.swing - dt*0.12);    // a gentle breeze idle + decay after a ring
      if (chime.cd > 0) chime.cd -= dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!chime || !inCalm()) return;
      const x = chime.x, top = chime.topY;
      const ang = Math.sin(chime.phase) * chime.swing;
      ctx.save();
      // support cord to the top of the frame
      ctx.strokeStyle = 'rgba(120,100,80,0.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, top); ctx.stroke();
      // top cap
      ctx.fillStyle = '#8a6a45';
      ctx.beginPath(); ctx.ellipse(x, top, 10, 4, 0, 0, 7); ctx.fill();
      // tubes hanging, swaying together
      const tubes = 5, spread = 16, len = 26;
      for (let i=0;i<tubes;i++){
        const ox = (i - (tubes-1)/2) * (spread/(tubes-1)) * 2;
        const tl = len - Math.abs(i-(tubes-1)/2)*3;
        const bx = x + ox + Math.sin(chime.phase + i*0.4) * chime.swing * 40;
        const by = top + 4;
        ctx.strokeStyle = 'rgba(150,120,90,0.5)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x + ox*0.3, top); ctx.lineTo(bx, by); ctx.stroke();
        ctx.strokeStyle = '#c9b06a'; ctx.lineWidth = 2.4; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + tl*Math.sin(ang), by + tl*Math.cos(ang)); ctx.stroke();
      }
      // clapper + wind sail
      const cy = top + 4 + (len+8);
      const sailX = x + Math.sin(chime.phase*1.1) * chime.swing * 55;
      ctx.strokeStyle = 'rgba(150,120,90,0.5)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x, top+4); ctx.lineTo(sailX, cy); ctx.stroke();
      ctx.fillStyle = '#d98c4a';
      ctx.beginPath(); ctx.ellipse(sailX, cy, 5, 6, ang, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!chime || !inCalm()) return false;
        // generous column around the hanging tubes
        if (px < chime.x - 26 || px > chime.x + 26 || py < chime.topY - 4 || py > chime.topY + 60) return false;
        if (chime.cd > 0){ chime.swing = Math.min(0.5, chime.swing + 0.1); return true; }
        chime.cd = 0.8; chime.swing = Math.min(0.55, chime.swing + 0.42);
        if (typeof sfx === 'function'){ sfx('draw'); }
        if (typeof fxAt === 'function') for (let i=0;i<3;i++) setTimeout(()=> fxAt(chime.x+rand(-16,16), chime.topY+rand(20,40), pick(['♪','🎐','✨'])), i*100);
        if (typeof say === 'function') say(pick(['So peaceful 🎐','Mmm, listen… 😌','Like a soft breeze 💛','Ahhh 🍃']));
        try{ state.energy = clamp(state.energy + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   31) BUILD A SANDCASTLE  —  on the beach, tap the little mound of sand to shape
   it, tap by tap, into a castle with towers, a door and a flag (plus a shell or
   two). She helps and cheers when it's finished. Only on sandy scenes.
   -------------------------------------------------------------------------- */
(function fxSandcastle(){
  try{
    const SANDY = new Set(['beach','moonbeach','sanddunes','desertoasis']);
    let sc = null;                       // {x,y,stage,cd,doneT,flag}
    function onSand(){ try{ return (typeof SCENES!=='undefined') && SANDY.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!onSand()){ sc = null; return; }
      if (!sc){ sc = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.26)), y: rand(H*0.76,H*0.82), stage:0, cd:0, doneT:0, flag:rand(0,Math.PI*2) }; }
      if (sc.cd > 0) sc.cd -= dt; if (sc.doneT > 0) sc.doneT -= dt; sc.flag += dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!sc || !onSand()) return;
      const x = sc.x, base = sc.y, sand = '#e6c896', sand2 = '#d8b579';
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath(); ctx.ellipse(x, base+3, 24, 5, 0, 0, 7); ctx.fill();
      if (sc.stage === 0){
        ctx.fillStyle = sand; ctx.beginPath(); ctx.ellipse(x, base, 16, 8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(x-4, base-2, 5, 2.5, 0, 0, 7); ctx.fill();
      } else {
        // main keep (stage>=1)
        ctx.fillStyle = sand; ctx.fillRect(x-14, base-16, 28, 16);
        if (sc.stage >= 2){
          // corner towers
          ctx.fillRect(x-20, base-22, 8, 22);
          ctx.fillRect(x+12, base-22, 8, 22);
          // crenellations
          ctx.fillStyle = sand2;
          for (const tx of [x-20, x+12]){ ctx.fillRect(tx, base-25, 2.5, 3); ctx.fillRect(tx+3, base-25, 2.5, 3); ctx.fillRect(tx+6, base-25, 2, 3); }
        }
        if (sc.stage >= 3){
          // door
          ctx.fillStyle = sand2; ctx.beginPath(); ctx.moveTo(x-4, base); ctx.lineTo(x-4, base-7); ctx.arc(x, base-7, 4, Math.PI, 0); ctx.lineTo(x+4, base); ctx.closePath(); ctx.fill();
          // central tower + flag
          ctx.fillStyle = sand; ctx.fillRect(x-5, base-26, 10, 12);
          ctx.strokeStyle = '#7a5a35'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, base-26); ctx.lineTo(x, base-36); ctx.stroke();
          const wave = Math.sin(sc.flag*5)*2;
          ctx.fillStyle = '#e0556a'; ctx.beginPath(); ctx.moveTo(x, base-36); ctx.lineTo(x+9+wave, base-33.5); ctx.lineTo(x, base-31); ctx.closePath(); ctx.fill();
          // a shell and a starfish at the base
          ctx.font = '10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('🐚', x-24, base+2); ctx.fillText('⭐', x+24, base+1);
        }
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!sc || !onSand()) return false;
        if (Math.hypot(px - sc.x, py - (sc.y - 14)) > 30) return false;
        if (sc.cd > 0) return true;
        sc.cd = 0.4;
        if (typeof fxAt === 'function') fxAt(sc.x, sc.y - sc.stage*8 - 8, '✨');
        if (typeof sfx === 'function') sfx('tap');
        if (sc.stage < 3){
          sc.stage++;
          if (sc.stage === 3){
            sc.doneT = 3;
            if (typeof burstAt === 'function') burstAt(pick(['🏰','⭐','🐚']), sc.x, sc.y - 30);
            if (typeof hearts === 'function') hearts();
            if (typeof sfx === 'function') sfx('day');
            if (typeof say === 'function') say(pick(['Our castle! 🏰','It’s beautiful 🥰','Ta-daa! ⭐','King and queen of the beach 👑']));
            try{ state.fun = clamp(state.fun + 8); state.love = clamp(state.love + 4); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          } else {
            if (typeof say === 'function') say(pick(['Pat, pat… 🏖️','Add a tower! 🏰','Almost there!']));
            try{ state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
          }
        } else {
          if (typeof say === 'function') say(pick(['So proud of it 🏰','Don’t let the tide get it! 🌊','Perfect 🥰']));
          if (sc.doneT <= 0) sc.stage = 0;                     // a friendly boop starts a fresh one
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 14). Two scene-gated, contained moments — one serene,
   one playful. No always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   32) TEMPLE GONG  —  at the moon temple a great bronze gong hangs waiting. Tap it
   to strike a deep, resonant note: the disc quivers and rings of sound ripple
   outward while she bows her head in a peaceful moment. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxGong(){
  try{
    const TEMPLES = new Set(['moontemple','lotustemple','zentemple','shrine','pagoda']);
    let gong = null;                     // {x,y,r,quiver,cd,rings:[]}
    function inTemple(){ try{ return (typeof SCENES!=='undefined') && TEMPLES.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inTemple()){ gong = null; return; }
      if (!gong){ gong = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.74)), y: rand(H*0.42,H*0.52), r: 22, quiver:0, cd:0, rings:[] }; }
      if (gong.quiver > 0) gong.quiver -= dt; if (gong.cd > 0) gong.cd -= dt;
      for (let i=gong.rings.length-1;i>=0;i--){ const r=gong.rings[i]; r.t+=dt; if (r.t>=r.life) gong.rings.splice(i,1); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!gong || !inTemple()) return;
      const x = gong.x, y = gong.y, R = gong.r;
      const q = gong.quiver > 0 ? Math.sin(gong.quiver*40) * gong.quiver * 2 : 0;
      ctx.save();
      // sound rings behind
      for (const r of gong.rings){
        const k = r.t / r.life;
        ctx.globalAlpha = Math.max(0, 1 - k) * 0.35;
        ctx.strokeStyle = 'rgba(255,235,180,0.9)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, R + k*36, 0, 7); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // frame posts + top beam
      ctx.strokeStyle = '#6b2f2f'; ctx.lineWidth = 4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x-R-8, y-R-6); ctx.lineTo(x-R-8, y+R+10);
                       ctx.moveTo(x+R+8, y-R-6); ctx.lineTo(x+R+8, y+R+10);
                       ctx.moveTo(x-R-12, y-R-6); ctx.lineTo(x+R+12, y-R-6); ctx.stroke();
      // hanging cords
      ctx.strokeStyle = 'rgba(60,40,30,0.7)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x-R*0.6, y-R-6); ctx.lineTo(x-R*0.5+q, y-R*0.7);
                       ctx.moveTo(x+R*0.6, y-R-6); ctx.lineTo(x+R*0.5+q, y-R*0.7); ctx.stroke();
      // disc
      ctx.translate(q, 0);
      const g = ctx.createRadialGradient(x-6, y-6, 2, x, y, R);
      g.addColorStop(0, '#e8c46a'); g.addColorStop(0.7, '#c99a3a'); g.addColorStop(1, '#8a6a24');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
      ctx.strokeStyle = '#6a4e1a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R*0.6, 0, 7); ctx.stroke();
      ctx.fillStyle = '#a97e2a'; ctx.beginPath(); ctx.arc(x, y, R*0.18, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!gong || !inTemple()) return false;
        if (Math.hypot(px - gong.x, py - gong.y) > gong.r + 8) return false;
        if (gong.cd > 0) return true;
        gong.cd = 1.2; gong.quiver = 0.7;
        gong.rings.push({ t:0, life:1.4 }); setTimeout(()=>{ try{ if (gong) gong.rings.push({ t:0, life:1.6 }); }catch(e){} }, 160);
        if (typeof sfx === 'function') sfx('rest');
        if (typeof fxAt === 'function') fxAt(gong.x, gong.y - gong.r - 6, pick(['🔔','🎶','✨']));
        if (typeof say === 'function') say(pick(['Ommm… 🙏','So resonant 🔔','A moment of peace 😌','Feel it ring 💛']));
        try{ state.energy = clamp(state.energy + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   33) CATCH THE LEAVES  —  in the autumn forest, leaves tumble down on the breeze.
   Tap them as they fall to catch them; a quick run builds a little streak. Purely
   playful, and it only happens among the autumn trees.
   -------------------------------------------------------------------------- */
(function fxLeafCatch(){
  try{
    let leaves = null;                   // array of {x,y,vy,sway,phase,rot,rv,ch}
    let spawnT = 0, streak = 0, streakT = 0;
    function inAutumn(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'autumnforest'; }catch(e){ return false; } }
    const LEAVES = ['🍂','🍁','🍂','🍁','🌰'];

    EXTRA_UPDATERS.push(function(dt){
      if (!inAutumn()){ leaves = null; streak = 0; return; }
      if (!leaves) leaves = [];
      if (streakT > 0){ streakT -= dt; if (streakT <= 0) streak = 0; }
      spawnT -= dt;
      if (spawnT <= 0 && leaves.length < 4){
        spawnT = rand(1.4, 2.8);
        leaves.push({ x: rand(W*0.14, W*0.86), y: -12, vy: rand(24, 40), sway: rand(10,22), phase: rand(0,Math.PI*2), rot: rand(0,Math.PI*2), rv: rand(-1.2,1.2), ch: pick(LEAVES) });
      }
      for (let i=leaves.length-1;i>=0;i--){
        const l = leaves[i];
        l.phase += dt; l.rot += l.rv*dt;
        l.y += l.vy*dt; l.x += Math.sin(l.phase*1.3) * l.sway * dt;
        if (l.y > H*0.86) leaves.splice(i,1);            // reached the ground uncaught
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!leaves || !inAutumn() || !leaves.length) return;
      ctx.save();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      for (const l of leaves){
        ctx.globalAlpha = 0.95;
        ctx.font = '15px serif';
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.fillText(l.ch, 0, 0); ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!leaves || !inAutumn() || !leaves.length) return false;
        let hit = -1, best = 20;
        for (let i=0;i<leaves.length;i++){ const d = Math.hypot(px-leaves[i].x, py-leaves[i].y); if (d < best){ best=d; hit=i; } }
        if (hit < 0) return false;
        const l = leaves[hit]; leaves.splice(hit,1);
        streak++; streakT = 2.2;
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') fxAt(l.x, l.y-4, streak >= 2 ? ('×'+streak+' '+l.ch) : l.ch);
        const bonus = streak >= 3;
        if (bonus){ if (typeof hearts === 'function') hearts(); if (typeof say === 'function') say(pick(['Caught a bunch! 🍁','×'+streak+' — nice! 🍂','So many colours! 🥰'])); }
        else if (Math.random() < 0.4 && typeof say === 'function') say(pick(['Got it! 🍂','Pretty leaf 🍁','Autumn magic ✨']));
        try{ state.fun = clamp(state.fun + (bonus?4:2)); state.love = clamp(state.love + 1); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 15). Two scene-gated, contained rides. No always-on
   overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   34) FERRIS WHEEL RIDE  —  at the fair, a little ferris wheel turns in the sky.
   Tap it to send it spinning; the gondolas swing gently on their pivots as it
   goes, and she rides along with a delighted "wheee". Only at the ferris wheel.
   -------------------------------------------------------------------------- */
(function fxFerris(){
  try{
    let fw = null;                       // {x,y,r,ang,spin,cd,hue[]}
    function atFair(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'ferriswheel'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!atFair()){ fw = null; return; }
      if (!fw){ fw = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.68)), y: rand(H*0.30,H*0.38), r: 30, ang: 0, spin: 0.15, cd: 0,
                       hue: ['#ff8fab','#ffd166','#8ad3ff','#c8a2ff','#9be59b','#ff9e7a'] }; }
      fw.ang += fw.spin * dt;
      fw.spin += (0.15 - fw.spin) * Math.min(1, dt*0.6);       // ease back toward a gentle idle turn
      if (fw.cd > 0) fw.cd -= dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!fw || !atFair()) return;
      const x = fw.x, y = fw.y, R = fw.r, spokes = 6;
      ctx.save();
      // support legs to the ground
      ctx.strokeStyle = '#6b6b7a'; ctx.lineWidth = 2.4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x-14, y+R+18); ctx.moveTo(x, y); ctx.lineTo(x+14, y+R+18); ctx.stroke();
      // rim
      ctx.strokeStyle = '#d8d8e0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
      // spokes + gondolas
      for (let i=0;i<spokes;i++){
        const a = fw.ang + i*(Math.PI*2/spokes);
        const gx = x + Math.cos(a)*R, gy = y + Math.sin(a)*R;
        ctx.strokeStyle = 'rgba(210,210,225,0.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(gx, gy); ctx.stroke();
        // gondola hangs straight down from its pivot with a slight swing
        const sway = Math.sin(fw.ang*2 + i) * 0.12;
        ctx.save(); ctx.translate(gx, gy); ctx.rotate(sway);
        ctx.fillStyle = fw.hue[i % fw.hue.length];
        if (typeof roundRect === 'function'){ roundRect(-4.5, 1, 9, 7, 2); ctx.fill(); }
        else ctx.fillRect(-4.5, 1, 9, 7);
        ctx.strokeStyle = 'rgba(80,80,90,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-4.5,1); ctx.lineTo(0,-1); ctx.lineTo(4.5,1); ctx.stroke();
        ctx.restore();
      }
      // hub
      ctx.fillStyle = '#b0b0be'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!fw || !atFair()) return false;
        if (Math.hypot(px - fw.x, py - fw.y) > fw.r + 12) return false;
        if (fw.cd > 0){ fw.spin = Math.min(2.6, fw.spin + 0.5); return true; }
        fw.cd = 1; fw.spin = Math.min(2.8, fw.spin + 1.6);
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') fxAt(fw.x, fw.y - fw.r - 8, pick(['🎡','✨','🥰']));
        if (typeof say === 'function') say(pick(['Wheee! 🎡','To the top with you! 🥰','What a view! ✨','Round and round we go 💛']));
        try{ state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   35) PINWHEEL  —  in breezy, open scenes a paper pinwheel is planted in the
   ground. Tap it (as if to blow) and it whirs around in bright blurring colour,
   slowing gently back to an idle turn. A simple, cheerful fidget. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxPinwheel(){
  try{
    const BREEZY = new Set(['windmill','kitehill','backyard','flowerfield','hilltop','pasture','alpinemeadow','poppyfield','sunflowers','tulipfield']);
    let pw = null;                       // {x,y,ang,spin,cd,hue[]}
    function inBreeze(){ try{ return (typeof SCENES!=='undefined') && BREEZY.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inBreeze()){ pw = null; return; }
      if (!pw){ pw = { x: Math.max(W*0.16, Math.min(W*0.84, rand(W*0.2,W*0.4))), y: rand(H*0.66,H*0.74), ang:0, spin:0.6, cd:0,
                       hue: ['#ff6b8a','#ffd166','#6bb6ff','#9be59b'] }; }
      pw.ang += pw.spin * dt;
      pw.spin += (0.6 - pw.spin) * Math.min(1, dt*0.5);        // ease back to a soft idle whirl
      if (pw.cd > 0) pw.cd -= dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!pw || !inBreeze()) return;
      const x = pw.x, base = pw.y;
      ctx.save();
      // stick
      ctx.strokeStyle = '#9c6b3f'; ctx.lineWidth = 2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base-26); ctx.stroke();
      const cy = base - 28;
      // motion blur when spinning fast
      const fast = pw.spin > 1.6;
      ctx.translate(x, cy); ctx.rotate(pw.ang);
      for (let i=0;i<4;i++){
        ctx.rotate(Math.PI/2);
        ctx.globalAlpha = fast ? 0.6 : 0.95;
        ctx.fillStyle = pw.hue[i];
        // a pinwheel vane: triangle folded from the hub
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(9, -3); ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(3, 9); ctx.lineTo(0, 9); ctx.closePath();
        ctx.fillStyle = pw.hue[i]; ctx.globalAlpha = fast ? 0.4 : 0.75; ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, 7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!pw || !inBreeze()) return false;
        if (Math.hypot(px - pw.x, py - (pw.y - 28)) > 16) return false;
        if (pw.cd > 0){ pw.spin = Math.min(9, pw.spin + 1.5); return true; }
        pw.cd = 0.5; pw.spin = Math.min(10, pw.spin + 5);
        if (typeof sfx === 'function') sfx('tap');
        if (typeof fxAt === 'function') fxAt(pw.x, pw.y - 34, pick(['💨','✨','🌈']));
        if (typeof say === 'function') say(pick(['Whirrr! 💨','Faster! 😄','Round it goes ✨','Catch the breeze 🌈']));
        try{ state.fun = clamp(state.fun + 3); state.love = clamp(state.love + 1); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 16). Two scene-gated, contained moments — one musical,
   one breezy. No always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   36) JUKEBOX  —  in the diner, café or record shop a little jukebox glows in the
   corner. Tap it to drop a record: it spins, coloured lights chase around the
   arch, notes float out and she sways to the tune. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxJukebox(){
  try{
    const SPOTS = new Set(['diner','cafe','recordshop','jazzclub','malt shop','icecreamparlor']);
    let jb = null;                       // {x,y,spin,glow,cd,noteT}
    function inSpot(){ try{ return (typeof SCENES!=='undefined') && SPOTS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inSpot()){ jb = null; return; }
      if (!jb){ jb = { x: Math.max(W*0.16, Math.min(W*0.86, W*0.82)), y: rand(H*0.6,H*0.68), spin: 0, glow: 0, cd: 0, noteT: 0 }; }
      if (jb.glow > 0){
        jb.glow -= dt; jb.spin += dt * 5;
        jb.noteT -= dt;
        if (jb.noteT <= 0){ jb.noteT = 0.5; const h=(typeof SHEETS!=='undefined'&&SHEETS.walk&&SHEETS.walk.displayH)||150; if (typeof fxAt==='function') fxAt(jb.x - rand(4,14), jb.y - rand(20,30), pick(['♪','♫','🎵','🎶'])); }
      }
      if (jb.cd > 0) jb.cd -= dt;
    });

    EXTRA_DRAWERS.push(function(){
      if (!jb || !inSpot()) return;
      const x = jb.x, y = jb.y, playing = jb.glow > 0;
      ctx.save();
      // cabinet
      ctx.fillStyle = '#7a3b2a';
      if (typeof roundRect === 'function'){ roundRect(x-16, y-30, 32, 42, 6); ctx.fill(); }
      else ctx.fillRect(x-16, y-30, 32, 42);
      // glowing arch top
      const arcCol = playing ? 'hsl(' + ((jb.spin*40)%360).toFixed(0) + ',80%,60%)' : '#c98a3a';
      ctx.strokeStyle = arcCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y-22, 12, Math.PI, 0); ctx.stroke();
      // chasing lights
      for (let i=0;i<6;i++){ const a = Math.PI + i*(Math.PI/5); const lx = x+Math.cos(a)*12, ly = y-22+Math.sin(a)*12; ctx.fillStyle = playing ? 'hsl(' + ((jb.spin*60 + i*50)%360).toFixed(0) + ',85%,65%)' : 'rgba(200,180,120,0.5)'; ctx.beginPath(); ctx.arc(lx, ly, 1.6, 0, 7); ctx.fill(); }
      // speaker grille / window with a spinning record
      ctx.fillStyle = '#2a1a14'; if (typeof roundRect==='function'){ roundRect(x-11, y-18, 22, 16, 3); ctx.fill(); } else ctx.fillRect(x-11,y-18,22,16);
      ctx.save(); ctx.translate(x, y-10); ctx.rotate(jb.spin);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0,0,6,0,7); ctx.fill();
      ctx.fillStyle = '#e0556a'; ctx.beginPath(); ctx.arc(0,0,2,0,7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(5.4, 0); ctx.stroke();
      ctx.restore();
      // buttons
      ctx.fillStyle = '#e8c46a'; ctx.fillRect(x-10, y+2, 20, 3);
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!jb || !inSpot()) return false;
        if (px < jb.x - 18 || px > jb.x + 18 || py < jb.y - 36 || py > jb.y + 14) return false;
        if (jb.cd > 0) return true;
        jb.cd = 1.2; jb.glow = 3.4;
        if (typeof sfx === 'function') sfx('day');
        if (typeof say === 'function') say(pick(['Our song! 🎶','Dance with me? 💃','Turn it up 🥰','I love this one 🎵']));
        try{ state.fun = clamp(state.fun + 5); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   37) TREE SWING  —  in the backyard or up by the treehouse a rope swing hangs
   from a branch. Give it a push and it sways back and forth like a real pendulum,
   easing to rest. A quiet, nostalgic little joy. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxSwing(){
  try{
    const YARDS = new Set(['backyard','treehouse','orchard','park','playground','gardenmaze']);
    let sw = null;                       // {ax,ay,len,ang,vel,cd}
    function inYard(){ try{ return (typeof SCENES!=='undefined') && YARDS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inYard()){ sw = null; return; }
      if (!sw){ sw = { ax: Math.max(W*0.18, Math.min(W*0.82, W*0.24)), ay: H*0.30, len: 42, ang: 0.05, vel: 0, cd: 0 }; }
      // pendulum: angular accel = -(g/L) sin(ang), with light damping
      const g = 40;
      sw.vel += -(g/sw.len) * Math.sin(sw.ang) * dt;
      sw.vel *= 0.995;
      sw.ang += sw.vel * dt;
      if (sw.cd > 0) sw.cd -= dt;
    });

    function seatPos(){ return { sx: sw.ax + Math.sin(sw.ang)*sw.len, sy: sw.ay + Math.cos(sw.ang)*sw.len }; }

    EXTRA_DRAWERS.push(function(){
      if (!sw || !inYard()) return;
      const { sx, sy } = seatPos();
      ctx.save();
      // branch anchor
      ctx.strokeStyle = '#5a3f28'; ctx.lineWidth = 5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(sw.ax-22, sw.ay-3); ctx.lineTo(sw.ax+22, sw.ay+1); ctx.stroke();
      // ropes
      ctx.strokeStyle = '#b8895a'; ctx.lineWidth = 1.4;
      const perp = sw.ang;
      const seatHalf = 7;
      const lx = sx - Math.cos(perp)*seatHalf, ly = sy + Math.sin(perp)*seatHalf;
      const rx = sx + Math.cos(perp)*seatHalf, ry = sy - Math.sin(perp)*seatHalf;
      ctx.beginPath(); ctx.moveTo(sw.ax-2, sw.ay); ctx.lineTo(lx, ly);
                       ctx.moveTo(sw.ax+2, sw.ay); ctx.lineTo(rx, ry); ctx.stroke();
      // seat plank
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(-sw.ang);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(-8, -2, 16, 4);
      ctx.restore();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!sw || !inYard()) return false;
        const { sx, sy } = seatPos();
        if (Math.hypot(px - sx, py - sy) > 18) return false;
        if (sw.cd > 0){ sw.vel += (sw.ang >= 0 ? 0.5 : -0.5); return true; }
        sw.cd = 0.5;
        // push in the direction it's already headed for a satisfying build-up
        const dir = (sw.vel >= 0) ? 1 : -1;
        sw.vel += dir * 1.4;
        if (typeof sfx === 'function') sfx('tap');
        if (typeof fxAt === 'function') fxAt(sx, sy - 12, pick(['🌳','✨','😄']));
        if (typeof say === 'function') say(pick(['Higher! 😄','Wheee, push me! 🥰','Just like being a kid 💛','Back and forth ✨']));
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 17). Two scene-gated micro-interactions. No always-on
   overlays; each lives only in its scene, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   38) TEND THE HIVE  —  in the beekeeper's garden a little skep hive hums. Tap it
   gently and a few bees loop out and back while a bead of golden honey drips from
   the comb; the air smells sweet. Only in the beekeeper garden.
   -------------------------------------------------------------------------- */
(function fxBeehive(){
  try{
    let hive = null;                     // {x,y,cd,bees:[],drips:[],t}
    function atHive(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'beekeepergarden'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!atHive()){ hive = null; return; }
      if (!hive){ hive = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.72)), y: rand(H*0.6,H*0.68), cd:0, bees:[], drips:[], t:rand(0,10) }; }
      hive.t += dt; if (hive.cd > 0) hive.cd -= dt;
      // idle: a lone bee now and then
      if (hive.bees.length < 5 && Math.random() < dt*0.6) hive.bees.push({ a: rand(0,Math.PI*2), r: rand(10,16), sp: rand(1.5,3)*(Math.random()<0.5?-1:1), life: rand(3,6), t:0, cx: hive.x+rand(-6,6), cy: hive.y-6+rand(-4,4) });
      for (let i=hive.bees.length-1;i>=0;i--){ const b=hive.bees[i]; b.t+=dt; b.a+=b.sp*dt; if (b.t>=b.life) hive.bees.splice(i,1); }
      for (let i=hive.drips.length-1;i>=0;i--){ const d=hive.drips[i]; d.t+=dt; d.y+=d.vy*dt; d.vy+=60*dt; if (d.t>=d.life) hive.drips.splice(i,1); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!hive || !atHive()) return;
      const x = hive.x, y = hive.y;
      ctx.save();
      // hanging branch peg
      ctx.strokeStyle = 'rgba(90,70,45,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y-22); ctx.lineTo(x, y-16); ctx.stroke();
      // skep (coiled straw dome) as stacked ellipses
      for (let i=0;i<4;i++){ const w = 16 - i*3, yy = y - 2 - i*5; ctx.fillStyle = i%2? '#d9a642':'#c9962f'; ctx.beginPath(); ctx.ellipse(x, yy, w, 4, 0, 0, 7); ctx.fill(); }
      // entrance
      ctx.fillStyle = '#5a3f1a'; ctx.beginPath(); ctx.ellipse(x, y-3, 3, 2.4, 0, 0, 7); ctx.fill();
      // honey drips
      for (const d of hive.drips){ ctx.globalAlpha = Math.max(0, 1 - d.t/d.life); ctx.fillStyle = '#f2b21a'; ctx.beginPath(); ctx.ellipse(d.x, d.y, 1.8, 2.6, 0, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      // bees looping around
      for (const b of hive.bees){ const bx = b.cx + Math.cos(b.a)*b.r*1.4, by = b.cy + Math.sin(b.a)*b.r; ctx.fillStyle = '#f2c21a'; ctx.beginPath(); ctx.ellipse(bx, by, 2, 1.4, b.a, 0, 7); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=0.4; ctx.beginPath(); ctx.moveTo(bx-1.4,by); ctx.lineTo(bx+1.4,by); ctx.stroke(); }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!hive || !atHive()) return false;
        if (Math.hypot(px - hive.x, py - (hive.y - 8)) > 22) return false;
        if (hive.cd > 0) return true;
        hive.cd = 1;
        for (let i=0;i<4;i++) hive.bees.push({ a: rand(0,Math.PI*2), r: rand(10,18), sp: rand(2,3.5)*(Math.random()<0.5?-1:1), life: rand(2.5,4.5), t:0, cx: hive.x+rand(-6,6), cy: hive.y-6+rand(-4,4) });
        hive.drips.push({ x: hive.x+rand(-4,4), y: hive.y+2, vy: 6, t:0, life: 1.4 });
        if (typeof sfx === 'function') sfx('draw');
        if (typeof fxAt === 'function') fxAt(hive.x, hive.y - 26, pick(['🐝','🍯','✨']));
        if (typeof say === 'function') say(pick(['Sweet honey 🍯','Busy little bees 🐝','Mind the buzz 😊','Smells lovely 💛']));
        try{ state.fun = clamp(state.fun + 3); state.hunger = clamp(state.hunger + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   39) SEA OTTER  —  in the kelp forest a little sea otter floats on its back among
   the fronds. Tap to give its tummy a gentle rub — it wriggles happily, taps a
   shell on a rock, and drifts on the swell. Only in the kelp forest.
   -------------------------------------------------------------------------- */
(function fxOtter(){
  try{
    let ot = null;                       // {x,y,t,vx,wriggle,cd}
    function inKelp(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'kelpforest'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inKelp()){ ot = null; return; }
      if (!ot){ ot = { x: rand(W*0.3,W*0.7), y: rand(H*0.46,H*0.56), t:rand(0,10), vx: rand(4,8)*(Math.random()<0.5?-1:1), wriggle:0, cd:0 }; }
      ot.t += dt; if (ot.wriggle > 0) ot.wriggle -= dt; if (ot.cd > 0) ot.cd -= dt;
      ot.x += ot.vx*dt;
      if (ot.x < W*0.2){ ot.x = W*0.2; ot.vx = Math.abs(ot.vx); }
      if (ot.x > W*0.8){ ot.x = W*0.8; ot.vx = -Math.abs(ot.vx); }
    });

    EXTRA_DRAWERS.push(function(){
      if (!ot || !inKelp()) return;
      const x = ot.x, y = ot.y + Math.sin(ot.t*1.5)*2;
      const wig = ot.wriggle > 0 ? Math.sin(ot.wriggle*30)*2 : 0;
      ctx.save();
      // water sheen ellipse
      ctx.fillStyle = 'rgba(120,170,190,0.2)'; ctx.beginPath(); ctx.ellipse(x, y+4, 20, 5, 0, 0, 7); ctx.fill();
      // body floating on back
      ctx.fillStyle = '#7a5236';
      ctx.beginPath(); ctx.ellipse(x, y, 16, 7, 0, 0, 7); ctx.fill();
      // lighter tummy
      ctx.fillStyle = '#a9805a';
      ctx.beginPath(); ctx.ellipse(x, y-1, 12, 4.5, 0, 0, 7); ctx.fill();
      // head
      ctx.fillStyle = '#6b4830';
      ctx.beginPath(); ctx.arc(x-14, y-2, 5, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a1a12'; ctx.beginPath(); ctx.arc(x-16, y-3, 0.9, 0, 7); ctx.arc(x-15, y-1.5, 0.9, 0, 7); ctx.fill();
      // little paws holding a shell on the tummy (paws wriggle when petted)
      ctx.fillStyle = '#5a3f2a';
      ctx.beginPath(); ctx.arc(x+2+wig, y-4, 2, 0, 7); ctx.arc(x+6-wig, y-4, 2, 0, 7); ctx.fill();
      ctx.font = '7px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🐚', x+4, y-6);
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!ot || !inKelp()) return false;
        if (px < ot.x - 20 || px > ot.x + 20 || py < ot.y - 12 || py > ot.y + 10) return false;
        if (typeof fxAt === 'function') fxAt(ot.x, ot.y - 12, pick(['🦦','💗','🐚']));
        if (ot.cd <= 0){
          ot.cd = 1.2; ot.wriggle = 0.6;
          if (typeof sfx === 'function') sfx('tap');
          if (typeof say === 'function') say(pick(['An otter! 🦦','So cute 🥰','It’s cracking a shell 🐚','Hello, floaty friend 💛']));
          try{ state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 18). Two scene-gated micro-interactions. No always-on
   overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   40) CHEESE TASTING  —  in the cheese cave a little wheel sits on a board. Tap to
   cut and taste a wedge; she savours each one and the wheel slowly empties, then
   a fresh one is set out. A cosy little tasting. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxCheese(){
  try{
    const SHOPS = new Set(['cheesecave','cheeseshop']);
    let wheel = null;                    // {x,y,eaten,cd,refresh}
    function inShop(){ try{ return (typeof SCENES!=='undefined') && SHOPS.has(SCENES[currentScene]); }catch(e){ return false; } }
    const NOTES = ['Mmm, nutty 🧀','Sharp! 😋','So creamy 🥰','One more taste? 🧀','Divine 💛'];

    EXTRA_UPDATERS.push(function(dt){
      if (!inShop()){ wheel = null; return; }
      if (!wheel){ wheel = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.72)), y: rand(H*0.66,H*0.74), eaten:0, cd:0, refresh:0 }; }
      if (wheel.cd > 0) wheel.cd -= dt;
      if (wheel.refresh > 0){ wheel.refresh -= dt; if (wheel.refresh <= 0){ wheel.eaten = 0; } }
    });

    EXTRA_DRAWERS.push(function(){
      if (!wheel || !inShop()) return;
      const x = wheel.x, y = wheel.y, R = 15;
      ctx.save();
      // board
      ctx.fillStyle = '#7a5233';
      if (typeof roundRect === 'function'){ roundRect(x-22, y+7, 44, 6, 3); ctx.fill(); } else ctx.fillRect(x-22, y+7, 44, 6);
      // cheese wheel (top view slightly tilted) with wedges removed
      const total = 6, left = total - wheel.eaten;
      ctx.translate(x, y);
      for (let i=0;i<total;i++){
        const a0 = (i/total)*Math.PI*2 - Math.PI/2, a1 = ((i+1)/total)*Math.PI*2 - Math.PI/2;
        const gone = i >= left;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R,a0,a1); ctx.closePath();
        ctx.fillStyle = gone ? 'rgba(90,60,35,0.25)' : '#f2d67a';
        ctx.fill();
        if (!gone){ ctx.strokeStyle = '#d9b84a'; ctx.lineWidth = 0.6; ctx.stroke(); }
      }
      // rind
      ctx.strokeStyle = '#e0a83a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0,R,0,7); ctx.stroke();
      // a couple of holes
      ctx.fillStyle = 'rgba(200,160,60,0.7)'; if (left>0){ ctx.beginPath(); ctx.arc(-4,-3,1.6,0,7); ctx.arc(3,4,1.2,0,7); ctx.fill(); }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!wheel || !inShop()) return false;
        if (Math.hypot(px - wheel.x, py - wheel.y) > 20) return false;
        if (wheel.cd > 0) return true;
        wheel.cd = 0.9;
        if (typeof sfx === 'function') sfx('feed');
        if (typeof burstAt === 'function') burstAt('🧀', wheel.x, wheel.y - 10);
        if (typeof say === 'function') say(pick(NOTES));
        try{ state.hunger = clamp(state.hunger + 5); state.love = clamp(state.love + 2); state.fun = clamp(state.fun + 1); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        wheel.eaten++;
        if (wheel.eaten >= 6){
          wheel.refresh = 3;
          if (typeof hearts === 'function') hearts();
          if (typeof say === 'function') setTimeout(()=>{ try{ say('All gone — that was lovely 🥰'); }catch(e){} }, 900);
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   41) LIGHT A LANTERN  —  at the lantern festival a paper lantern waits, unlit. Tap
   to light it: it glows warm, lifts gently into the night, and drifts up and away
   carrying a little wish. Another takes its place. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxLantern(){
  try{
    const FEST = new Set(['lanternfestival','nightmarket','riverlanterns','templenight']);
    let lan = null;                      // {x,y,lit,rise,glow,hue,cd,sway}
    function atFest(){ try{ return (typeof SCENES!=='undefined') && FEST.has(SCENES[currentScene]); }catch(e){ return false; } }
    function fresh(){ lan = { x: Math.max(W*0.2, Math.min(W*0.8, rand(W*0.35,W*0.65))), y: rand(H*0.62,H*0.7), lit:false, rise:0, glow:0, hue: pick(['#ff8f4a','#ff5b6a','#ffd166','#ff9ec4']), cd:0, sway:rand(0,Math.PI*2) }; }

    EXTRA_UPDATERS.push(function(dt){
      if (!atFest()){ lan = null; return; }
      if (!lan){ fresh(); }
      lan.sway += dt; if (lan.cd > 0) lan.cd -= dt;
      if (lan.lit){
        lan.glow = Math.min(1, lan.glow + dt*2);
        lan.rise += dt;
        lan.y -= (12 + lan.rise*8) * dt;                       // accelerates upward
        lan.x += Math.sin(lan.sway*0.8) * 6 * dt;
        if (lan.y < -30) fresh();                              // gone into the sky; set out another
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!lan || !atFest()) return;
      const x = lan.x + (lan.lit ? Math.sin(lan.sway*1.4)*2 : 0), y = lan.y;
      const w = 12, h = 16;
      ctx.save();
      if (lan.lit && lan.glow > 0){
        const g = ctx.createRadialGradient(x, y, 0, x, y, 26);
        g.addColorStop(0, 'rgba(255,190,110,' + (0.5*lan.glow).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,190,110,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill();
      }
      // top and bottom caps
      ctx.fillStyle = '#7a3b2a'; ctx.fillRect(x-5, y-h/2-2, 10, 2); ctx.fillRect(x-5, y+h/2, 10, 2);
      // body
      ctx.fillStyle = lan.lit ? lan.hue : '#9a6a55';
      ctx.beginPath(); ctx.ellipse(x, y, w/2, h/2, 0, 0, 7); ctx.fill();
      // ribs
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x, y-h/2); ctx.lineTo(x, y+h/2); ctx.moveTo(x-w/4, y-h*0.4); ctx.lineTo(x-w/4, y+h*0.4); ctx.moveTo(x+w/4, y-h*0.4); ctx.lineTo(x+w/4, y+h*0.4); ctx.stroke();
      // tassel
      ctx.strokeStyle = '#e0b04a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y+h/2+2); ctx.lineTo(x, y+h/2+6); ctx.stroke();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!lan || !atFest() || lan.lit) return false;
        if (px < lan.x - 11 || px > lan.x + 11 || py < lan.y - 14 || py > lan.y + 12) return false;
        if (lan.cd > 0) return true;
        lan.cd = 0.5; lan.lit = true; lan.glow = 0.15;
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') fxAt(lan.x, lan.y - 14, pick(['🏮','✨','💛']));
        if (typeof say === 'function') say(pick(['Make a wish and let it go… 🏮','Up it floats ✨','So beautiful 🥰','I wished for us 💛']));
        try{ state.love = clamp(state.love + 5); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 19). Two scene-gated micro-interactions. No always-on
   overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   42) MUSIC BOX  —  in the orchid room or bonsai garden a little music box waits.
   Tap its crank to wind it: the lid opens, a tiny dancer turns, and a soft trickle
   of notes drifts out while the winding slowly unwinds. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxMusicBox(){
  try{
    const ROOMS = new Set(['orchidroom','bonsaigarden','teahouse','conservatory','parlor']);
    let mb = null;                       // {x,y,wind,spin,cd,noteT}
    function inRoom(){ try{ return (typeof SCENES!=='undefined') && ROOMS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inRoom()){ mb = null; return; }
      if (!mb){ mb = { x: Math.max(W*0.18, Math.min(W*0.86, W*0.80)), y: rand(H*0.64,H*0.72), wind:0, spin:0, cd:0, noteT:0 }; }
      if (mb.cd > 0) mb.cd -= dt;
      if (mb.wind > 0){
        mb.wind = Math.max(0, mb.wind - dt*0.5);              // slowly unwinds
        mb.spin += dt * (2 + mb.wind*3);
        mb.noteT -= dt;
        if (mb.noteT <= 0){ mb.noteT = 0.6; if (typeof fxAt==='function') fxAt(mb.x + rand(-6,6), mb.y - rand(18,28), pick(['♪','♫','🎵'])); }
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!mb || !inRoom()) return;
      const x = mb.x, y = mb.y, open = mb.wind > 0;
      ctx.save();
      // box body
      ctx.fillStyle = '#8a4a5a';
      if (typeof roundRect === 'function'){ roundRect(x-13, y-6, 26, 16, 3); ctx.fill(); } else ctx.fillRect(x-13, y-6, 26, 16);
      ctx.fillStyle = '#c9a24a'; ctx.fillRect(x-13, y+8, 26, 2);       // gold trim
      // lid (open when playing)
      ctx.save(); ctx.translate(x-13, y-6); ctx.rotate(open ? -1.0 : -0.1);
      ctx.fillStyle = '#9a5a6a'; ctx.fillRect(0, -3, 26, 3);
      ctx.restore();
      // dancer rising from the box when open
      if (open){
        ctx.save(); ctx.translate(x, y-8); ctx.rotate(Math.sin(mb.spin)*0.4);
        ctx.fillStyle = '#f7c7d6';                                    // tutu
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(5,4); ctx.lineTo(-5,4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe0c2'; ctx.beginPath(); ctx.arc(0,-4,2.4,0,7); ctx.fill();   // head
        ctx.strokeStyle = '#e0a0b0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0,-1); ctx.lineTo(0,3); ctx.stroke();
        ctx.restore();
      }
      // winding crank on the side
      ctx.save(); ctx.translate(x+14, y+2); ctx.rotate(mb.spin*0.6);
      ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(4,0); ctx.stroke();
      ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(4,0,1.6,0,7); ctx.fill();
      ctx.restore();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!mb || !inRoom()) return false;
        if (px < mb.x - 16 || px > mb.x + 20 || py < mb.y - 20 || py > mb.y + 12) return false;
        if (mb.cd > 0){ mb.wind = Math.min(1, mb.wind + 0.2); return true; }
        mb.cd = 0.8; mb.wind = Math.min(1, mb.wind + 0.7);
        if (typeof sfx === 'function') sfx('draw');
        if (typeof fxAt === 'function') fxAt(mb.x, mb.y - 22, pick(['🎶','✨','💛']));
        if (typeof say === 'function') say(pick(['Our little tune 🎶','Wind it again? 🥰','So delicate ✨','She’s dancing! 💃']));
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); state.energy = clamp(state.energy + 1); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   43) FEED THE PENGUIN  —  at the penguin cove a little penguin waddles on the ice.
   Tap it to toss a fish; it tips its head back, gulps it down, and flaps happily.
   Only at the cove. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxPenguin(){
  try{
    let pg = null;                       // {x,y,dir,t,flap,gulp,cd,vx}
    function atCove(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'penguincove'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!atCove()){ pg = null; return; }
      if (!pg){ pg = { x: rand(W*0.3,W*0.7), y: rand(H*0.74,H*0.80), dir:(Math.random()<0.5?-1:1), t:rand(0,10), flap:0, gulp:0, cd:0, vx: rand(8,14) }; }
      pg.t += dt; if (pg.flap > 0) pg.flap -= dt; if (pg.gulp > 0) pg.gulp -= dt; if (pg.cd > 0) pg.cd -= dt;
      if (pg.gulp <= 0){                                        // waddle side to side, pausing to gulp
        pg.x += pg.dir * pg.vx * dt;
        if (pg.x < W*0.24){ pg.x = W*0.24; pg.dir = 1; } if (pg.x > W*0.76){ pg.x = W*0.76; pg.dir = -1; }
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!pg || !atCove()) return;
      const waddle = Math.sin(pg.t*6) * 1.5;
      const x = pg.x, y = pg.y;
      const tip = pg.gulp > 0 ? -0.5 : 0;                       // head tips back to swallow
      ctx.save();
      // shadow on ice
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(x, y+2, 10, 3, 0, 0, 7); ctx.fill();
      ctx.translate(x + waddle, y);
      // body
      ctx.fillStyle = '#2a2a33'; ctx.beginPath(); ctx.ellipse(0, -9, 8, 11, 0, 0, 7); ctx.fill();
      // white belly
      ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.ellipse(0, -8, 5, 8.5, 0, 0, 7); ctx.fill();
      // flippers (flap when fed)
      const fl = pg.flap > 0 ? Math.sin(pg.flap*30)*0.6 : 0;
      ctx.fillStyle = '#22222a'; ctx.save(); ctx.translate(-7,-9); ctx.rotate(-0.3 - fl); ctx.fillRect(-1,0,2.5,9); ctx.restore();
      ctx.save(); ctx.translate(7,-9); ctx.rotate(0.3 + fl); ctx.fillRect(-1.5,0,2.5,9); ctx.restore();
      // head
      ctx.save(); ctx.rotate(tip);
      ctx.fillStyle = '#2a2a33'; ctx.beginPath(); ctx.arc(0,-20,5.5,0,7); ctx.fill();
      ctx.fillStyle = '#ffb03a'; ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(6,-19); ctx.lineTo(0,-17.5); ctx.closePath(); ctx.fill();  // beak
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-1.6,-21,1,0,7); ctx.arc(1.6,-21,1,0,7); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-1.6,-21,0.5,0,7); ctx.arc(1.6,-21,0.5,0,7); ctx.fill();
      ctx.restore();
      // feet
      ctx.fillStyle = '#ffb03a'; ctx.beginPath(); ctx.ellipse(-3,1,2.4,1.2,0,0,7); ctx.ellipse(3,1,2.4,1.2,0,0,7); ctx.fill();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!pg || !atCove()) return false;
        if (px < pg.x - 14 || px > pg.x + 14 || py < pg.y - 30 || py > pg.y + 6) return false;
        if (pg.cd > 0) return true;
        pg.cd = 1.1; pg.flap = 0.7; pg.gulp = 0.6;
        if (typeof sfx === 'function') sfx('feed');
        if (typeof fxAt === 'function') fxAt(pg.x, pg.y - 30, pick(['🐟','🐧','💗']));
        if (typeof say === 'function') say(pick(['Here you go, little one! 🐟','So hungry 🐧','Flippers up! 🥰','He gobbled it! 😄']));
        try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 20). Two scene-gated micro-interactions. No always-on
   overlays; each lives only in its scene, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   44) GRIND THE HERBS  —  in the herb shed a mortar and pestle sits ready. Tap to
   grind: the pestle circles, the herbs turn a deeper green, and a little cloud of
   fragrance rises. Restores a touch of calm. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxMortar(){
  try{
    const SHEDS = new Set(['herbshed','apothecary','potionkitchen','herbalist']);
    let mp = null;                       // {x,y,grind,fine,cd,ang}
    function inShed(){ try{ return (typeof SCENES!=='undefined') && SHEDS.has(SCENES[currentScene]); }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inShed()){ mp = null; return; }
      if (!mp){ mp = { x: Math.max(W*0.2, Math.min(W*0.8, W*0.74)), y: rand(H*0.66,H*0.74), grind:0, fine:0, cd:0, ang:0 }; }
      if (mp.cd > 0) mp.cd -= dt;
      if (mp.grind > 0){ mp.grind -= dt; mp.ang += dt*10; mp.fine = Math.min(1, mp.fine + dt*0.4); }
      else if (mp.fine > 0){ mp.fine = Math.max(0, mp.fine - dt*0.06); }   // slowly settles back
    });

    EXTRA_DRAWERS.push(function(){
      if (!mp || !inShed()) return;
      const x = mp.x, y = mp.y, grinding = mp.grind > 0;
      const off = grinding ? Math.cos(mp.ang)*2.5 : 0, offy = grinding ? Math.sin(mp.ang)*1.5 : 0;
      ctx.save();
      // bowl (mortar)
      ctx.fillStyle = '#9a8a7a';
      ctx.beginPath(); ctx.moveTo(x-13, y-4); ctx.quadraticCurveTo(x, y+12, x+13, y-4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a6a5a'; ctx.beginPath(); ctx.ellipse(x, y-4, 13, 4, 0, 0, 7); ctx.fill();
      // ground herbs inside — greener/finer as fine rises
      const green = Math.round(90 + mp.fine*60);
      ctx.fillStyle = 'rgba(' + (60-mp.fine*20) + ',' + green + ',' + (50) + ',0.9)';
      ctx.beginPath(); ctx.ellipse(x+off*0.4, y-3, 7, 2.2, 0, 0, 7); ctx.fill();
      // little leaf flecks
      ctx.fillStyle = 'rgba(80,140,60,0.8)';
      for (let i=0;i<3;i++){ const fx = x - 4 + i*4 + off*0.3; ctx.beginPath(); ctx.arc(fx, y-3, 1 - mp.fine*0.5, 0, 7); ctx.fill(); }
      // pestle
      ctx.save(); ctx.translate(x+off, y-9+offy); ctx.rotate(0.5 + (grinding?Math.sin(mp.ang)*0.15:0));
      ctx.strokeStyle = '#8a7a6a'; ctx.lineWidth = 4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(7,-12); ctx.stroke();
      ctx.fillStyle = '#9a8a7a'; ctx.beginPath(); ctx.arc(0,0,2.6,0,7); ctx.fill();
      ctx.restore();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!mp || !inShed()) return false;
        if (Math.hypot(px - mp.x, py - (mp.y - 4)) > 20) return false;
        if (mp.cd > 0){ mp.grind = Math.min(1.5, mp.grind + 0.4); return true; }
        mp.cd = 0.6; mp.grind = Math.min(1.6, mp.grind + 0.9);
        if (typeof sfx === 'function') sfx('draw');
        if (typeof fxAt === 'function') fxAt(mp.x, mp.y - 14, pick(['🌿','✨','🍃']));
        if (typeof say === 'function') say(pick(['Smells so fresh 🌿','Grind, grind… 😌','Herbal magic 🍃','Lovely and fragrant 💛']));
        try{ state.energy = clamp(state.energy + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   45) TIDAL-CAVE CRAB  —  in the tidal cave a little crab sidles across the wet
   rocks. Tap it and it scuttles off with a startled claw-wave and a puff of
   bubbles, then peeks back out. Only in the tidal cave. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxCrab(){
  try{
    let crab = null;                     // {x,y,dir,t,scuttle,cd,vx}
    function inCave(){ try{ return (typeof SCENES!=='undefined') && SCENES[currentScene] === 'tidalcave'; }catch(e){ return false; } }

    EXTRA_UPDATERS.push(function(dt){
      if (!inCave()){ crab = null; return; }
      if (!crab){ crab = { x: rand(W*0.3,W*0.7), y: rand(H*0.76,H*0.82), dir:(Math.random()<0.5?-1:1), t:rand(0,10), scuttle:0, cd:0, vx: rand(10,16) }; }
      crab.t += dt; if (crab.cd > 0) crab.cd -= dt;
      const speed = crab.scuttle > 0 ? crab.vx*3 : crab.vx*0.5;
      if (crab.scuttle > 0) crab.scuttle -= dt;
      crab.x += crab.dir * speed * dt;
      if (crab.x < W*0.2){ crab.x = W*0.2; crab.dir = 1; } if (crab.x > W*0.8){ crab.x = W*0.8; crab.dir = -1; }
    });

    EXTRA_DRAWERS.push(function(){
      if (!crab || !inCave()) return;
      const bob = Math.sin(crab.t*10) * (crab.scuttle>0?1.5:0.6);
      const x = crab.x, y = crab.y + bob;
      const clawUp = crab.scuttle > 0 ? Math.sin(crab.scuttle*24)*0.5 - 0.3 : 0;
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.beginPath(); ctx.ellipse(x, y+5, 10, 2.6, 0, 0, 7); ctx.fill();
      // legs (3 per side)
      ctx.strokeStyle = '#b8442a'; ctx.lineWidth = 1.2; ctx.lineCap='round';
      for (let i=-1;i<=1;i++){
        const lp = Math.sin(crab.t*14 + i)* (crab.scuttle>0?2:0.6);
        ctx.beginPath(); ctx.moveTo(x-6, y+1+i*2); ctx.lineTo(x-11, y+4+i*2+lp); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+6, y+1+i*2); ctx.lineTo(x+11, y+4+i*2-lp); ctx.stroke();
      }
      // body
      ctx.fillStyle = '#d9542f'; ctx.beginPath(); ctx.ellipse(x, y, 8, 5.5, 0, 0, 7); ctx.fill();
      // eyes on stalks
      ctx.strokeStyle = '#d9542f'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x-3, y-4); ctx.lineTo(x-3, y-8); ctx.moveTo(x+3, y-4); ctx.lineTo(x+3, y-8); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x-3, y-9, 1.3, 0, 7); ctx.arc(x+3, y-9, 1.3, 0, 7); ctx.fill();
      // claws (raise when startled)
      ctx.fillStyle = '#c9482a';
      ctx.save(); ctx.translate(x-8, y-1); ctx.rotate(-0.4 + clawUp); ctx.beginPath(); ctx.ellipse(-3,0,3.4,2.4,0,0,7); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(x+8, y-1); ctx.rotate(0.4 - clawUp); ctx.beginPath(); ctx.ellipse(3,0,3.4,2.4,0,0,7); ctx.fill(); ctx.restore();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!crab || !inCave()) return false;
        if (px < crab.x - 13 || px > crab.x + 13 || py < crab.y - 12 || py > crab.y + 8) return false;
        crab.dir = (px < crab.x) ? 1 : -1;                     // scuttle away from the tap
        crab.scuttle = 1;
        if (typeof fxAt === 'function') for (let i=0;i<3;i++) setTimeout(()=> fxAt(crab.x+rand(-8,8), crab.y-rand(2,12), pick(['🫧','🦀','💧'])), i*80);
        if (crab.cd <= 0){
          crab.cd = 1.2;
          if (typeof sfx === 'function') sfx('tap');
          if (typeof say === 'function') say(pick(['A crab! 🦀','Off it scuttles! 😄','Snippy little thing 🥰','Bubbles! 🫧']));
          try{ state.fun = clamp(state.fun + 4); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ============================================================================
   FEATURES (Thread A, Round 21). Three scene-gated micro-interactions. No
   always-on overlays; each lives only in its scenes, taps false-on-miss.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   46) SHAKE THE SNOW GLOBE  —  in the snow-globe shop, ski lodge, or crystal cave
   a little snow globe rests on a shelf. Tap it to give it a shake: the snow inside
   bursts up in a swirling flurry and then drifts gently back down to settle over a
   tiny pine tree. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxSnowGlobe(){
  try{
    const PLACES = new Set(['snowglobeshop','skilodge','crystalcave']);
    let gl = null;                       // {x,y,r,shake,cd,flakes:[{lx,ly,vx,vy,s}]}
    function here(){ try{ return (typeof SCENES!=='undefined') && PLACES.has(SCENES[currentScene]); }catch(e){ return false; } }
    function build(){
      const x = Math.max(W*0.16, Math.min(W*0.84, W*0.20));
      const y = rand(H*0.66, H*0.72), r = 20, flakes = [];
      for (let i=0;i<18;i++){
        const a = rand(0, Math.PI*2), m = rand(0, r-6);
        flakes.push({ lx: Math.cos(a)*m, ly: Math.sin(a)*m, vx:0, vy:0, s: rand(0.7,1.5) });
      }
      gl = { x, y, r, shake:0, cd:0, flakes };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!here()){ gl = null; return; }
      if (!gl) build();
      if (gl.cd > 0) gl.cd -= dt;
      if (gl.shake > 0) gl.shake -= dt;
      const r = gl.r;
      for (const f of gl.flakes){
        f.vy += 30 * dt * f.s;                 // gravity
        f.vx *= 0.94; if (f.vy > 34) f.vy = 34;
        f.lx += f.vx * dt; f.ly += f.vy * dt;
        const d = Math.hypot(f.lx, f.ly) || 1;
        if (d > r-5){ const k = (r-5)/d; f.lx *= k; f.ly *= k; f.vx *= 0.4; f.vy *= 0.4; }
      }
    });

    EXTRA_DRAWERS.push(function(){
      if (!gl || !here()) return;
      const wob = gl.shake > 0 ? Math.sin(gl.shake*40) * 1.6 : 0;
      const x = gl.x + wob, cy = gl.y - gl.r, r = gl.r;
      ctx.save();
      // wooden base
      ctx.fillStyle = '#6a4a34';
      if (typeof roundRect === 'function'){ roundRect(x-r*0.8, gl.y-4, r*1.6, 8, 2); ctx.fill(); } else ctx.fillRect(x-r*0.8, gl.y-4, r*1.6, 8);
      ctx.fillStyle = '#8a6244'; ctx.fillRect(x-r*0.55, gl.y-8, r*1.1, 5);
      // glass dome fill
      ctx.beginPath(); ctx.arc(x, cy, r, 0, 7);
      const g = ctx.createRadialGradient(x-r*0.3, cy-r*0.3, 2, x, cy, r);
      g.addColorStop(0, 'rgba(210,235,255,0.55)'); g.addColorStop(1, 'rgba(150,190,230,0.35)');
      ctx.fillStyle = g; ctx.fill();
      // clip to the glass, then draw the little scene + snow
      ctx.save(); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x-r+2, cy+r-8, r*2-4, 8);   // snow floor
      ctx.fillStyle = '#2f6b3a';
      ctx.beginPath(); ctx.moveTo(x, cy-2); ctx.lineTo(x-6, cy+8); ctx.lineTo(x+6, cy+8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, cy-8); ctx.lineTo(x-5, cy+2); ctx.lineTo(x+5, cy+2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      for (const f of gl.flakes){ ctx.beginPath(); ctx.arc(x+f.lx, cy+f.ly, 1.4*f.s, 0, 7); ctx.fill(); }
      ctx.restore();
      // glass rim + highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, cy, r-3, Math.PI*1.15, Math.PI*1.5); ctx.stroke();
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!gl || !here()) return false;
        const cy = gl.y - gl.r;
        if (Math.hypot(px - gl.x, py - cy) > gl.r + 6) return false;
        gl.shake = 0.5;
        for (const f of gl.flakes){ f.vx = rand(-55,55); f.vy = rand(-130,-30); }   // a good shake
        if (gl.cd <= 0){
          gl.cd = 1.0;
          if (typeof sfx === 'function') sfx('tap');
          if (typeof fxAt === 'function') fxAt(gl.x, cy - gl.r - 4, pick(['❄️','✨','💙']));
          if (typeof say === 'function') say(pick(['A little snowstorm! ❄️','So pretty when it swirls ✨','Shake it again? 🥰','Our own tiny winter 💙']));
          try{ state.fun = clamp(state.fun + 3); state.love = clamp(state.love + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        }
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   47) STARGAZE THROUGH THE TELESCOPE  —  at the observatory or planetarium a little
   telescope stands on its tripod. Tap it to peer through: a constellation twinkles
   into view across the upper sky for a few seconds, then gently fades. A wish, and
   a warm word. Scene-gated.
   -------------------------------------------------------------------------- */
(function fxTelescope(){
  try{
    const PLACES = new Set(['observatory','planetarium']);
    let ts = null;                       // {x,y,view,cd,stars:[],ang}
    function here(){ try{ return (typeof SCENES!=='undefined') && PLACES.has(SCENES[currentScene]); }catch(e){ return false; } }
    function build(){
      ts = { x: Math.max(W*0.16, Math.min(W*0.84, W*0.80)), y: rand(H*0.70, H*0.76), view:0, cd:0, stars:[], ang:-0.9 };
    }
    function newConstellation(){
      const stars = [], n = 5 + Math.floor(Math.random()*3);
      let sx = rand(W*0.2, W*0.4), sy = rand(H*0.12, H*0.24);
      for (let i=0;i<n;i++){
        stars.push({ x: sx, y: sy, tw: rand(0,Math.PI*2) });
        sx = Math.max(W*0.14, Math.min(W*0.72, sx + rand(14,34)*(Math.random()<0.5?-1:1) + 16));
        sy = Math.max(H*0.08, Math.min(H*0.34, sy + rand(-16,16)));
      }
      ts.stars = stars;
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!here()){ ts = null; return; }
      if (!ts) build();
      if (ts.cd > 0) ts.cd -= dt;
      if (ts.view > 0){ ts.view -= dt; for (const s of ts.stars) s.tw += dt*4; }
    });

    EXTRA_DRAWERS.push(function(){
      if (!ts || !here()) return;
      const x = ts.x, y = ts.y;
      // constellation while viewing (fade in fast, hold, fade out at the end)
      if (ts.view > 0 && ts.stars.length){
        const alpha = Math.max(0, Math.min(1, ts.view < 0.6 ? ts.view/0.6 : 1));
        ctx.save();
        ctx.strokeStyle = 'rgba(200,220,255,' + (0.35*alpha).toFixed(3) + ')'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i=0;i<ts.stars.length;i++){ const s = ts.stars[i]; if (i===0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y); }
        ctx.stroke();
        for (const s of ts.stars){
          const tw = 0.6 + 0.4*Math.sin(s.tw);
          const gg = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,6);
          gg.addColorStop(0,'rgba(255,255,240,'+(alpha*tw).toFixed(3)+')');
          gg.addColorStop(1,'rgba(255,255,240,0)');
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(s.x,s.y,6,0,7); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,'+alpha.toFixed(3)+')'; ctx.beginPath(); ctx.arc(s.x,s.y,1.4,0,7); ctx.fill();
        }
        ctx.restore();
      }
      // telescope: tripod + tube
      ctx.save();
      ctx.strokeStyle = '#4a3b2a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y-4); ctx.lineTo(x-8, y+14);
      ctx.moveTo(x, y-4); ctx.lineTo(x+8, y+14);
      ctx.moveTo(x, y-4); ctx.lineTo(x+2, y+14);
      ctx.stroke();
      const ang = ts.ang + (ts.view>0 ? Math.sin(ts.view*3)*0.03 : 0);
      ctx.save(); ctx.translate(x, y-4); ctx.rotate(ang);
      ctx.fillStyle = '#b8b0c8';
      if (typeof roundRect === 'function'){ roundRect(-4, -3, 26, 7, 3); ctx.fill(); } else ctx.fillRect(-4,-3,26,7);
      ctx.fillStyle = '#8a82a0'; ctx.beginPath(); ctx.ellipse(22, 0.5, 2.4, 4, 0, 0, 7); ctx.fill();   // objective lens
      ctx.fillStyle = '#d4cbe4'; ctx.fillRect(-6, -2.5, 4, 6);                                          // eyepiece
      ctx.restore();
      ctx.fillStyle = '#6a5a44'; ctx.beginPath(); ctx.arc(x, y-4, 2.4, 0, 7); ctx.fill();               // pivot
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!ts || !here()) return false;
        if (px < ts.x - 12 || px > ts.x + 26 || py < ts.y - 16 || py > ts.y + 16) return false;
        if (ts.cd > 0) return true;
        ts.cd = 1.2; ts.view = 2.6; newConstellation();
        if (typeof sfx === 'function') sfx('find');
        if (typeof fxAt === 'function') fxAt(ts.x, ts.y - 18, pick(['🔭','🌟','✨']));
        if (typeof say === 'function') say(pick(['Look — a constellation! 🌟','I see stars… make a wish ✨','Our own little sky 🔭','I named that one after you 💫']));
        try{ state.love = clamp(state.love + 4); state.fun = clamp(state.fun + 2); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
        return true;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

/* ----------------------------------------------------------------------------
   48) LIGHT THE CANDLES  —  in the candle workshop or the snowy cabin a little row
   of candles waits. Tap each unlit one to light it: a flame flickers up with a warm
   glow. Light them all for a birthday cheer + a shower of hearts; after a while they
   burn down and can be lit again. Scene-gated, progressive.
   -------------------------------------------------------------------------- */
(function fxCandles(){
  try{
    const PLACES = new Set(['candleshop','snowycabin']);
    let row = null;                      // {x,y,cands:[{lx,h,lit,fl}],cd,allT}
    function here(){ try{ return (typeof SCENES!=='undefined') && PLACES.has(SCENES[currentScene]); }catch(e){ return false; } }
    function build(){
      const n = 5, cands = [];
      for (let i=0;i<n;i++) cands.push({ lx: i*13, h: 16 + (i%2)*4, lit:false, fl: rand(0,Math.PI*2) });
      row = { x: Math.max(W*0.12, Math.min(W*0.5, W*0.16)), y: rand(H*0.70, H*0.76), cands, cd:0, allT:0 };
    }

    EXTRA_UPDATERS.push(function(dt){
      if (!here()){ row = null; return; }
      if (!row) build();
      if (row.cd > 0) row.cd -= dt;
      for (const c of row.cands) if (c.lit) c.fl += dt*8;
      if (row.allT > 0){ row.allT -= dt; if (row.allT <= 0){ for (const c of row.cands) c.lit = false; } }   // burn down & reset
    });

    EXTRA_DRAWERS.push(function(){
      if (!row || !here()) return;
      ctx.save();
      for (const c of row.cands){
        const cx = row.x + c.lx, base = row.y, top = base - c.h;
        ctx.fillStyle = '#f3e6d0'; ctx.fillRect(cx-3, top, 6, c.h);                 // body
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(cx+1, top, 2, c.h);        // shading
        ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1;                             // wick
        ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top-3); ctx.stroke();
        if (c.lit){
          const fl = 0.7 + 0.3*Math.sin(c.fl) + 0.1*Math.sin(c.fl*2.7);
          const gr = ctx.createRadialGradient(cx, top-6, 0, cx, top-6, 16);          // glow
          gr.addColorStop(0, 'rgba(255,200,110,'+(0.28*fl).toFixed(3)+')');
          gr.addColorStop(1, 'rgba(255,200,110,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, top-6, 16, 0, 7); ctx.fill();
          const fh = 7*fl;                                                           // flame
          ctx.fillStyle = '#ffcf6b';
          ctx.beginPath(); ctx.moveTo(cx, top-3-fh); ctx.quadraticCurveTo(cx+2.4, top-3-fh*0.4, cx, top-3); ctx.quadraticCurveTo(cx-2.4, top-3-fh*0.4, cx, top-3-fh); ctx.fill();
          ctx.fillStyle = '#fff2c0';
          ctx.beginPath(); ctx.moveTo(cx, top-3-fh*0.7); ctx.quadraticCurveTo(cx+1.2, top-3-fh*0.25, cx, top-3); ctx.quadraticCurveTo(cx-1.2, top-3-fh*0.25, cx, top-3-fh*0.7); ctx.fill();
        }
      }
      ctx.restore();
    });

    EXTRA_TAPS.push(function(px, py){
      try{
        if (!row || !here()) return false;
        for (const c of row.cands){
          const cx = row.x + c.lx, base = row.y, top = base - c.h;
          if (px >= cx-6 && px <= cx+6 && py >= top-12 && py <= base+2){
            if (c.lit) return true;                       // already lit — consume quietly
            c.lit = true;
            if (typeof sfx === 'function') sfx('tap');
            if (typeof fxAt === 'function') fxAt(cx, top-10, pick(['🕯️','✨','💛']));
            const allLit = row.cands.every(k => k.lit);
            if (allLit){
              row.allT = 12;                              // glow a while, then reset
              if (row.cd <= 0){
                row.cd = 1.5;
                if (typeof sfx === 'function') sfx('find');
                if (typeof say === 'function') say(pick(['All aglow — make a wish! 🎂','Happy birthday, my love 💛','So warm and cozy ✨','Every one lit, just for you 🥰']));
                if (typeof hearts === 'function') hearts();
                try{ state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 3); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
              }
            } else {
              if (typeof say === 'function' && Math.random() < 0.5) say(pick(['One more… 🕯️','Warm and glowy ✨','Light them all? 🥰']));
              try{ state.love = clamp(state.love + 1); if (typeof refreshHUD==='function') refreshHUD(); }catch(e){}
            }
            return true;
          }
        }
        return false;
      }catch(e){ return false; }
    });
  }catch(e){}
})();

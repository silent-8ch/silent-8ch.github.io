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
      summer: { count:8,  kind:'glow',  color:'255,236,140',   size:[1.6,3.0], drift:[6,14], alpha:0.7 },
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
      } else { // glow (fireflies)
        const night = (typeof isNight === 'function') && isNight();
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
      try{ target = (state && state.fun >= 96) ? 1 : 0; }catch(e){}
      // ease toward target so it drifts in/out gently
      alpha += (target - alpha) * Math.min(1, dt * 0.7);
    });
    EXTRA_DRAWERS.push(function(){
      if (alpha < 0.01) return;
      const cx = W*0.5, cy = H*0.98, r0 = W*0.60;              // centre low so the arc curves over the top
      ctx.save();
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i=0;i<BANDS.length;i++){
        ctx.strokeStyle = 'rgba(' + BANDS[i] + ',' + (0.16 * alpha).toFixed(3) + ')';
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

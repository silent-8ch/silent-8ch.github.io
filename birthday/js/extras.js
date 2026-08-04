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

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

/* cutscenes: full-screen narrative sequences  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */
/*
  Architecture:
    let cutscene = null   — when set, takes over the loop (like `birthday` does)
    startCutscene(def)    — begins a cutscene from a definition object
    endCutscene()         — fades out and restores normal play

  A cutscene definition is:
    { steps: [ { dur, draw, onStart?, onEnd? }, ... ], skipable: true }

  Integration hooks are added to loop.js (update), birthday.js (render),
  and pet.js (tap handler) — see bottom of this file for the EXTRA_* registrations.
*/

/* ============================================================================
   CUTSCENE ENGINE
   ============================================================================ */
let cutscene = null;

// Character walk sprites used in cutscenes (lazily loaded, shared across all).
const csSprites = {};
function csLoadSprite(name){
  if (csSprites[name]) return;
  // Reuse already-loaded sheets from the main engine when possible.
  const sheetKey = name + 'Walk';
  if (sheets[sheetKey] && sheets[sheetKey].ready){
    csSprites[name] = { img: sheets[sheetKey].canvas, ready: true, fw: sheets[sheetKey].fw, fh: sheets[sheetKey].fh };
    return;
  }
  const img = new Image();
  const rec = { img, ready: false, fw: 0, fh: 0 };
  csSprites[name] = rec;
  img.onload = () => { rec.fw = Math.floor(img.width / 4); rec.fh = Math.floor(img.height / 4); rec.ready = true; rec.img = img; };
  img.src = 'sprites/walking-all/' + name + '-walk.png';
}

/* Draw a character from their walk sheet at (x, feetY) facing `dir`.
   frame defaults to 0 (standing). h is display height. */
function csDrawChar(name, x, feetY, dir, h, frame){
  const sp = csSprites[name];
  if (!sp || !sp.ready) return;
  dir = dir || 'down';
  h = h || 90;
  frame = frame || 0;
  const w = h * (sp.fw / sp.fh);
  const rowMap = { down: 0, left: 1, right: 2, up: 3 };
  const row = rowMap[dir] != null ? rowMap[dir] : 0;
  const col = frame % 4;
  ctx.drawImage(sp.img, col * sp.fw, row * sp.fh, sp.fw, sp.fh,
    x - w / 2, feetY - h, w, h);
}

/* ---------- Expression sprites ----------
   Each expression PNG is a 4-frame horizontal strip (1024x256, so 256x256 per frame).
   Lazily loaded, keyed by "name:expression" (e.g. "krystal:laugh"). */
const EXPR_LIST = ['cheer','embarrassed','laugh','sad','scared','surprised','think','wave'];
const csExprSprites = {};

function csLoadExpression(name, expression){
  const key = name + ':' + expression;
  if (csExprSprites[key]) return;
  const img = new Image();
  const rec = { img, ready: false, fw: 0, fh: 0 };
  csExprSprites[key] = rec;
  img.onload = () => { rec.fw = Math.floor(img.width / 4); rec.fh = img.height; rec.ready = true; rec.img = img; };
  img.src = 'sprites/expressions/' + name + '/' + expression + '.png';
}

/* Pre-load all expressions for a character (called alongside csLoadSprite). */
function csLoadExpressions(name){
  for (const expr of EXPR_LIST) csLoadExpression(name, expr);
}

/* Draw a character using their expression sprite instead of the walk sheet.
   name: 'krystal', expression: 'laugh', x/feetY/h same as csDrawChar.
   frame: animation frame 0-3 (defaults to animated based on cs.totalT). */
function csDrawExpression(name, expression, x, feetY, h, frame){
  const key = name + ':' + expression;
  const sp = csExprSprites[key];
  if (!sp || !sp.ready){
    // fallback to walk sprite standing pose
    csDrawChar(name, x, feetY, 'down', h, 0);
    return;
  }
  h = h || 90;
  if (frame == null){
    // auto-animate at ~6 fps using totalT from the active cutscene
    const t = cutscene ? cutscene.totalT : 0;
    frame = Math.floor(t * 6) % 4;
  }
  const w = h * (sp.fw / sp.fh);
  const col = frame % 4;
  ctx.drawImage(sp.img, col * sp.fw, 0, sp.fw, sp.fh,
    x - w / 2, feetY - h, w, h);
}

/* Draw a speech bubble on canvas. x,y is the tail point (above the character's head).
   speaker is the name shown in bold; text is the line. */
function csDrawBubble(x, y, speaker, text){
  ctx.save();
  ctx.font = '12px "Segoe UI", sans-serif';
  const speakerW = speaker ? ctx.measureText(speaker + ': ').width : 0;
  const textW = ctx.measureText(text).width;
  const lineW = speakerW + textW;
  const padX = 12, padY = 8;
  const bw = Math.min(W * 0.78, lineW + padX * 2);
  const bh = 32;
  // clamp bubble to stay on screen
  let bx = Math.max(6, Math.min(W - bw - 6, x - bw / 2));
  let by = Math.max(6, y - bh - 10);

  // bubble body
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  roundRect(bx, by, bw, bh, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1;
  roundRect(bx, by, bw, bh, 8); ctx.stroke();

  // tail triangle
  const tx = Math.max(bx + 12, Math.min(bx + bw - 12, x));
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.beginPath(); ctx.moveTo(tx - 5, by + bh); ctx.lineTo(tx + 5, by + bh); ctx.lineTo(tx, by + bh + 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tx - 5, by + bh); ctx.lineTo(tx, by + bh + 7); ctx.lineTo(tx + 5, by + bh); ctx.stroke();

  // text
  const textX = bx + padX;
  const textY = by + bh / 2 + 4;
  if (speaker){
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#c0457b';
    ctx.textAlign = 'left';
    ctx.fillText(speaker + ':', textX, textY);
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#2a2a2a';
    ctx.fillText(' ' + text, textX + speakerW, textY);
  } else {
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#2a2a2a';
    ctx.textAlign = 'left';
    ctx.fillText(text, textX, textY);
  }
  ctx.restore();
}

/* Skip button — small "Skip >>" in top-right */
function csDrawSkipBtn(){
  if (!cutscene || !cutscene.skipable) return;
  ctx.save();
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Skip \u25b8\u25b8', W - 10, 10);
  ctx.restore();
}
// Hit test for the skip button (top-right 70x28 region)
function csSkipHit(px, py){
  return px > W - 75 && py < 34;
}

/* ---- lifecycle ---- */
function startCutscene(def){
  if (cutscene || birthday) return;
  // pre-load sprites we'll need (walk + expressions)
  if (def.chars) def.chars.forEach(n => { csLoadSprite(n); csLoadExpressions(n); });
  cutscene = {
    def: def,
    steps: def.steps,
    stepIdx: -1,         // -1 means we're in the opening fade
    stepT: 0,
    totalT: 0,
    skipable: def.skipable !== false,
    phase: 'fadeIn',     // fadeIn -> running -> fadeOut -> done
    fadeT: 0,
    hearts: [],          // floating heart particles for the cutscene
  };
}

function endCutscene(){
  if (!cutscene) return;
  cutscene.phase = 'fadeOut';
  cutscene.fadeT = 0;
}

function csFinish(){
  cutscene = null;
}

/* ---- update (called from the main loop) ---- */
function updateCutscene(dt){
  if (!cutscene) return;
  const cs = cutscene;
  cs.totalT += dt;

  if (cs.phase === 'fadeIn'){
    cs.fadeT += dt;
    if (cs.fadeT >= 1.1){          // 0.8s fade + 0.3s hold
      cs.phase = 'running';
      cs.stepIdx = 0;
      cs.stepT = 0;
      const step = cs.steps[0];
      if (step && step.onStart) step.onStart(cs);
    }
    return;
  }

  if (cs.phase === 'fadeOut'){
    cs.fadeT += dt;
    if (cs.fadeT >= 0.5){
      csFinish();
    }
    return;
  }

  // phase === 'running'
  if (cs.stepIdx >= cs.steps.length){
    endCutscene();
    return;
  }

  cs.stepT += dt;
  const step = cs.steps[cs.stepIdx];
  if (step.update) step.update(cs, dt);

  // update floating hearts
  for (let i = cs.hearts.length - 1; i >= 0; i--){
    const h = cs.hearts[i];
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.life -= dt;
    if (h.life <= 0) cs.hearts.splice(i, 1);
  }

  if (cs.stepT >= step.dur){
    if (step.onEnd) step.onEnd(cs);
    cs.stepIdx++;
    cs.stepT = 0;
    if (cs.stepIdx < cs.steps.length){
      const next = cs.steps[cs.stepIdx];
      if (next.onStart) next.onStart(cs);
    }
  }
}

/* ---- draw (called from render) ---- */
function drawCutscene(){
  if (!cutscene) return;
  const cs = cutscene;

  if (cs.phase === 'fadeIn'){
    // Draw the current normal scene underneath during fade
    const scene = SCENES[currentScene];
    const draw = SCENE_RENDERERS[scene];
    if (draw) draw();
    // white overlay fading in then holding
    const fadeIn = Math.min(1, cs.fadeT / 0.8);
    ctx.fillStyle = `rgba(255,255,255,${fadeIn})`;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (cs.phase === 'fadeOut'){
    // Draw normal scene coming back
    const scene = SCENES[currentScene];
    const draw = SCENE_RENDERERS[scene];
    if (draw){ draw(); drawPet(); }
    // white overlay fading out
    const fadeOut = Math.max(0, 1 - cs.fadeT / 0.5);
    ctx.fillStyle = `rgba(255,255,255,${fadeOut})`;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  // phase === 'running'
  if (cs.stepIdx < cs.steps.length){
    const step = cs.steps[cs.stepIdx];
    step.draw(cs);
  }

  // floating hearts
  for (const h of cs.hearts){
    const a = Math.min(1, h.life * 2);
    ctx.font = '16px serif'; ctx.textAlign = 'center';
    ctx.globalAlpha = a;
    ctx.fillText(h.ch, h.x, h.y);
  }
  ctx.globalAlpha = 1;

  // skip button
  csDrawSkipBtn();

  // gentle white vignette at edges during cutscene (cinematic feel)
  const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.28, W * 0.5, H * 0.5, H * 0.66);
  vig.addColorStop(0, 'rgba(255,255,255,0)');
  vig.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
}

/* ---- tap handler ---- */
function csTap(px, py){
  if (!cutscene) return false;
  if (csSkipHit(px, py) && cutscene.skipable){
    endCutscene();
    return true;
  }
  // absorb all taps during a cutscene
  return true;
}

/* ---- helper: spawn hearts in the cutscene ---- */
function csHearts(cs, cx, cy, n){
  n = n || 6;
  const chars = ['\u{1F497}', '\u{1F49B}', '\u{1F496}', '\u2728'];
  for (let i = 0; i < n; i++){
    cs.hearts.push({
      x: cx + rand(-20, 20), y: cy,
      vx: rand(-8, 8), vy: rand(-30, -55),
      life: 1.2 + Math.random() * 0.8,
      ch: chars[Math.floor(Math.random() * chars.length)]
    });
  }
}

/* ============================================================================
   CUTSCENE 1: CAMPFIRE STORY  (triggers at 'campsite')
   ============================================================================ */
function csCampfireStory(){
  const charH = 80;
  const groundY = H * 0.62;
  const fY = groundY + 55;     // characters' feet
  const fireX = W * 0.50, fireY = groundY + 60;

  // character positions (sitting around the fire)
  const paul    = { x: fireX - 58, feetY: fY, name: 'paul' };
  const krystal = { x: fireX + 58, feetY: fY, name: 'krystal' };
  const luna    = { x: fireX,      feetY: fY + 12, name: 'luna' };

  function drawBg(cs){
    const t = cs.totalT;
    // night sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#0e1230'); sky.addColorStop(0.6, '#1c2350'); sky.addColorStop(1, '#39325e');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);
    // stars
    for (let i = 0; i < 50; i++){
      const sx = (i * 97 + 13) % W, sy = (i * 57 + 7) % (groundY - 16);
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${(0.25 + 0.6 * tw).toFixed(2)})`;
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }
    // moon
    ctx.fillStyle = 'rgba(245,243,208,.15)'; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.12, 28, 0, 7); ctx.fill();
    ctx.fillStyle = '#f5f3d0'; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.12, 16, 0, 7); ctx.fill();
    // pine silhouettes
    ctx.fillStyle = '#12200f';
    for (let i = 0; i < 8; i++) drawPine(i * W / 7 - 8, groundY + 4, 30 + ((i * 37) % 22));
    // ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#2c3a20'); gr.addColorStop(1, '#20301a');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);
    // campfire glow
    const glow = ctx.createRadialGradient(fireX, fireY - 10, 2, fireX, fireY - 10, 64);
    glow.addColorStop(0, 'rgba(255,170,60,.45)'); glow.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fireX, fireY - 10, 64, 0, 7); ctx.fill();
    // log ring
    ctx.fillStyle = '#555';
    for (let i = 0; i < 5; i++){
      const a = i / 5 * 6.28;
      ctx.beginPath(); ctx.arc(fireX + Math.cos(a) * 16, fireY + 2 + Math.sin(a) * 4, 2.5, 0, 7); ctx.fill();
    }
    // flames
    const flameCols = ['#ff5a00', '#ff9a1f', '#ffd21f'];
    for (let i = 0; i < 3; i++){
      const fl = 0.7 + 0.3 * Math.sin(t * 8 + i * 2), h = (20 - i * 4) * fl, sway = Math.sin(t * 10 + i) * 3;
      ctx.fillStyle = flameCols[i];
      ctx.beginPath(); ctx.moveTo(fireX - 6 + i * 3, fireY - 4);
      ctx.quadraticCurveTo(fireX - 6 + i * 3 + sway, fireY - 4 - h * 0.6, fireX + sway, fireY - 4 - h);
      ctx.quadraticCurveTo(fireX + 6 - i * 3 + sway, fireY - 4 - h * 0.6, fireX + 6 - i * 3, fireY - 4);
      ctx.closePath(); ctx.fill();
    }
    // sparks
    ctx.fillStyle = '#ffcf5a';
    for (let i = 0; i < 6; i++){
      const life = (t * 30 + i * 20) % 80;
      const sy = fireY - 10 - life, sx = fireX + Math.sin(t * 3 + i) * 8;
      ctx.globalAlpha = Math.max(0, 1 - life / 80); ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  function drawChars(){
    csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
    csDrawChar('krystal', krystal.x, krystal.feetY, 'left',  charH, 0);
    csDrawChar('luna',    luna.x,    luna.feetY,     'down',  charH * 0.9, 0);
  }

  return {
    chars: ['krystal', 'paul', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Everyone sitting. Paul speaks.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', 'Want to hear a scary story?');
      }},
      // Step 2: Luna responds — cheer expression (excited)
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawChar('krystal', krystal.x, krystal.feetY, 'left',  charH, 0);
          csDrawExpression('luna', 'cheer', luna.x, luna.feetY, charH * 0.9);
          csDrawBubble(luna.x, luna.feetY - charH * 0.9 - 4, 'Luna', 'Yes! Tell us!');
      }},
      // Step 3: Paul narrates.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', 'Once upon a time... in a dark forest...');
      }},
      // Step 4: Krystal on the edge of her seat — think expression
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawExpression('krystal', 'think', krystal.x, krystal.feetY, charH);
          csDrawChar('luna',    luna.x,    luna.feetY,     'down',  charH * 0.9, 0);
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', 'Then what happened?!');
      }},
      // Step 5: BOO! Screen flash — scared expressions on Krystal and Luna
      { dur: 1.5, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'cheer', paul.x, paul.feetY, charH);
          csDrawExpression('krystal', 'scared', krystal.x, krystal.feetY, charH);
          csDrawExpression('luna', 'scared', luna.x, luna.feetY, charH * 0.9);
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', '...BOO!');
          // white flash that decays
          if (cs.stepT < 0.35){
            const flash = Math.max(0, 1 - cs.stepT / 0.35);
            ctx.fillStyle = `rgba(255,255,255,${(flash * 0.7).toFixed(2)})`;
            ctx.fillRect(0, 0, W, H);
          }
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 6: Everyone laughs. Hearts.
      { dur: 2.5, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'laugh', paul.x, paul.feetY, charH);
          csDrawExpression('krystal', 'laugh', krystal.x, krystal.feetY, charH);
          csDrawExpression('luna', 'laugh', luna.x, luna.feetY, charH * 0.9);
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', 'You got me! \ud83d\ude02');
      }, onStart(cs){
          csHearts(cs, paul.x, paul.feetY - charH * 0.7, 4);
          csHearts(cs, krystal.x, krystal.feetY - charH * 0.7, 5);
          csHearts(cs, luna.x, luna.feetY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 2: STARGAZING  (triggers at 'starrymeadow' or 'observatory')
   ============================================================================ */
function csStargazing(){
  const groundY = H * 0.72;
  const charH = 75;
  // Characters lying on a blanket — we draw them lower as if reclined
  const blanketX = W * 0.5, blanketY = groundY + 22;
  const paulX = blanketX - 36, krystalX = blanketX + 36;

  // shooting star state
  let shootStar = null;

  function drawBg(cs){
    const t = cs.totalT;
    // deep night sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#060a1e'); sky.addColorStop(0.5, '#121840'); sky.addColorStop(1, '#2a2250');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // milky way band
    ctx.save(); ctx.translate(W * 0.5, groundY * 0.35); ctx.rotate(-0.45);
    const mw = ctx.createLinearGradient(0, -14, 0, 14);
    mw.addColorStop(0, 'rgba(180,190,255,0)'); mw.addColorStop(0.5, 'rgba(190,200,255,.12)'); mw.addColorStop(1, 'rgba(180,190,255,0)');
    ctx.fillStyle = mw; ctx.fillRect(-260, -14, 520, 28); ctx.restore();

    // dense twinkling stars
    for (let i = 0; i < 100; i++){
      const sx = (i * 57 + 7) % W, sy = (i * 89 + 3) % (groundY * 0.92);
      const tw = 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i * 0.7));
      ctx.fillStyle = `rgba(255,255,${230 + ((i * 13) % 25)},${tw.toFixed(2)})`;
      const r = (i % 17 === 0) ? 1.6 : 0.9;
      ctx.fillRect(sx, sy, r, r);
    }

    // the "special" star that brightens in step 4
    if (cs.stepIdx >= 3){
      const brightness = Math.min(1, (cs.stepIdx === 3 ? cs.stepT / 1.0 : 1));
      const starX = W * 0.62, starY = H * 0.16;
      const glow = ctx.createRadialGradient(starX, starY, 0, starX, starY, 14 + brightness * 10);
      glow.addColorStop(0, `rgba(255,250,200,${(0.8 * brightness).toFixed(2)})`);
      glow.addColorStop(0.4, `rgba(255,240,180,${(0.3 * brightness).toFixed(2)})`);
      glow.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(starX, starY, 14 + brightness * 10, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,252,230,${brightness.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(starX, starY, 2.2, 0, 7); ctx.fill();
    }

    // shooting star crosses in step 3-4
    if (shootStar){
      const sp = shootStar;
      const p = (t - sp.start) / sp.dur;
      if (p >= 0 && p <= 1){
        const fade = Math.sin(Math.max(0, Math.min(1, p)) * Math.PI);
        const dist = sp.speed * (t - sp.start);
        const hx = sp.x + sp.dx * dist, hy = sp.y + sp.dy * dist;
        const tx = hx - sp.dx * sp.len, ty = hy - sp.dy * sp.len;
        const g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, `rgba(255,255,255,${(0.9 * fade).toFixed(2)})`);
        ctx.save();
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,240,${(0.9 * fade).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(hx, hy, 2, 0, 7); ctx.fill();
        ctx.restore();
      }
    }

    // crescent moon
    ctx.fillStyle = '#f2ecc8'; ctx.beginPath(); ctx.arc(W * 0.14, H * 0.12, 13, 0, 7); ctx.fill();
    ctx.fillStyle = '#121840'; ctx.beginPath(); ctx.arc(W * 0.18, H * 0.10, 12, 0, 7); ctx.fill();

    // rolling meadow
    ctx.fillStyle = '#14201a';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, groundY - 10 - 8 * Math.sin(x * 0.02 + 1));
    ctx.lineTo(W, groundY); ctx.fill();
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#1a2a1e'); gr.addColorStop(1, '#0e1810');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // fireflies
    for (let i = 0; i < 12; i++){
      const fx = (i * 61 + Math.sin(t * 0.5 + i) * 18) % W;
      const fy = groundY - 8 + Math.sin(t * 1.3 + i) * 12 - (i % 4) * 6;
      ctx.fillStyle = `rgba(220,255,170,${(0.12 + 0.35 * Math.abs(Math.sin(t * 3 + i))).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(fx, fy, 1.2, 0, 7); ctx.fill();
    }
  }

  function drawBlanketAndChars(cs){
    // blanket
    ctx.fillStyle = '#6e4a7a';
    roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
    ctx.fillStyle = '#8a5e9a';
    roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
    // plaid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++){
      const lx = blanketX - 44 + i * 22;
      ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke();
    }

    // Paul and Krystal — draw facing up since they're looking at the sky
    csDrawChar('paul',    paulX,    blanketY - 2, 'up', charH * 0.85, 0);
    csDrawChar('krystal', krystalX, blanketY - 2, 'up', charH * 0.85, 0);
  }

  return {
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Both lying on blanket. Silence, stars twinkling.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
      }},
      // Step 2: Krystal speaks — think expression (contemplative)
      { dur: 2.5, draw(cs){
          drawBg(cs);
          // blanket
          ctx.fillStyle = '#6e4a7a'; roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
          ctx.fillStyle = '#8a5e9a'; roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const lx = blanketX - 44 + i * 22; ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke(); }
          csDrawChar('paul', paulX, blanketY - 2, 'up', charH * 0.85, 0);
          csDrawExpression('krystal', 'think', krystalX, blanketY - 2, charH * 0.85);
          csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', 'Look at all the stars...');
      }},
      // Step 3: Paul points. Shooting star crosses.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
          csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', "That one's yours.");
      }, onStart(cs){
          const ang = 0.3 + Math.random() * 0.2;
          shootStar = {
            x: W * 0.15, y: H * 0.08,
            dx: Math.cos(ang), dy: Math.sin(ang),
            dur: 0.9, start: cs.totalT,
            len: 36, speed: 220
          };
      }},
      // Step 4: The star brightens. Krystal reacts — surprised expression
      { dur: 2.5, draw(cs){
          drawBg(cs);
          ctx.fillStyle = '#6e4a7a'; roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
          ctx.fillStyle = '#8a5e9a'; roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const lx = blanketX - 44 + i * 22; ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke(); }
          csDrawChar('paul', paulX, blanketY - 2, 'up', charH * 0.85, 0);
          csDrawExpression('krystal', 'surprised', krystalX, blanketY - 2, charH * 0.85);
          csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', 'Really? \ud83e\udd70');
      }},
      // Step 5: Paul's line.
      { dur: 2.0, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
          csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', 'The brightest one. Always.');
      }},
      // Step 6: Hearts float up. Both cheer.
      { dur: 2.5, draw(cs){
          drawBg(cs);
          ctx.fillStyle = '#6e4a7a'; roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
          ctx.fillStyle = '#8a5e9a'; roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const lx = blanketX - 44 + i * 22; ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke(); }
          csDrawExpression('paul', 'cheer', paulX, blanketY - 2, charH * 0.85);
          csDrawExpression('krystal', 'cheer', krystalX, blanketY - 2, charH * 0.85);
      }, onStart(cs){
          csHearts(cs, paulX, blanketY - charH * 0.6, 5);
          csHearts(cs, krystalX, blanketY - charH * 0.6, 6);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 3: BEACH SUNSET PICNIC  (triggers at 'beach' or 'moonbeach')
   ============================================================================ */
function csBeachSunsetPicnic(){
  const groundY = H * 0.68;
  const charH = 80;
  const blanketX = W * 0.50, blanketY = groundY + 18;
  const fY = blanketY + 4;

  const krystal = { x: blanketX,       feetY: fY, name: 'krystal' };
  const paul    = { x: blanketX - 52,  feetY: fY, name: 'paul' };
  const wade    = { x: blanketX + 56,  feetY: fY + 6, name: 'wade' };

  // sun position — sinks slowly over the cutscene
  function sunY(cs){ return H * 0.22 + cs.totalT * 1.8; }

  function drawBg(cs){
    const t = cs.totalT;
    const sy = sunY(cs);
    // warm sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#1b2a5c');
    sky.addColorStop(0.35, '#d45b3e');
    sky.addColorStop(0.65, '#f0944e');
    sky.addColorStop(1, '#fcd07a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun
    const sunGlow = ctx.createRadialGradient(W * 0.72, sy, 4, W * 0.72, sy, 52);
    sunGlow.addColorStop(0, 'rgba(255,220,100,.9)');
    sunGlow.addColorStop(0.5, 'rgba(255,160,60,.35)');
    sunGlow.addColorStop(1, 'rgba(255,100,40,0)');
    ctx.fillStyle = sunGlow; ctx.beginPath(); ctx.arc(W * 0.72, sy, 52, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe480'; ctx.beginPath(); ctx.arc(W * 0.72, sy, 16, 0, 7); ctx.fill();

    // ocean — horizon line with gentle shimmer
    const ocean = ctx.createLinearGradient(0, groundY - 30, 0, groundY);
    ocean.addColorStop(0, '#3a6090'); ocean.addColorStop(1, '#4a80a8');
    ctx.fillStyle = ocean; ctx.fillRect(0, groundY - 30, W, 30);
    // sun reflection on water
    ctx.fillStyle = 'rgba(255,200,80,.18)';
    ctx.fillRect(W * 0.55, groundY - 28, W * 0.34, 26);
    // gentle wave lines
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++){
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8){
        ctx.lineTo(x, groundY - 26 + i * 7 + Math.sin(t * 1.8 + x * 0.05 + i) * 2);
      }
      ctx.stroke();
    }

    // sandy beach
    const sand = ctx.createLinearGradient(0, groundY, 0, H);
    sand.addColorStop(0, '#e8d5a0'); sand.addColorStop(1, '#d4bf82');
    ctx.fillStyle = sand; ctx.fillRect(0, groundY, W, H - groundY);

    // picnic blanket
    ctx.fillStyle = '#c44455';
    roundRect(blanketX - 60, blanketY - 4, 120, 16, 4); ctx.fill();
    ctx.fillStyle = '#d55566';
    roundRect(blanketX - 56, blanketY - 2, 112, 12, 3); ctx.fill();
    // blanket check pattern
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++){
      const lx = blanketX - 48 + i * 24;
      ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 10); ctx.stroke();
    }

    // a little picnic basket to the left
    ctx.fillStyle = '#8b6933';
    roundRect(blanketX - 72, blanketY - 2, 14, 10, 2); ctx.fill();
    ctx.strokeStyle = '#6b4f23'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(blanketX - 65, blanketY - 4, 7, Math.PI, 0); ctx.stroke();
  }

  function drawChars(){
    csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
    csDrawChar('krystal', krystal.x, krystal.feetY, 'down',  charH, 0);
    csDrawChar('wade',    wade.x,    wade.feetY,    'left',  charH * 0.95, 0);
  }

  return {
    chars: ['krystal', 'paul', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Quiet scene — golden hour, everyone on the blanket — think expression on Krystal
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawExpression('krystal', 'think', krystal.x, krystal.feetY, charH);
          csDrawChar('wade',    wade.x,    wade.feetY,    'left',  charH * 0.95, 0);
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', "This sunset is so pretty...");
      }},
      // Step 2: Wade breaks the peace — wave expression
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawChar('krystal', krystal.x, krystal.feetY, 'down',  charH, 0);
          csDrawExpression('wade', 'wave', wade.x, wade.feetY, charH * 0.95);
          csDrawBubble(wade.x, wade.feetY - charH * 0.95 - 4, 'Wade', 'Know what else is pretty? This sandwich.');
      }},
      // Step 3: Everyone laughs
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'laugh', paul.x, paul.feetY, charH);
          csDrawExpression('krystal', 'laugh', krystal.x, krystal.feetY, charH);
          csDrawExpression('wade', 'laugh', wade.x, wade.feetY, charH * 0.95);
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', 'Wade, you are unbelievable 😂');
      }},
      // Step 4: Krystal leans on Paul — cozy moment, cheer expression
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'cheer', paul.x, paul.feetY, charH);
          csDrawExpression('krystal', 'cheer', krystal.x - 18, krystal.feetY, charH);
          csDrawChar('wade',    wade.x,          wade.feetY,    'left',  charH * 0.95, 0);
          csDrawBubble(krystal.x - 18, krystal.feetY - charH - 4, 'Krystal', "I could stay here forever 🥰");
      }, onStart(cs){
          csHearts(cs, paul.x, paul.feetY - charH * 0.7, 4);
          csHearts(cs, krystal.x - 18, krystal.feetY - charH * 0.7, 5);
      }},
      // Step 5: Warm closing — Wade waves, everyone happy
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'cheer', paul.x, paul.feetY, charH);
          csDrawExpression('krystal', 'cheer', krystal.x - 18, krystal.feetY, charH);
          csDrawExpression('wade', 'wave', wade.x, wade.feetY, charH * 0.95);
          csDrawBubble(wade.x, wade.feetY - charH * 0.95 - 4, 'Wade', "...okay yeah, this is nice too.");
      }, onStart(cs){
          csHearts(cs, wade.x, wade.feetY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 4: BAKERY MISHAP  (triggers at 'bakery' or 'gingerbreadkitchen')
   ============================================================================ */
function csBakeryMishap(){
  const groundY = H * 0.72;
  const charH = 80;
  const counterY = groundY - 8;
  const krystalX = W * 0.38, lunaX = W * 0.62;

  // flour explosion particles
  let flourParticles = [];

  function spawnFlour(cx, cy, n){
    for (let i = 0; i < n; i++){
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      flourParticles.push({
        x: cx + rand(-14, 14), y: cy + rand(-10, 10),
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 20,
        r: 1.5 + Math.random() * 3,
        life: 1.2 + Math.random() * 1.5,
        maxLife: 1.2 + Math.random() * 1.5,
      });
    }
  }

  function drawBg(cs){
    // warm bakery interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f5e6d0'); wall.addColorStop(1, '#e8d4b8');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // tile floor
    ctx.fillStyle = '#c8a882'; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = groundY; y < H; y += 24){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // counter / table
    ctx.fillStyle = '#a67c52';
    roundRect(W * 0.22, counterY, W * 0.56, 14, 3); ctx.fill();
    ctx.fillStyle = '#c49a6c';
    roundRect(W * 0.24, counterY + 2, W * 0.52, 10, 2); ctx.fill();

    // mixing bowl on counter
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.arc(W * 0.50, counterY - 2, 12, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f0ece0';
    ctx.beginPath(); ctx.arc(W * 0.50, counterY - 2, 9, Math.PI, 0); ctx.fill();

    // little shelf with jars on the wall
    ctx.fillStyle = '#a67c52'; ctx.fillRect(W * 0.08, H * 0.18, W * 0.26, 4);
    ctx.fillStyle = '#e8c87a';
    for (let i = 0; i < 3; i++){
      const jx = W * 0.12 + i * 18;
      roundRect(jx, H * 0.08, 10, 22, 2); ctx.fill();
    }

    // warm glow from the oven area (right wall)
    const ovenGlow = ctx.createRadialGradient(W * 0.88, groundY - 20, 4, W * 0.88, groundY - 20, 50);
    ovenGlow.addColorStop(0, 'rgba(255,160,60,.2)'); ovenGlow.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = ovenGlow; ctx.beginPath(); ctx.arc(W * 0.88, groundY - 20, 50, 0, 7); ctx.fill();
  }

  function drawFlour(cs, dt){
    for (let i = flourParticles.length - 1; i >= 0; i--){
      const p = flourParticles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 40 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0){ flourParticles.splice(i, 1); continue; }
      const a = Math.min(1, p.life / p.maxLife * 1.5);
      ctx.fillStyle = `rgba(255,250,240,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
  }

  function drawChars(covered, exprK, exprL){
    const cY = counterY + charH * 0.15;
    if (exprK) csDrawExpression('krystal', exprK, krystalX, cY, charH);
    else csDrawChar('krystal', krystalX, cY, 'right', charH, 0);
    if (exprL) csDrawExpression('luna', exprL, lunaX, cY, charH * 0.9);
    else csDrawChar('luna', lunaX, cY, 'left', charH * 0.9, 0);
    // if covered in flour, overlay a translucent white layer on the characters
    if (covered){
      ctx.fillStyle = 'rgba(255,250,240,.28)';
      ctx.fillRect(krystalX - 22, cY - charH, 44, charH);
      ctx.fillRect(lunaX - 20, cY - charH * 0.9, 40, charH * 0.9);
    }
  }

  return {
    chars: ['krystal', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Setting the scene — mixing batter — think expression
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(false, 'think', null);
          csDrawBubble(krystalX, counterY + charH * 0.15 - charH - 4, 'Krystal', "Okay, just a little more flour...");
      }},
      // Step 2: Luna goes for it — cheer expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false, null, 'cheer');
          csDrawBubble(lunaX, counterY + charH * 0.15 - charH * 0.9 - 4, 'Luna', "I got it! Stand back!");
      }},
      // Step 3: BOOM — flour explosion! — surprised expressions
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true, 'surprised', 'surprised'); drawFlour(cs, 0);
          // white flash on explosion start
          if (cs.stepT < 0.3){
            const flash = Math.max(0, 1 - cs.stepT / 0.3);
            ctx.fillStyle = `rgba(255,250,240,${(flash * 0.6).toFixed(2)})`;
            ctx.fillRect(0, 0, W, H);
          }
      }, onStart(cs){
          spawnFlour(W * 0.50, counterY - 10, 60);
          try{ sfx('tap'); }catch(e){}
      }, update(cs, dt){
          drawFlour(cs, dt);
      }},
      // Step 4: Aftermath — both covered, Luna laughing
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true, 'surprised', 'laugh'); drawFlour(cs, 0);
          csDrawBubble(lunaX, counterY + charH * 0.15 - charH * 0.9 - 4, 'Luna', "Nailed it!");
      }, update(cs, dt){
          drawFlour(cs, dt);
      }},
      // Step 5: Krystal laughs too — hearts
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true, 'laugh', 'laugh'); drawFlour(cs, 0);
          csDrawBubble(krystalX, counterY + charH * 0.15 - charH - 4, 'Krystal', "We're a mess! \ud83d\ude02");
      }, onStart(cs){
          csHearts(cs, krystalX, counterY - charH * 0.5, 4);
          csHearts(cs, lunaX, counterY - charH * 0.4, 4);
      }, update(cs, dt){
          drawFlour(cs, dt);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 5: LIBRARY GHOST  (triggers at 'library' or 'arcanelibrary')
   ============================================================================ */
function csLibraryGhost(){
  const groundY = H * 0.74;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.42, williamX = W * 0.62;

  // ghost orb state
  let ghostOrb = null;
  // falling book state
  let fallingBook = null;

  function drawBg(cs){
    const t = cs.totalT;
    // dim library interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#2a2438'); wall.addColorStop(1, '#3a3248');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wooden floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#4a3c2e'); floor.addColorStop(1, '#3a2e22');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    // floor planks
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // tall bookshelves on left
    ctx.fillStyle = '#3e2e1e';
    ctx.fillRect(4, H * 0.06, 50, groundY - H * 0.06);
    // book rows
    const bookCols = ['#8b3a3a','#2e5a3e','#3a4a7a','#8a6a2a','#5a3a6a','#6a4a2a','#3a5a5a'];
    for (let row = 0; row < 6; row++){
      const ry = H * 0.10 + row * 28;
      // shelf plank
      ctx.fillStyle = '#5a4430'; ctx.fillRect(6, ry + 20, 46, 3);
      for (let b = 0; b < 5; b++){
        const bx = 8 + b * 9;
        const bh = 14 + ((row * 7 + b * 3) % 6);
        ctx.fillStyle = bookCols[(row * 5 + b) % bookCols.length];
        ctx.fillRect(bx, ry + 20 - bh, 7, bh);
      }
    }

    // tall bookshelf on right
    ctx.fillStyle = '#3e2e1e';
    ctx.fillRect(W - 54, H * 0.06, 50, groundY - H * 0.06);
    for (let row = 0; row < 6; row++){
      const ry = H * 0.10 + row * 28;
      ctx.fillStyle = '#5a4430'; ctx.fillRect(W - 52, ry + 20, 46, 3);
      for (let b = 0; b < 5; b++){
        const bx = W - 50 + b * 9;
        const bh = 14 + ((row * 5 + b * 7) % 6);
        ctx.fillStyle = bookCols[(row * 3 + b * 2 + 1) % bookCols.length];
        ctx.fillRect(bx, ry + 20 - bh, 7, bh);
      }
    }

    // dim candle glow in the center
    const candleGlow = ctx.createRadialGradient(W * 0.5, groundY - 30, 2, W * 0.5, groundY - 30, 70);
    candleGlow.addColorStop(0, 'rgba(255,200,120,.18)');
    candleGlow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = candleGlow; ctx.beginPath(); ctx.arc(W * 0.5, groundY - 30, 70, 0, 7); ctx.fill();

    // candle on a small table
    ctx.fillStyle = '#5a4430'; roundRect(W * 0.47, groundY - 6, 24, 8, 2); ctx.fill();
    ctx.fillStyle = '#eee'; ctx.fillRect(W * 0.50 + 4, groundY - 18, 4, 12);
    // flame
    const flicker = 0.7 + 0.3 * Math.sin(t * 9);
    ctx.fillStyle = '#ffa830';
    ctx.beginPath(); ctx.arc(W * 0.50 + 6, groundY - 19 - 3 * flicker, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe070';
    ctx.beginPath(); ctx.arc(W * 0.50 + 6, groundY - 19 - 3 * flicker, 1.2, 0, 7); ctx.fill();

    // dust motes floating
    ctx.fillStyle = 'rgba(255,240,200,.12)';
    for (let i = 0; i < 8; i++){
      const mx = (i * 53 + Math.sin(t * 0.4 + i * 2) * 20) % W;
      const my = (i * 41 + Math.cos(t * 0.3 + i) * 16) % (groundY * 0.8) + 20;
      ctx.beginPath(); ctx.arc(mx, my, 1, 0, 7); ctx.fill();
    }
  }

  function drawFallingBook(cs){
    if (!fallingBook) return;
    const fb = fallingBook;
    const elapsed = cs.totalT - fb.start;
    if (elapsed < 0 || elapsed > fb.dur) return;
    const p = elapsed / fb.dur;
    const bx = fb.x;
    const by = fb.startY + p * (groundY - fb.startY - 6);
    const rot = p * 2.5;
    ctx.save();
    ctx.translate(bx, by); ctx.rotate(rot);
    ctx.fillStyle = '#8b3a3a'; ctx.fillRect(-5, -3, 10, 6);
    ctx.fillStyle = '#eee'; ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
    // landed
    if (p > 0.9){
      ctx.fillStyle = '#8b3a3a'; ctx.fillRect(fb.x - 5, groundY - 4, 10, 4);
    }
  }

  function drawGhostOrb(cs){
    if (!ghostOrb) return;
    const elapsed = cs.totalT - ghostOrb.start;
    if (elapsed < 0 || elapsed > ghostOrb.dur) return;
    const p = elapsed / ghostOrb.dur;
    // orb drifts from right shelf to left shelf
    const ox = W * 0.75 - p * W * 0.50;
    const oy = H * 0.30 + Math.sin(p * Math.PI * 3) * 18;
    const brightness = Math.sin(p * Math.PI);
    const glow = ctx.createRadialGradient(ox, oy, 1, ox, oy, 20 + brightness * 10);
    glow.addColorStop(0, `rgba(180,220,255,${(0.5 * brightness).toFixed(2)})`);
    glow.addColorStop(0.5, `rgba(140,180,255,${(0.2 * brightness).toFixed(2)})`);
    glow.addColorStop(1, 'rgba(140,180,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ox, oy, 20 + brightness * 10, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(220,240,255,${(0.7 * brightness).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(ox, oy, 3, 0, 7); ctx.fill();
  }

  function drawChars(williamHiding, exprK, exprW){
    if (williamHiding){
      // William behind Krystal — draw him slightly behind and peeking
      if (exprW) csDrawExpression('william', exprW, krystalX + 16, fY + 2, charH * 0.85);
      else csDrawChar('william', krystalX + 16, fY + 2, 'left', charH * 0.85, 0);
      if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
      else csDrawChar('krystal', krystalX, fY, 'up', charH, 0);
    } else {
      if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
      else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
      if (exprW) csDrawExpression('william', exprW, williamX, fY, charH * 0.95);
      else csDrawChar('william', williamX, fY, 'left',  charH * 0.95, 0);
    }
  }

  return {
    chars: ['krystal', 'william'],
    skipable: true,
    steps: [
      // Step 1: Quiet library — peaceful moment — think expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false, 'think', null);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's so quiet in here...");
      }},
      // Step 2: A book falls off the shelf! — surprised expressions
      { dur: 2.0, draw(cs){
          drawBg(cs); drawFallingBook(cs); drawChars(false, 'surprised', 'surprised');
          if (cs.stepT > 0.5){
            csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', "What was THAT?!");
          }
      }, onStart(cs){
          fallingBook = { x: W - 36, startY: H * 0.20, dur: 0.5, start: cs.totalT };
          try{ sfx('tap'); }catch(e){}
      }},
      // Step 3: Krystal reacts — surprised expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawFallingBook(cs); drawChars(false, 'surprised', 'scared');
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Did you see that?!");
      }},
      // Step 4: Ghost orb drifts across — William scared, hides behind Krystal
      { dur: 2.5, draw(cs){
          drawBg(cs); drawGhostOrb(cs); drawFallingBook(cs); drawChars(true, 'surprised', 'scared');
          if (cs.stepT > 0.8){
            csDrawBubble(krystalX + 16, fY - charH * 0.85 - 4, 'William', "I'm not scared... you're scared!");
          }
      }, onStart(cs){
          ghostOrb = { start: cs.totalT, dur: 2.2 };
      }},
      // Step 5: Krystal laughs it off
      { dur: 2.5, draw(cs){
          drawBg(cs); drawGhostOrb(cs); drawFallingBook(cs); drawChars(true, 'laugh', 'embarrassed');
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's just the wind... right? \ud83d\udc40");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 6: AQUARIUM WONDER  (triggers at 'aquarium' or 'aquariumtunnel')
   ============================================================================ */
function csAquariumWonder(){
  const groundY = H * 0.76;
  const charH = 80;
  const fY = groundY + 8;
  const krystalX = W * 0.40, lukeX = W * 0.62;

  // jellyfish state
  let jellies = [];
  for (let i = 0; i < 5; i++){
    jellies.push({
      x: W * 0.15 + i * W * 0.18,
      y: H * 0.22 + (i % 3) * 28,
      phase: i * 1.3,
      r: 8 + (i % 3) * 3
    });
  }

  // whale shark state
  let whaleShark = { x: -80, y: H * 0.18, active: false };

  // small fish
  const fishArr = [];
  for (let i = 0; i < 12; i++){
    fishArr.push({
      x: (i * 67 + 30) % W, y: H * 0.20 + (i * 31) % (groundY * 0.5),
      vx: 12 + (i % 4) * 6, size: 3 + (i % 3) * 2,
      col: ['#f08040','#40a0f0','#f0d040','#a0f060','#f07090'][i % 5],
      phase: i * 0.8
    });
  }

  function drawBg(cs){
    const t = cs.totalT;
    // deep blue aquarium gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#081830'); bg.addColorStop(0.4, '#0c2848'); bg.addColorStop(1, '#061420');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // caustic light ripples on the ceiling
    for (let i = 0; i < 6; i++){
      const cx = (i * W / 5 + Math.sin(t * 0.8 + i) * 20) % W;
      const cy = 10 + Math.sin(t * 1.2 + i * 1.5) * 6;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + Math.sin(t + i) * 8);
      cg.addColorStop(0, 'rgba(80,180,255,.08)'); cg.addColorStop(1, 'rgba(80,180,255,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 30 + Math.sin(t + i) * 8, 0, 7); ctx.fill();
    }

    // small fish swimming
    for (const f of fishArr){
      const fx = (f.x + f.vx * t) % (W + 40) - 20;
      const fy = f.y + Math.sin(t * 1.5 + f.phase) * 8;
      ctx.fillStyle = f.col;
      ctx.beginPath();
      ctx.moveTo(fx + f.size, fy);
      ctx.lineTo(fx - f.size, fy - f.size * 0.6);
      ctx.lineTo(fx - f.size, fy + f.size * 0.6);
      ctx.closePath(); ctx.fill();
      // tail
      ctx.beginPath();
      ctx.moveTo(fx - f.size, fy);
      ctx.lineTo(fx - f.size - f.size * 0.7, fy - f.size * 0.5);
      ctx.lineTo(fx - f.size - f.size * 0.7, fy + f.size * 0.5);
      ctx.closePath(); ctx.fill();
    }

    // bubbles
    ctx.fillStyle = 'rgba(150,220,255,.15)';
    for (let i = 0; i < 10; i++){
      const bx = (i * 47 + 20) % W;
      const by = H - ((t * 18 + i * 50) % (H * 0.9));
      const br = 1.5 + (i % 3);
      ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
    }

    // sandy bottom
    const sand = ctx.createLinearGradient(0, groundY - 10, 0, H);
    sand.addColorStop(0, '#2a4050'); sand.addColorStop(1, '#1a2830');
    ctx.fillStyle = sand; ctx.fillRect(0, groundY - 10, W, H - groundY + 10);
    // sand texture
    ctx.fillStyle = 'rgba(200,180,140,.08)';
    for (let i = 0; i < 20; i++){
      const sx = (i * 31) % W, sy = groundY - 4 + (i * 7) % 16;
      ctx.fillRect(sx, sy, 3, 1);
    }

    // seaweed
    ctx.strokeStyle = 'rgba(40,140,80,.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++){
      const sx = W * 0.1 + i * W * 0.25;
      ctx.beginPath(); ctx.moveTo(sx, H);
      for (let y = H; y > groundY - 20; y -= 6){
        ctx.lineTo(sx + Math.sin((H - y) * 0.08 + t * 1.5 + i) * 6, y);
      }
      ctx.stroke();
    }
  }

  function drawJellies(cs){
    const t = cs.totalT;
    for (const j of jellies){
      const jx = j.x + Math.sin(t * 0.6 + j.phase) * 12;
      const jy = j.y + Math.sin(t * 0.8 + j.phase + 1) * 8;
      // bell
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.5 + j.phase);
      const glow = ctx.createRadialGradient(jx, jy, 0, jx, jy, j.r * pulse);
      glow.addColorStop(0, 'rgba(200,140,255,.5)'); glow.addColorStop(0.6, 'rgba(180,120,240,.25)'); glow.addColorStop(1, 'rgba(180,120,240,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(jx, jy, j.r * pulse, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(220,180,255,.45)';
      ctx.beginPath(); ctx.arc(jx, jy, j.r * pulse * 0.7, Math.PI, 0); ctx.fill();
      // tentacles
      ctx.strokeStyle = 'rgba(200,160,255,.3)'; ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++){
        const tx = jx - 4 + k * 3;
        ctx.beginPath(); ctx.moveTo(tx, jy + j.r * 0.3);
        ctx.quadraticCurveTo(tx + Math.sin(t * 2 + k + j.phase) * 4, jy + j.r + 8, tx + Math.sin(t * 1.5 + k) * 3, jy + j.r + 16);
        ctx.stroke();
      }
    }
  }

  function drawWhaleShark(cs){
    if (!whaleShark.active) return;
    const t = cs.totalT;
    const ws = whaleShark;
    const wx = ws.x + t * 28;
    const wy = ws.y + Math.sin(t * 0.5) * 10;
    if (wx > W + 120) return;
    // body
    ctx.fillStyle = 'rgba(60,80,110,.7)';
    ctx.beginPath();
    ctx.ellipse(wx, wy, 60, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // spots
    ctx.fillStyle = 'rgba(180,200,220,.25)';
    for (let i = 0; i < 8; i++){
      const dx = -30 + i * 8 + (i % 3) * 2;
      const dy = -6 + (i % 3) * 6;
      ctx.beginPath(); ctx.arc(wx + dx, wy + dy, 2, 0, 7); ctx.fill();
    }
    // tail
    ctx.fillStyle = 'rgba(60,80,110,.6)';
    ctx.beginPath();
    ctx.moveTo(wx - 56, wy);
    ctx.lineTo(wx - 76, wy - 14 + Math.sin(t * 3) * 4);
    ctx.lineTo(wx - 76, wy + 14 + Math.sin(t * 3 + 1) * 4);
    ctx.closePath(); ctx.fill();
    // eye
    ctx.fillStyle = 'rgba(200,220,240,.8)';
    ctx.beginPath(); ctx.arc(wx + 48, wy - 4, 2.5, 0, 7); ctx.fill();
    // shadow underneath
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.beginPath(); ctx.ellipse(wx, groundY - 4, 50, 6, 0, 0, 7); ctx.fill();
  }

  function drawChars(exprK, exprL){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (exprL) csDrawExpression('luke', exprL, lukeX, fY, charH * 0.95);
    else csDrawChar('luke', lukeX, fY, 'left', charH * 0.95, 0);
  }

  return {
    chars: ['krystal', 'luke'],
    skipable: true,
    steps: [
      // Step 1: Both watching fish — cheer expression on Krystal
      { dur: 2.5, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars('cheer', null);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Look at all the fish! 🐠");
      }},
      // Step 2: Luke spots a jellyfish — surprised expression
      { dur: 2.5, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars(null, 'surprised');
          csDrawBubble(lukeX, fY - charH * 0.95 - 4, 'Luke', "Whoa, a jellyfish! Look!");
      }},
      // Step 3: Krystal is amazed — surprised expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars('surprised', 'cheer');
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It glows! So pretty 🪼✨");
      }},
      // Step 4: Whale shark appears overhead — surprised both
      { dur: 3.0, draw(cs){
          drawBg(cs); drawJellies(cs); drawWhaleShark(cs); drawChars('surprised', 'surprised');
          if (cs.stepT > 1.0){
            csDrawBubble(W * 0.50, fY - charH - 4, null, 'Woooow! 🐋');
          }
      }, onStart(cs){
          whaleShark.active = true;
          whaleShark.x = -100;
          whaleShark.y = H * 0.14;
      }},
      // Step 5: Both in awe — cheer expressions, hearts
      { dur: 2.5, draw(cs){
          drawBg(cs); drawJellies(cs); drawWhaleShark(cs); drawChars('cheer', 'cheer');
          csDrawBubble(lukeX, fY - charH * 0.95 - 4, 'Luke', "That was AWESOME! 😍");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, lukeX, fY - charH * 0.6, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 7: RAINY DAY CHAT  (triggers at 'rainystreet')
   ============================================================================ */
function csRainyDayChat(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const paulX = W * 0.46, krystalX = W * 0.54;

  // rain drops
  const raindrops = [];
  for (let i = 0; i < 60; i++){
    raindrops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 180 + Math.random() * 120,
      len: 6 + Math.random() * 8
    });
  }

  // puddle ripple state
  const ripples = [];

  function drawBg(cs){
    const t = cs.totalT;
    // overcast sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#3a3e4c'); sky.addColorStop(0.5, '#4a5060'); sky.addColorStop(1, '#5a6070');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // cloud layers
    ctx.fillStyle = 'rgba(70,75,90,.6)';
    for (let i = 0; i < 5; i++){
      const cx = (i * W / 4 + Math.sin(t * 0.1 + i) * 8) % (W + 60) - 30;
      const cy = 14 + i * 10;
      ctx.beginPath(); ctx.ellipse(cx, cy, 50 + i * 6, 14 + i * 2, 0, 0, 7); ctx.fill();
    }

    // buildings silhouette in the background
    ctx.fillStyle = '#2e3240';
    const bldgs = [
      [0, groundY - 60, 30, 60],
      [28, groundY - 80, 24, 80],
      [50, groundY - 50, 28, 50],
      [76, groundY - 70, 20, 70],
      [W - 70, groundY - 65, 26, 65],
      [W - 46, groundY - 85, 22, 85],
      [W - 26, groundY - 55, 28, 55],
    ];
    for (const [bx, by, bw, bh] of bldgs){
      ctx.fillRect(bx, by, bw, bh);
      // lit windows
      ctx.fillStyle = 'rgba(255,220,140,.2)';
      for (let wy = by + 8; wy < by + bh - 10; wy += 14){
        for (let wx = bx + 4; wx < bx + bw - 6; wx += 8){
          if (((wx * 7 + wy * 3) % 5) < 3) ctx.fillRect(wx, wy, 4, 5);
        }
      }
      ctx.fillStyle = '#2e3240';
    }

    // wet street
    const street = ctx.createLinearGradient(0, groundY, 0, H);
    street.addColorStop(0, '#3a3e50'); street.addColorStop(1, '#2a2e3c');
    ctx.fillStyle = street; ctx.fillRect(0, groundY, W, H - groundY);
    // wet reflection sheen
    ctx.fillStyle = 'rgba(100,120,150,.12)';
    ctx.fillRect(0, groundY, W, H - groundY);

    // street lamp
    const lampX = W * 0.18;
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(lampX - 2, groundY - 70, 4, 70);
    ctx.fillStyle = '#5a5a5a'; ctx.fillRect(lampX - 8, groundY - 72, 16, 4);
    // lamp glow
    const lampGlow = ctx.createRadialGradient(lampX, groundY - 74, 2, lampX, groundY - 74, 60);
    lampGlow.addColorStop(0, 'rgba(255,220,140,.25)'); lampGlow.addColorStop(0.5, 'rgba(255,200,100,.08)'); lampGlow.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = lampGlow; ctx.beginPath(); ctx.arc(lampX, groundY - 74, 60, 0, 7); ctx.fill();

    // puddle ripples
    for (let i = ripples.length - 1; i >= 0; i--){
      const r = ripples[i];
      r.age += 0.016;
      if (r.age > r.dur){ ripples.splice(i, 1); continue; }
      const p = r.age / r.dur;
      const ra = r.maxR * p;
      ctx.strokeStyle = `rgba(150,170,200,${(0.2 * (1 - p)).toFixed(2)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, ra, ra * 0.3, 0, 0, 7); ctx.stroke();
    }
  }

  function drawRain(cs, dt){
    const t = cs.totalT;
    ctx.strokeStyle = 'rgba(180,200,220,.35)'; ctx.lineWidth = 1;
    for (const r of raindrops){
      r.y += r.speed * dt;
      if (r.y > H){
        r.y = -r.len;
        r.x = Math.random() * W;
        // spawn a puddle ripple when a drop hits the ground
        if (Math.random() < 0.3){
          ripples.push({ x: r.x, y: groundY + 2 + Math.random() * 8, age: 0, dur: 0.6 + Math.random() * 0.4, maxR: 4 + Math.random() * 4 });
        }
      }
      ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 1, r.y + r.len); ctx.stroke();
    }
  }

  function drawUmbrella(cx, topY){
    // umbrella canopy
    ctx.fillStyle = '#c04060';
    ctx.beginPath(); ctx.arc(cx, topY, 32, Math.PI, 0); ctx.fill();
    // scalloped edge
    ctx.fillStyle = '#a83050';
    for (let i = 0; i < 5; i++){
      const ax = cx - 28 + i * 14;
      ctx.beginPath(); ctx.arc(ax, topY, 5, 0, Math.PI); ctx.fill();
    }
    // handle
    ctx.strokeStyle = '#6a3a2a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, topY + 48); ctx.stroke();
    // handle hook
    ctx.beginPath(); ctx.arc(cx + 4, topY + 48, 4, 0, Math.PI); ctx.stroke();
  }

  function drawCharsExpr(snuggle, exprP, exprK){
    const offset = snuggle ? -8 : 0;
    if (exprP) csDrawExpression('paul', exprP, paulX, fY, charH);
    else csDrawChar('paul', paulX, fY, 'right', charH, 0);
    if (exprK) csDrawExpression('krystal', exprK, krystalX + offset, fY, charH);
    else csDrawChar('krystal', krystalX + offset, fY, 'left', charH, 0);
  }

  return {
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Standing under umbrella, rain falling — surprised at rain
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr(false, null, 'surprised');
          drawUmbrella(W * 0.50, fY - charH - 12);
          drawRain(cs, 0);
          csDrawBubble(krystalX, fY - charH - 28, 'Krystal', "It's really coming down! 🌧️");
      }, update(cs, dt){ drawRain(cs, dt); }},
      // Step 2: Paul speaks — cheer expression
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr(false, 'cheer', null);
          drawUmbrella(W * 0.50, fY - charH - 12);
          drawRain(cs, 0);
          csDrawBubble(paulX, fY - charH - 28, 'Paul', "I love rainy days with you.");
      }, update(cs, dt){ drawRain(cs, dt); }},
      // Step 3: Krystal reacts warmly — embarrassed expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr(false, 'cheer', 'embarrassed');
          drawUmbrella(W * 0.50, fY - charH - 12);
          drawRain(cs, 0);
          csDrawBubble(krystalX, fY - charH - 28, 'Krystal', "You always say the sweetest things 🥰");
      }, update(cs, dt){ drawRain(cs, dt); }},
      // Step 4: Krystal snuggles closer — cheer expressions
      { dur: 3.0, draw(cs){
          drawBg(cs); drawCharsExpr(true, 'cheer', 'cheer');
          drawUmbrella(W * 0.50, fY - charH - 12);
          drawRain(cs, 0);
          if (cs.stepT < 1.5){
            csDrawBubble(krystalX - 8, fY - charH - 28, 'Krystal', "*snuggles closer* 💛");
          }
      }, onStart(cs){
          csHearts(cs, paulX, fY - charH * 0.7, 5);
          csHearts(cs, krystalX - 8, fY - charH * 0.7, 6);
      }, update(cs, dt){ drawRain(cs, dt); }},
      // Step 5: Peaceful ending — just rain sounds and closeness
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr(true, 'cheer', 'cheer');
          drawUmbrella(W * 0.50, fY - charH - 12);
          drawRain(cs, 0);
      }, update(cs, dt){ drawRain(cs, dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 8: FLOWER CROWN  (triggers at florist, cherryblossom, lavender, peonygarden)
   ============================================================================ */
function csFlowerCrown(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const lunaX = W * 0.50, krystalX = W * 0.34, wadeX = W * 0.68;

  // floating petal particles
  let petals = [];
  function spawnPetals(cx, cy, n){
    const cols = ['#ffb7c5','#f5a0b0','#ffd1dc','#e8a0c0','#fff0f5'];
    for (let i = 0; i < n; i++){
      petals.push({
        x: cx + rand(-20, 20), y: cy + rand(-6, 6),
        vx: rand(-12, 12), vy: rand(-25, -50),
        rot: Math.random() * 6.28, vr: rand(-3, 3),
        life: 1.4 + Math.random() * 1.0,
        maxLife: 1.4 + Math.random() * 1.0,
        size: 2.5 + Math.random() * 2,
        col: cols[Math.floor(Math.random() * cols.length)]
      });
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // soft spring sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#a8d8f0'); sky.addColorStop(0.5, '#d0e8f4'); sky.addColorStop(1, '#e8f4e8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // puffy clouds
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 3; i++){
      const cx = (i * W / 2.5 + 20 + Math.sin(t * 0.08 + i) * 6);
      const cy = 22 + i * 14;
      ctx.beginPath(); ctx.ellipse(cx, cy, 32 + i * 6, 10, 0, 0, 7); ctx.fill();
    }

    // grassy meadow ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#6aae4a'); gr.addColorStop(1, '#4a8e3a');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // scattered wildflowers on the ground
    const flowerCols = ['#ff6090','#ffa040','#ffd040','#9060e0','#ff80b0'];
    for (let i = 0; i < 18; i++){
      const fx = (i * 43 + 12) % W;
      const fy = groundY + 4 + (i * 17) % 20;
      ctx.fillStyle = flowerCols[i % flowerCols.length];
      ctx.beginPath(); ctx.arc(fx, fy, 2, 0, 7); ctx.fill();
      // tiny stem
      ctx.strokeStyle = '#3a7a2a'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(fx, fy + 2); ctx.lineTo(fx, fy + 6); ctx.stroke();
    }

    // flower bushes left and right
    for (let side = 0; side < 2; side++){
      const bx = side === 0 ? W * 0.08 : W * 0.90;
      ctx.fillStyle = '#3a8a30';
      ctx.beginPath(); ctx.ellipse(bx, groundY - 4, 22, 18, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#ff80a0';
      for (let j = 0; j < 6; j++){
        const px = bx + Math.cos(j * 1.05) * 14;
        const py = groundY - 8 + Math.sin(j * 1.5) * 10;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill();
      }
    }
  }

  function drawPetals(dt){
    for (let i = petals.length - 1; i >= 0; i--){
      const p = petals[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 18 * dt; // gentle gravity
      p.rot += p.vr * dt;
      p.life -= dt;
      if (p.life <= 0){ petals.splice(i, 1); continue; }
      const a = Math.min(1, p.life / p.maxLife * 1.6);
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.col; ctx.globalAlpha = a;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // draw a simple flower crown on a character's head
  function drawCrown(cx, topY, tiny){
    const r = tiny ? 8 : 12;
    const cols = ['#ff6080','#ffa040','#ffd040','#a060d0','#ff80b0'];
    // vine arc
    ctx.strokeStyle = '#3a8a30'; ctx.lineWidth = tiny ? 1.2 : 1.8;
    ctx.beginPath(); ctx.arc(cx, topY + 2, r, Math.PI, 0); ctx.stroke();
    // flowers along the arc
    const n = tiny ? 3 : 5;
    for (let i = 0; i < n; i++){
      const ang = Math.PI + (i / (n - 1)) * Math.PI;
      const fx = cx + Math.cos(ang) * r;
      const fy = topY + 2 + Math.sin(ang) * r;
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.arc(fx, fy, tiny ? 2 : 3, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffe060';
      ctx.beginPath(); ctx.arc(fx, fy, tiny ? 0.8 : 1.2, 0, 7); ctx.fill();
    }
  }

  function drawCharsExpr(krystalCrown, wadeCrown, exprK, exprL, exprW){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (exprL) csDrawExpression('luna', exprL, lunaX, fY, charH * 0.9);
    else csDrawChar('luna', lunaX, fY, 'down', charH * 0.9, 0);
    if (exprW) csDrawExpression('wade', exprW, wadeX, fY, charH * 0.95);
    else csDrawChar('wade', wadeX, fY, 'left', charH * 0.95, 0);
    if (krystalCrown) drawCrown(krystalX, fY - charH - 2, false);
    if (wadeCrown) drawCrown(wadeX, fY - charH * 0.95 - 2, true);
  }

  return {
    chars: ['krystal', 'luna', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Luna is crafting flower crowns — think expression
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(false, false, null, 'think', null); drawPetals(0);
          csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', 'Almost done with this one...');
      }, update(cs, dt){ drawPetals(dt); }},
      // Step 2: Luna places the crown on Krystal — cheer expression on Luna
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(true, false, 'surprised', 'cheer', null); drawPetals(0);
          csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', 'There! A crown for a queen!');
      }, onStart(cs){
          spawnPetals(krystalX, fY - charH, 10);
      }, update(cs, dt){ drawPetals(dt); }},
      // Step 3: Krystal reacts — cheer expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr(true, false, 'cheer', 'cheer', null); drawPetals(0);
          csDrawBubble(krystalX, fY - charH - 14, 'Krystal', 'I love it so much! \ud83e\udd70');
      }, update(cs, dt){ drawPetals(dt); }},
      // Step 4: Wade wants one — wave expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr(true, false, 'cheer', null, 'wave'); drawPetals(0);
          csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'Hey, where\u2019s MY crown?!');
      }, update(cs, dt){ drawPetals(dt); }},
      // Step 5: Luna makes Wade a tiny one. Everyone laughs.
      { dur: 2.8, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.6){
            drawCharsExpr(true, true, 'cheer', 'cheer', 'surprised');
            csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', 'Here\u2019s a little one just for you!');
          } else {
            drawCharsExpr(true, true, 'laugh', 'laugh', 'embarrassed');
            csDrawBubble(krystalX, fY - charH - 14, 'Krystal', 'You look adorable! \ud83d\ude02');
          }
          drawPetals(0);
      }, onStart(cs){
          spawnPetals(wadeX, fY - charH * 0.9, 8);
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, lunaX, fY - charH * 0.6, 3);
          csHearts(cs, wadeX, fY - charH * 0.6, 4);
      }, update(cs, dt){ drawPetals(dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 9: SNOW ANGEL CONTEST  (triggers at snowycabin, icepond, frozenfalls)
   ============================================================================ */
function csSnowAngelContest(){
  const groundY = H * 0.68;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.28, paulX = W * 0.50, williamX = W * 0.72;

  // snowflake particles
  const snowflakes = [];
  for (let i = 0; i < 40; i++){
    snowflakes.push({
      x: Math.random() * W, y: Math.random() * H,
      speed: 15 + Math.random() * 20,
      drift: rand(-8, 8),
      size: 1 + Math.random() * 2,
      phase: Math.random() * 6.28
    });
  }

  function drawBg(cs){
    const t = cs.totalT;
    // pale winter sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#b0c4d8'); sky.addColorStop(0.6, '#d0dce8'); sky.addColorStop(1, '#e0e8f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // distant snowy mountains
    ctx.fillStyle = '#c8d4e0';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    ctx.lineTo(W * 0.15, groundY - 50); ctx.lineTo(W * 0.30, groundY - 30);
    ctx.lineTo(W * 0.50, groundY - 65); ctx.lineTo(W * 0.70, groundY - 35);
    ctx.lineTo(W * 0.85, groundY - 55); ctx.lineTo(W, groundY - 25);
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();
    // snow peaks
    ctx.fillStyle = '#e8f0f8';
    ctx.beginPath(); ctx.moveTo(W * 0.13, groundY - 45);
    ctx.lineTo(W * 0.15, groundY - 50); ctx.lineTo(W * 0.17, groundY - 44); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.48, groundY - 60);
    ctx.lineTo(W * 0.50, groundY - 65); ctx.lineTo(W * 0.52, groundY - 58); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.83, groundY - 50);
    ctx.lineTo(W * 0.85, groundY - 55); ctx.lineTo(W * 0.87, groundY - 48); ctx.fill();

    // snowy pine trees
    ctx.fillStyle = '#2a5040';
    for (let i = 0; i < 6; i++){
      const px = i * W / 5 + 10;
      const ph = 20 + ((i * 13) % 16);
      drawPine(px, groundY + 2, ph);
    }
    // snow on pines
    ctx.fillStyle = 'rgba(240,245,255,.4)';
    for (let i = 0; i < 6; i++){
      const px = i * W / 5 + 10;
      const ph = 20 + ((i * 13) % 16);
      ctx.beginPath();
      ctx.moveTo(px - 4, groundY + 2 - ph * 0.5);
      ctx.lineTo(px, groundY + 2 - ph);
      ctx.lineTo(px + 4, groundY + 2 - ph * 0.5);
      ctx.closePath(); ctx.fill();
    }

    // snow-covered ground
    const snow = ctx.createLinearGradient(0, groundY, 0, H);
    snow.addColorStop(0, '#eef2f8'); snow.addColorStop(1, '#d8e0ea');
    ctx.fillStyle = snow; ctx.fillRect(0, groundY, W, H - groundY);

    // subtle snow drifts
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.beginPath(); ctx.moveTo(0, groundY + 6);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, groundY + 4 + Math.sin(x * 0.04 + 0.5) * 3);
    ctx.lineTo(W, groundY + 12); ctx.lineTo(0, groundY + 12); ctx.closePath(); ctx.fill();

    // falling snow
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (const s of snowflakes){
      const sx = (s.x + Math.sin(t * 0.7 + s.phase) * s.drift + t * s.drift * 0.2) % W;
      const sy = (s.y + s.speed * t) % H;
      ctx.beginPath(); ctx.arc(sx < 0 ? sx + W : sx, sy, s.size, 0, 7); ctx.fill();
    }
  }

  // draw a snow angel impression in the snow
  function drawSnowAngel(cx, cy, quality){
    ctx.save();
    // body impression
    ctx.fillStyle = 'rgba(200,210,225,.6)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, 10, 16, 0, 0, 7); ctx.fill();
    // wing impressions
    if (quality === 'perfect'){
      ctx.fillStyle = 'rgba(200,210,225,.5)';
      ctx.beginPath(); ctx.ellipse(cx - 18, cy, 12, 6, -0.3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 18, cy, 12, 6, 0.3, 0, 7); ctx.fill();
    } else {
      // messy — lopsided wings, smudge marks
      ctx.fillStyle = 'rgba(190,200,215,.5)';
      ctx.beginPath(); ctx.ellipse(cx - 16, cy + 4, 14, 5, -0.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 20, cy - 2, 10, 7, 0.5, 0, 7); ctx.fill();
      // hand drag marks
      ctx.strokeStyle = 'rgba(180,190,210,.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 22, cy + 6); ctx.lineTo(cx + 30, cy + 12); ctx.stroke();
    }
    ctx.restore();
  }

  function drawChars(paulFallen, exprK, exprP, exprW){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (paulFallen){
      // Paul on the ground — draw facing up, smaller, lower
      if (exprP) csDrawExpression('paul', exprP, paulX, fY + 20, charH * 0.6);
      else csDrawChar('paul', paulX, fY + 20, 'up', charH * 0.6, 0);
    } else {
      if (exprP) csDrawExpression('paul', exprP, paulX, fY, charH);
      else csDrawChar('paul', paulX, fY, 'down', charH, 0);
    }
    if (exprW) csDrawExpression('william', exprW, williamX, fY, charH * 0.95);
    else csDrawChar('william', williamX, fY, 'left', charH * 0.95, 0);
  }

  return {
    chars: ['krystal', 'paul', 'william'],
    skipable: true,
    steps: [
      // Step 1: Fresh snow, everyone excited — cheer expressions
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false, 'cheer', null, 'cheer');
          csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', 'Snow angel contest! Watch this!');
      }},
      // Step 2: William makes a perfect snow angel — surprised on Krystal
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawSnowAngel(williamX, groundY + 14, 'perfect');
          drawChars(false, 'surprised', null, 'cheer');
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Wow, that\u2019s actually perfect!');
      }},
      // Step 3: Paul tries... and face-plants — embarrassed on Paul, laugh on others
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawSnowAngel(williamX, groundY + 14, 'perfect');
          drawSnowAngel(paulX, groundY + 16, 'messy');
          drawChars(true, 'laugh', 'embarrassed', 'laugh');
          csDrawBubble(paulX, fY + 20 - charH * 0.6 - 4, 'Paul', 'Nailed it! ...ow.');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      // Step 4: Krystal laughs and helps Paul up — cheer on Krystal, embarrassed Paul
      { dur: 2.5, draw(cs){
          drawBg(cs);
          drawSnowAngel(williamX, groundY + 14, 'perfect');
          drawSnowAngel(paulX, groundY + 16, 'messy');
          csDrawExpression('krystal', 'laugh', paulX - 20, fY, charH);
          csDrawExpression('paul', 'embarrassed', paulX, fY, charH);
          csDrawExpression('william', 'laugh', williamX, fY, charH * 0.95);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Come here, you goof \u2764\ufe0f');
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, paulX, fY - charH * 0.7, 4);
      }},
      // Step 5: William proud — cheer expression, everyone warm
      { dur: 2.5, draw(cs){
          drawBg(cs);
          drawSnowAngel(williamX, groundY + 14, 'perfect');
          drawSnowAngel(paulX, groundY + 16, 'messy');
          csDrawExpression('krystal', 'cheer', paulX - 20, fY, charH);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawExpression('william', 'cheer', williamX, fY, charH * 0.95);
          csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', 'I clearly won. \ud83d\ude0e');
      }, onStart(cs){
          csHearts(cs, williamX, fY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 10: MUSIC JAM  (triggers at musicroom, recordshop, jazzclub)
   ============================================================================ */
function csMusicJam(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.20, paulX = W * 0.40, lukeX = W * 0.60, lunaX = W * 0.80;

  // floating music notes
  let notes = [];
  const noteChars = ['\u266a','\u266b','\u2669','\u266c'];
  function spawnNotes(cx, cy, n){
    for (let i = 0; i < n; i++){
      notes.push({
        x: cx + rand(-16, 16), y: cy,
        vx: rand(-10, 10), vy: rand(-35, -60),
        life: 1.6 + Math.random() * 1.2,
        maxLife: 1.6 + Math.random() * 1.2,
        ch: noteChars[Math.floor(Math.random() * noteChars.length)],
        size: 12 + Math.floor(Math.random() * 6),
        col: ['#ff6090','#6090ff','#60d060','#ffa040','#c060e0'][Math.floor(Math.random() * 5)]
      });
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // warm room interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#2a1a30'); wall.addColorStop(0.5, '#3a2240'); wall.addColorStop(1, '#4a2a4a');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wood floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#5a4030'); floor.addColorStop(1, '#4a3424');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    // planks
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 26){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // stage lights / colored spots
    const spotCols = ['rgba(255,100,120,.12)','rgba(100,120,255,.12)','rgba(120,255,100,.12)'];
    for (let i = 0; i < 3; i++){
      const sx = W * 0.25 + i * W * 0.25;
      const pulse = 0.7 + 0.3 * Math.sin(t * 2.5 + i * 2.1);
      const sg = ctx.createRadialGradient(sx, 0, 0, sx, groundY * 0.5, 70 * pulse);
      sg.addColorStop(0, spotCols[i]); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 70, 0, 140, groundY);
    }

    // amp / speaker on the left wall
    ctx.fillStyle = '#1a1a1a';
    roundRect(6, groundY - 32, 22, 32, 2); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(17, groundY - 16, 8, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(17, groundY - 16, 5, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(17, groundY - 16, 3, 0, 7); ctx.stroke();

    // poster on the wall
    ctx.fillStyle = '#c04060';
    roundRect(W - 38, H * 0.12, 24, 30, 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '6px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ROCK', W - 26, H * 0.12 + 16);
    ctx.fillText('ON', W - 26, H * 0.12 + 24);
  }

  // draw simple instruments near characters
  function drawInstruments(cs){
    // Krystal — tambourine (small circle at hand level)
    const tambX = krystalX + 14, tambY = fY - charH * 0.4;
    ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tambX, tambY, 6, 0, 7); ctx.stroke();
    ctx.fillStyle = '#e8c860';
    for (let i = 0; i < 4; i++){
      const a = i * 1.57;
      ctx.beginPath(); ctx.arc(tambX + Math.cos(a) * 6, tambY + Math.sin(a) * 6, 1.5, 0, 7); ctx.fill();
    }

    // Paul — guitar (simple shape)
    const gx = paulX + 16, gy = fY - charH * 0.45;
    ctx.fillStyle = '#a06030';
    ctx.beginPath(); ctx.ellipse(gx, gy + 6, 7, 10, 0.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#c08040';
    ctx.beginPath(); ctx.ellipse(gx, gy + 6, 5, 7, 0.2, 0, 7); ctx.fill();
    // neck
    ctx.fillStyle = '#804020'; ctx.fillRect(gx - 1.5, gy - 16, 3, 16);
    // strings
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++){
      ctx.beginPath(); ctx.moveTo(gx - 1 + i, gy - 14); ctx.lineTo(gx - 1 + i, gy + 10); ctx.stroke();
    }

    // Luke — trumpet (simple shape)
    const tx = lukeX + 14, ty = fY - charH * 0.55;
    ctx.fillStyle = '#d4a840';
    ctx.fillRect(tx - 10, ty, 20, 4);
    // bell
    ctx.beginPath(); ctx.moveTo(tx + 10, ty - 2); ctx.lineTo(tx + 18, ty - 6);
    ctx.lineTo(tx + 18, ty + 10); ctx.lineTo(tx + 10, ty + 6); ctx.closePath(); ctx.fill();
    // valves
    ctx.fillStyle = '#b89030';
    for (let i = 0; i < 3; i++) ctx.fillRect(tx - 4 + i * 5, ty - 4, 2, 4);

    // Luna — keyboard (flat rectangle)
    const kx = lunaX - 4, ky = fY - charH * 0.38;
    ctx.fillStyle = '#222'; roundRect(kx - 14, ky, 28, 8, 1); ctx.fill();
    // white keys
    ctx.fillStyle = '#eee';
    for (let i = 0; i < 7; i++) ctx.fillRect(kx - 12 + i * 3.6, ky + 1, 3, 5);
    // black keys
    ctx.fillStyle = '#333';
    for (let i = 0; i < 5; i++){
      if (i === 2) continue; // skip one for realism
      ctx.fillRect(kx - 10.5 + i * 3.6, ky + 1, 2, 3);
    }
  }

  function drawNotes(dt){
    for (let i = notes.length - 1; i >= 0; i--){
      const n = notes[i];
      n.x += n.vx * dt; n.y += n.vy * dt;
      n.vx += rand(-4, 4) * dt; // wobble
      n.life -= dt;
      if (n.life <= 0){ notes.splice(i, 1); continue; }
      const a = Math.min(1, n.life / n.maxLife * 2);
      ctx.font = n.size + 'px serif'; ctx.textAlign = 'center';
      ctx.fillStyle = n.col; ctx.globalAlpha = a;
      ctx.fillText(n.ch, n.x, n.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawCharsExpr(exprK, exprP, exprLk, exprLn){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (exprP) csDrawExpression('paul', exprP, paulX, fY, charH);
    else csDrawChar('paul', paulX, fY, 'down', charH, 0);
    if (exprLk) csDrawExpression('luke', exprLk, lukeX, fY, charH * 0.95);
    else csDrawChar('luke', lukeX, fY, 'down', charH * 0.95, 0);
    if (exprLn) csDrawExpression('luna', exprLn, lunaX, fY, charH * 0.9);
    else csDrawChar('luna', lunaX, fY, 'left', charH * 0.9, 0);
  }

  return {
    chars: ['krystal', 'paul', 'luke', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Everyone picking up instruments — cheer expression on Paul
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'cheer', null, null); drawInstruments(cs); drawNotes(0);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Alright everyone, let\u2019s jam!');
      }, update(cs, dt){ drawNotes(dt); }},
      // Step 2: They start playing — cheer expressions, notes rise
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr('cheer', 'cheer', 'cheer', 'cheer'); drawInstruments(cs); drawNotes(0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Here we go! \ud83c\udfb6');
      }, onStart(cs){
          spawnNotes(paulX, fY - charH * 0.6, 4);
          spawnNotes(krystalX, fY - charH * 0.6, 3);
          spawnNotes(lunaX, fY - charH * 0.5, 3);
          spawnNotes(lukeX, fY - charH * 0.6, 3);
      }, update(cs, dt){ drawNotes(dt); }},
      // Step 3: In full groove — cheer expressions, more notes
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr('cheer', 'cheer', 'cheer', 'cheer'); drawInstruments(cs); drawNotes(0);
      }, onStart(cs){
          spawnNotes(paulX, fY - charH * 0.5, 5);
          spawnNotes(lunaX, fY - charH * 0.5, 4);
          spawnNotes(krystalX, fY - charH * 0.5, 4);
          spawnNotes(lukeX, fY - charH * 0.5, 5);
      }, update(cs, dt){ drawNotes(dt); }},
      // Step 4: Luke plays something ridiculous — wave expression on Luke
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr('cheer', 'cheer', 'wave', 'cheer'); drawInstruments(cs); drawNotes(0);
          csDrawBubble(lukeX, fY - charH * 0.95 - 4, 'Luke', '*plays the silliest solo ever*');
      }, onStart(cs){
          // big burst of notes from Luke
          spawnNotes(lukeX, fY - charH * 0.7, 10);
      }, update(cs, dt){ drawNotes(dt); }},
      // Step 5: Everyone cracks up — laugh expressions
      { dur: 2.8, draw(cs){
          drawBg(cs); drawCharsExpr('laugh', 'laugh', 'embarrassed', 'laugh'); drawInstruments(cs); drawNotes(0);
          if (cs.stepT < 1.5){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'WHAT was that?! \ud83d\ude02');
          } else {
            csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', 'I can\u2019t breathe! \ud83d\ude02');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, paulX, fY - charH * 0.7, 3);
          csHearts(cs, lukeX, fY - charH * 0.6, 4);
          csHearts(cs, lunaX, fY - charH * 0.5, 3);
      }, update(cs, dt){ drawNotes(dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 11: PAINTING TOGETHER  (triggers at artstudio, pottery)
   ============================================================================ */
function csPaintingTogether(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.38, paulX = W * 0.62;

  // draw a simple easel at (cx, baseY)
  function drawEasel(cx, baseY, canvasContent){
    // legs
    ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 12, baseY); ctx.lineTo(cx - 6, baseY - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 12, baseY); ctx.lineTo(cx + 6, baseY - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, baseY + 2); ctx.lineTo(cx, baseY - 56); ctx.stroke();
    // shelf
    ctx.fillStyle = '#7a5a30'; ctx.fillRect(cx - 14, baseY - 36, 28, 3);
    // canvas
    ctx.fillStyle = '#faf6ee'; ctx.fillRect(cx - 13, baseY - 58, 26, 24);
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 0.8;
    ctx.strokeRect(cx - 13, baseY - 58, 26, 24);
    if (canvasContent) canvasContent(cx, baseY);
  }

  // Krystal's beautiful painting — a little landscape with a sun and flowers
  function drawKrystalPainting(cx, baseY){
    const px = cx - 13, py = baseY - 58;
    // sky
    ctx.fillStyle = '#87ceeb'; ctx.fillRect(px + 1, py + 1, 24, 10);
    // ground
    ctx.fillStyle = '#6aae4a'; ctx.fillRect(px + 1, py + 11, 24, 12);
    // sun
    ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.arc(px + 19, py + 5, 3, 0, 7); ctx.fill();
    // tiny flowers
    const cols = ['#ff6080','#ffa040','#c060e0'];
    for (let i = 0; i < 4; i++){
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.arc(px + 5 + i * 5, py + 16, 1.5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3a7a2a'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(px + 5 + i * 5, py + 17.5); ctx.lineTo(px + 5 + i * 5, py + 21); ctx.stroke();
    }
  }

  // Paul's terrible painting — a stick figure
  function drawPaulPainting(cx, baseY){
    const px = cx - 13, py = baseY - 58;
    // blank canvas with a wobbly stick figure
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    const mx = px + 13, my = py + 6;
    // head
    ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, 7); ctx.stroke();
    // body
    ctx.beginPath(); ctx.moveTo(mx, my + 2.5); ctx.lineTo(mx, my + 11); ctx.stroke();
    // arms (one droops)
    ctx.beginPath(); ctx.moveTo(mx - 5, my + 6); ctx.lineTo(mx, my + 5); ctx.lineTo(mx + 6, my + 8); ctx.stroke();
    // legs
    ctx.beginPath(); ctx.moveTo(mx, my + 11); ctx.lineTo(mx - 4, my + 17); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, my + 11); ctx.lineTo(mx + 4, my + 17); ctx.stroke();
  }

  function drawBg(cs){
    const t = cs.totalT;
    // warm studio interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f0e4d0'); wall.addColorStop(0.5, '#e8dac4'); wall.addColorStop(1, '#ddd0b8');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wooden floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#b8945a'); floor.addColorStop(1, '#a07e48');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 22){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // window on back wall — soft light coming in
    const winX = W * 0.50, winY = H * 0.10, winW = 36, winH = 28;
    ctx.fillStyle = '#c8e0f0'; ctx.fillRect(winX - winW / 2, winY, winW, winH);
    ctx.strokeStyle = '#a08060'; ctx.lineWidth = 2;
    ctx.strokeRect(winX - winW / 2, winY, winW, winH);
    ctx.beginPath(); ctx.moveTo(winX, winY); ctx.lineTo(winX, winY + winH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(winX - winW / 2, winY + winH / 2); ctx.lineTo(winX + winW / 2, winY + winH / 2); ctx.stroke();

    // light glow from window
    const glow = ctx.createRadialGradient(winX, winY + winH / 2, 4, winX, winY + winH / 2, 70);
    glow.addColorStop(0, 'rgba(255,248,220,.18)'); glow.addColorStop(1, 'rgba(255,248,220,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(winX, winY + winH / 2, 70, 0, 7); ctx.fill();

    // paint splotches on the floor
    const splats = ['#ff6080','#4080e0','#40c060','#ffa040','#c060e0'];
    for (let i = 0; i < 7; i++){
      ctx.fillStyle = splats[i % splats.length];
      ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.arc((i * 53 + 18) % W, groundY + 6 + (i * 11) % 14, 2 + (i % 3), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCharsExpr(exprK, exprP){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (exprP) csDrawExpression('paul', exprP, paulX, fY, charH);
    else csDrawChar('paul', paulX, fY, 'left', charH, 0);
  }

  return {
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Both painting side by side — think expression on Paul
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'think');
          drawEasel(krystalX + 24, fY - 4, null);
          drawEasel(paulX - 24, fY - 4, null);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'This is going to be a masterpiece.');
      }},
      // Step 2: Krystal peeks at Paul's canvas — laugh expression
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr('laugh', 'embarrassed');
          drawEasel(krystalX + 24, fY - 4, null);
          drawEasel(paulX - 24, fY - 4, drawPaulPainting);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', '*peeks over* ...what is that? \ud83d\ude02');
      }},
      // Step 3: Paul defends his art — embarrassed expression
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr('laugh', 'embarrassed');
          drawEasel(krystalX + 24, fY - 4, null);
          drawEasel(paulX - 24, fY - 4, drawPaulPainting);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', "It's abstract!");
      }},
      // Step 4: Krystal's gentle tease — laugh
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr('laugh', 'sad');
          drawEasel(krystalX + 24, fY - 4, null);
          drawEasel(paulX - 24, fY - 4, drawPaulPainting);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's... something \ud83d\ude02");
      }},
      // Step 5: Krystal reveals hers — Paul surprised, then cheer. Hearts.
      { dur: 2.8, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.5){
            drawCharsExpr('cheer', 'surprised');
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Now look at mine \u2728');
          } else {
            drawCharsExpr('cheer', 'cheer');
            csDrawBubble(paulX, fY - charH - 4, 'Paul', '...okay yours is way better.');
          }
          drawEasel(krystalX + 24, fY - 4, drawKrystalPainting);
          drawEasel(paulX - 24, fY - 4, drawPaulPainting);
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, paulX, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 12: HIDE AND SEEK  (triggers at hedgemaze, topiary, backyard)
   ============================================================================ */
function csHideAndSeek(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const lukeX = W * 0.50, williamX = W * 0.72, krystalX = W * 0.26;

  // draw a bush (hedge shrub) at (cx, baseY)
  function drawBush(cx, baseY, w, h){
    w = w || 36; h = h || 28;
    ctx.fillStyle = '#3a8a30';
    ctx.beginPath(); ctx.ellipse(cx, baseY - h * 0.4, w * 0.5, h * 0.5, 0, 0, 7); ctx.fill();
    // highlight
    ctx.fillStyle = '#4aa040';
    ctx.beginPath(); ctx.ellipse(cx - 4, baseY - h * 0.55, w * 0.25, h * 0.22, -0.3, 0, 7); ctx.fill();
    // leaf detail dots
    ctx.fillStyle = '#2e7a24';
    for (let i = 0; i < 5; i++){
      const lx = cx + Math.cos(i * 1.26) * w * 0.3;
      const ly = baseY - h * 0.4 + Math.sin(i * 1.8) * h * 0.28;
      ctx.beginPath(); ctx.arc(lx, ly, 1.5, 0, 7); ctx.fill();
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // bright garden sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#78c0e8'); sky.addColorStop(0.5, '#a0d8f0'); sky.addColorStop(1, '#d0eef0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // puffy clouds
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 4; i++){
      const cx = (i * W / 3.5 + 10 + Math.sin(t * 0.06 + i * 1.3) * 6);
      ctx.beginPath(); ctx.ellipse(cx, 18 + i * 8, 28 + i * 4, 9, 0, 0, 7); ctx.fill();
    }

    // grassy garden ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#5aaa3a'); gr.addColorStop(1, '#3a8a28');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // grass blades on top edge
    ctx.fillStyle = '#4a9a34';
    for (let x = 0; x < W; x += 5){
      const bh = 4 + Math.sin(x * 0.3 + t * 1.5) * 2;
      ctx.fillRect(x, groundY - bh, 2, bh);
    }

    // background hedges
    drawBush(W * 0.08, groundY + 2, 40, 32);
    drawBush(W * 0.92, groundY + 2, 44, 34);

    // fence in background
    ctx.fillStyle = '#c8a870';
    for (let i = 0; i < 8; i++){
      const fx = i * W / 7;
      ctx.fillRect(fx, groundY - 28, 3, 28);
    }
    ctx.fillRect(0, groundY - 20, W, 3);
    ctx.fillRect(0, groundY - 10, W, 3);
  }

  // the hiding bush (William hides behind this)
  const bushX = W * 0.72, bushBaseY = groundY + 4;

  function drawCharsStep1(cs){
    // Luke counting, facing away (up), others visible — scared (rushing to hide)
    csDrawChar('luke', lukeX, fY, 'up', charH, 0);
    csDrawExpression('william', 'scared', williamX, fY, charH * 0.95);
    csDrawExpression('krystal', 'scared', krystalX, fY, charH);
  }

  function drawCharsStep2(cs){
    // Luke still counting. William behind bush, Krystal behind left bush.
    csDrawChar('luke', lukeX, fY, 'up', charH, 0);
    csDrawChar('william', bushX, fY, 'down', charH * 0.95, 0);
    drawBush(bushX, bushBaseY, 42, 34);
    csDrawChar('krystal', W * 0.10, fY + 6, 'right', charH * 0.7, 0);
    drawBush(W * 0.10, bushBaseY, 38, 30);
  }

  function drawCharsStep3(cs){
    // Luke turned around, ready to seek — cheer expression
    csDrawExpression('luke', 'cheer', lukeX, fY, charH);
    csDrawChar('william', bushX, fY, 'down', charH * 0.95, 0);
    drawBush(bushX, bushBaseY, 42, 34);
    csDrawChar('krystal', W * 0.10, fY + 6, 'right', charH * 0.7, 0);
    drawBush(W * 0.10, bushBaseY, 38, 30);
  }

  function drawCharsStep4(cs){
    // Luke found William — cheer on Luke, embarrassed on William
    csDrawExpression('luke', 'cheer', bushX - 24, fY, charH);
    csDrawExpression('william', 'embarrassed', bushX + 8, fY, charH * 0.95);
    drawBush(bushX, bushBaseY, 42, 34);
    csDrawChar('krystal', W * 0.10, fY + 6, 'right', charH * 0.7, 0);
    drawBush(W * 0.10, bushBaseY, 38, 30);
  }

  function drawCharsStep5(cs){
    // Krystal jumps out — everyone laughing
    csDrawExpression('luke', 'laugh', W * 0.40, fY, charH);
    csDrawExpression('william', 'laugh', W * 0.55, fY, charH * 0.95);
    csDrawExpression('krystal', 'cheer', W * 0.26, fY, charH);
    drawBush(bushX, bushBaseY, 42, 34);
    drawBush(W * 0.10, bushBaseY, 38, 30);
  }

  return {
    chars: ['krystal', 'luke', 'william'],
    skipable: true,
    steps: [
      // Step 1: Luke counting against fence, others scattering
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsStep1(cs);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', '...eight, nine, ten!');
      }},
      // Step 2: William ducks behind bush, Krystal hides too
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsStep2(cs);
          csDrawBubble(krystalX, fY + 6 - charH * 0.7 - 4, 'Krystal', '*shh, shh!* \ud83e\udd2d');
      }},
      // Step 3: Luke turns around — ready or not!
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsStep3(cs);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Ready or not, here I come!');
      }},
      // Step 4: Luke walks right to William's bush. Found!
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsStep4(cs);
          if (cs.stepT < 1.3){
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Found you!');
          } else {
            csDrawBubble(bushX + 8, fY - charH * 0.95 - 4, 'William', 'Aw man!');
          }
      }},
      // Step 5: Krystal jumps out triumphantly. Everyone laughs.
      { dur: 3.0, draw(cs){
          drawBg(cs); drawCharsStep5(cs);
          if (cs.stepT < 1.6){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "You'll never find me! \ud83d\ude04");
          } else {
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', "You gave yourself up! \ud83d\ude02");
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, lukeX, fY - charH * 0.7, 3);
          csHearts(cs, williamX, fY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 13: TEA PARTY  (triggers at teahouse, bambootearoom, cafe)
   ============================================================================ */
function csTeaParty(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.28, lunaX = W * 0.50, wadeX = W * 0.72;

  // tea spill particle state
  let splashDrops = [];
  function spawnSplash(cx, cy, n){
    for (let i = 0; i < n; i++){
      splashDrops.push({
        x: cx + rand(-4, 4), y: cy,
        vx: rand(-18, 18), vy: rand(-30, -10),
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.6 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 1.2
      });
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // warm tearoom interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#e8d8c4'); wall.addColorStop(0.5, '#f0e4d4'); wall.addColorStop(1, '#e0d0b8');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wainscoting / lower wall panel
    ctx.fillStyle = '#c8a878';
    ctx.fillRect(0, groundY - 30, W, 30);
    ctx.strokeStyle = '#b89868'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY - 30); ctx.lineTo(W, groundY - 30); ctx.stroke();

    // decorative shelf with teapots on back wall
    ctx.fillStyle = '#b08858'; ctx.fillRect(W * 0.10, H * 0.14, W * 0.30, 3);
    // tiny teapots on shelf
    const potCols = ['#e0a0a0','#a0c0e0','#c0e0a0'];
    for (let i = 0; i < 3; i++){
      const px = W * 0.14 + i * W * 0.10;
      ctx.fillStyle = potCols[i];
      ctx.beginPath(); ctx.ellipse(px, H * 0.12, 5, 4, 0, 0, 7); ctx.fill();
      // spout
      ctx.strokeStyle = potCols[i]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px + 5, H * 0.11); ctx.lineTo(px + 8, H * 0.09); ctx.stroke();
      // handle
      ctx.beginPath(); ctx.arc(px - 6, H * 0.12, 3, -1, 1); ctx.stroke();
    }

    // floor — elegant wood
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#a0845a'); floor.addColorStop(1, '#8a704a');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // hanging lantern / soft light
    const lanternX = W * 0.50, lanternY = H * 0.06;
    ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lanternX, 0); ctx.lineTo(lanternX, lanternY); ctx.stroke();
    ctx.fillStyle = '#f0dcc0';
    ctx.beginPath(); ctx.ellipse(lanternX, lanternY + 4, 6, 5, 0, 0, 7); ctx.fill();
    const glow = ctx.createRadialGradient(lanternX, lanternY + 4, 2, lanternX, lanternY + 4, 50);
    glow.addColorStop(0, 'rgba(255,240,200,.16)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lanternX, lanternY + 4, 50, 0, 7); ctx.fill();
  }

  // draw the tea table
  const tableX = W * 0.50, tableY = fY - charH * 0.30;
  function drawTable(){
    // tabletop — oval
    ctx.fillStyle = '#c09060';
    ctx.beginPath(); ctx.ellipse(tableX, tableY, 52, 10, 0, 0, 7); ctx.fill();
    // table edge
    ctx.fillStyle = '#a07848';
    ctx.fillRect(tableX - 52, tableY, 104, 4);
    // legs
    ctx.fillStyle = '#906838'; ctx.lineWidth = 1;
    ctx.fillRect(tableX - 40, tableY + 4, 3, 16);
    ctx.fillRect(tableX + 37, tableY + 4, 3, 16);
  }

  // draw a teacup at (cx, cy) — tiny fancy cup with saucer
  function drawTeacup(cx, cy, spilled){
    if (spilled){
      // tipped over cup
      ctx.fillStyle = '#f0e8d8';
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(1.2);
      ctx.beginPath(); ctx.ellipse(0, 0, 4, 3, 0, 0, 7); ctx.fill();
      ctx.restore();
      // spill puddle
      ctx.fillStyle = 'rgba(180,140,80,.35)';
      ctx.beginPath(); ctx.ellipse(cx + 6, cy + 2, 8, 3, 0.2, 0, 7); ctx.fill();
    } else {
      // saucer
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath(); ctx.ellipse(cx, cy + 1, 6, 2, 0, 0, 7); ctx.fill();
      // cup body
      ctx.fillStyle = '#f0e8d8';
      ctx.fillRect(cx - 3, cy - 5, 6, 5);
      // tea inside
      ctx.fillStyle = '#c8a060';
      ctx.fillRect(cx - 2, cy - 4, 4, 2);
      // tiny handle
      ctx.strokeStyle = '#d0c8b0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx + 4, cy - 3, 2, -1.2, 1.2); ctx.stroke();
      // steam wisps
      ctx.strokeStyle = 'rgba(200,200,200,.3)'; ctx.lineWidth = 0.6;
      for (let i = 0; i < 2; i++){
        const sx = cx - 1 + i * 2;
        ctx.beginPath();
        ctx.moveTo(sx, cy - 6);
        ctx.quadraticCurveTo(sx + (i === 0 ? -2 : 2), cy - 10, sx, cy - 13);
        ctx.stroke();
      }
    }
  }

  // napkin prop
  function drawNapkin(cx, cy){
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(cx - 5, cy - 2, 10, 5);
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - 5, cy - 2, 10, 5);
    // lace edge
    ctx.strokeStyle = 'rgba(180,160,140,.3)';
    ctx.setLineDash([1, 1]);
    ctx.strokeRect(cx - 4, cy - 1, 8, 3);
    ctx.setLineDash([]);
  }

  function drawSplash(dt){
    for (let i = splashDrops.length - 1; i >= 0; i--){
      const d = splashDrops[i];
      d.x += d.vx * dt; d.y += d.vy * dt;
      d.vy += 60 * dt; // gravity
      d.life -= dt;
      if (d.life <= 0){ splashDrops.splice(i, 1); continue; }
      const a = Math.min(1, d.life / d.maxLife * 2);
      ctx.fillStyle = `rgba(180,140,80,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, 7); ctx.fill();
    }
  }

  function drawCharsExpr(exprK, exprL, exprW){
    if (exprK) csDrawExpression('krystal', exprK, krystalX, fY, charH);
    else csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
    if (exprL) csDrawExpression('luna', exprL, lunaX, fY, charH * 0.9);
    else csDrawChar('luna', lunaX, fY, 'down', charH * 0.9, 0);
    if (exprW) csDrawExpression('wade', exprW, wadeX, fY, charH * 0.95);
    else csDrawChar('wade', wadeX, fY, 'left', charH * 0.95, 0);
  }

  return {
    chars: ['krystal', 'luna', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Everyone sipping tea — cheer expression on Luna
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'cheer', null); drawTable();
          drawTeacup(krystalX + 16, tableY - 4, false);
          drawTeacup(lunaX, tableY - 4, false);
          drawTeacup(wadeX - 16, tableY - 4, false);
          drawSplash(0);
          csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', 'Pinkies UP, everyone! \ud83e\udeb7');
      }, update(cs, dt){ drawSplash(dt); }},
      // Step 2: They sip — nice and fancy — cheer on Krystal
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr('cheer', 'cheer', null); drawTable();
          drawTeacup(krystalX + 16, tableY - 4, false);
          drawTeacup(lunaX, tableY - 4, false);
          drawTeacup(wadeX - 16, tableY - 4, false);
          drawSplash(0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Oh this is lovely \u2615');
      }, update(cs, dt){ drawSplash(dt); }},
      // Step 3: Wade spills his tea — embarrassed Wade, surprised Luna
      { dur: 2.5, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.3){
            drawCharsExpr('surprised', null, 'embarrassed');
          } else {
            drawCharsExpr('surprised', 'surprised', 'embarrassed');
          }
          drawTable();
          drawTeacup(krystalX + 16, tableY - 4, false);
          drawTeacup(lunaX, tableY - 4, false);
          drawTeacup(wadeX - 16, tableY - 4, true);
          drawSplash(0);
          if (cs.stepT < 1.3){
            csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'Oops...');
          } else {
            csDrawBubble(lunaX, fY - charH * 0.9 - 4, 'Luna', '*GASP!* The tea! \ud83d\ude31');
          }
      }, onStart(cs){
          spawnSplash(wadeX - 10, tableY - 4, 8);
      }, update(cs, dt){ drawSplash(dt); }},
      // Step 4: Krystal saves it — cheer on Krystal, relieved Wade
      { dur: 3.0, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.5){
            drawCharsExpr('cheer', 'laugh', 'sad');
          } else {
            drawCharsExpr('laugh', 'laugh', 'cheer');
          }
          drawTable();
          drawTeacup(krystalX + 16, tableY - 4, false);
          drawTeacup(lunaX, tableY - 4, false);
          drawTeacup(wadeX - 16, tableY - 4, true);
          drawNapkin(wadeX - 8, tableY - 2);
          drawSplash(0);
          if (cs.stepT < 1.5){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'No tea left behind! \ud83d\udcaa');
          } else {
            csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'My hero!');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, lunaX, fY - charH * 0.6, 3);
          csHearts(cs, wadeX, fY - charH * 0.6, 4);
      }, update(cs, dt){ drawSplash(dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE REGISTRY  —  map scene names to cutscene factory functions
   ============================================================================ */
const CUTSCENE_MAP = {
  campsite:          [csCampfireStory],
  starrymeadow:      [csStargazing],
  observatory:       [csStargazing],
  beach:             [csBeachSunsetPicnic],
  moonbeach:         [csBeachSunsetPicnic],
  bakery:            [csBakeryMishap],
  gingerbreadkitchen:[csBakeryMishap],
  library:           [csLibraryGhost],
  arcanelibrary:     [csLibraryGhost],
  aquarium:          [csAquariumWonder],
  aquariumtunnel:    [csAquariumWonder],
  rainystreet:       [csRainyDayChat],
  florist:           [csFlowerCrown],
  cherryblossom:     [csFlowerCrown],
  lavender:          [csFlowerCrown],
  peonygarden:       [csFlowerCrown],
  snowycabin:        [csSnowAngelContest],
  icepond:           [csSnowAngelContest],
  frozenfalls:       [csSnowAngelContest],
  musicroom:         [csMusicJam],
  recordshop:        [csMusicJam],
  jazzclub:          [csMusicJam],
  artstudio:         [csPaintingTogether],
  pottery:           [csPaintingTogether],
  hedgemaze:         [csHideAndSeek],
  topiary:           [csHideAndSeek],
  backyard:          [csHideAndSeek],
  teahouse:          [csTeaParty],
  bambootearoom:     [csTeaParty],
  cafe:              [csTeaParty],
};

/* ============================================================================
   RANDOM TRIGGER SYSTEM
   ============================================================================ */
let csTriggerTimer = 30 + Math.random() * 30;
function resetCsTrigger(){ csTriggerTimer = 30 + Math.random() * 30; }

// Debug: force-trigger a cutscene for the current scene (press X)
function forceCutscene(){
  if (cutscene || birthday) return;
  const scene = SCENES[currentScene];
  const defs = CUTSCENE_MAP[scene];
  if (!defs || !defs.length) {
    if (typeof say === 'function') say('(no cutscene for this scene)');
    return;
  }
  const factory = defs[Math.floor(Math.random() * defs.length)];
  startCutscene(factory());
}

(function csTriggerSystem(){
  EXTRA_UPDATERS.push(function csRandomTrigger(dt){
    if (cutscene || birthday) return;
    csTriggerTimer -= dt;
    if (csTriggerTimer > 0) return;
    csTriggerTimer = 30 + Math.random() * 30;   // reset to 30-60 seconds

    // don't trigger if pet is busy
    if (pet.animLock > 0 || pet.resting || isCrying()) return;

    // check if current scene has cutscenes
    const scene = SCENES[currentScene];
    const defs = CUTSCENE_MAP[scene];
    if (!defs || !defs.length) return;

    // 15% chance
    if (Math.random() > 0.15) return;

    // pick a random cutscene for this scene and start it
    const factory = defs[Math.floor(Math.random() * defs.length)];
    startCutscene(factory());
  });
})();

/* ============================================================================
   HOOK INTO EXISTING LOOP  (via EXTRA_* arrays — no core edits needed)
   ============================================================================ */
// The cutscene takeover is handled by direct checks in loop.js, birthday.js,
// and pet.js. These are added below after the cutscene engine is defined.

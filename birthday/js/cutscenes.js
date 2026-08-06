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
const EXPR_LIST = ['beckon','carry','cheer','crouch','doorway','embarrassed','give','highfive','hug','inspect','interact','laugh','look','nod','point','pull','push','run','sad','scared','search','shake','shrug','sit','sleep','sneak','startled','surprised','talk','think','trip','wave'];
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

/* ---- seen-cutscene tracking (persisted) ---- */
let seenCutscenes = (function(){ try{ const r = localStorage.getItem('bpet_cutscenes_seen'); if (r) return JSON.parse(r); } catch(e){} return {}; })();
function saveSeenCutscenes(){ try{ localStorage.setItem('bpet_cutscenes_seen', JSON.stringify(seenCutscenes)); }catch(e){} }

/* ---- lifecycle ---- */
function startCutscene(def){
  if (cutscene || birthday) return;
  // pre-load sprites we'll need (walk + expressions)
  if (def.chars) def.chars.forEach(n => { csLoadSprite(n); csLoadExpressions(n); });
  // record in seen log
  if (def.id && !seenCutscenes[def.id]){
    seenCutscenes[def.id] = Date.now();
    saveSeenCutscenes();
  }
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
  // delegate to step-level onTap if it exists (interactive cutscenes)
  if (cutscene.phase === 'running' && cutscene.stepIdx < cutscene.steps.length){
    const step = cutscene.steps[cutscene.stepIdx];
    if (step.onTap) step.onTap(cutscene, px, py);
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
    id: 'campfire_story',
    chars: ['krystal', 'paul', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Everyone sitting. Paul speaks.
      { dur: 2.5, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'talk', paul.x, paul.feetY, charH);
          csDrawChar('krystal', krystal.x, krystal.feetY, 'left', charH, 0);
          csDrawChar('luna', luna.x, luna.feetY, 'down', charH * 0.9, 0);
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
          drawBg(cs);
          csDrawExpression('paul', 'talk', paul.x, paul.feetY, charH);
          csDrawChar('krystal', krystal.x, krystal.feetY, 'left', charH, 0);
          csDrawChar('luna', luna.x, luna.feetY, 'down', charH * 0.9, 0);
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
    id: 'stargazing',
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
      // Step 3: Paul points at a star. Shooting star crosses.
      { dur: 2.5, draw(cs){
          drawBg(cs);
          // blanket
          ctx.fillStyle = '#6e4a7a'; roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
          ctx.fillStyle = '#8a5e9a'; roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const lx = blanketX - 44 + i * 22; ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke(); }
          csDrawExpression('paul', 'point', paulX, blanketY - 2, charH * 0.85);
          csDrawChar('krystal', krystalX, blanketY - 2, 'up', charH * 0.85, 0);
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
          drawBg(cs);
          ctx.fillStyle = '#6e4a7a'; roundRect(blanketX - 56, blanketY - 4, 112, 18, 4); ctx.fill();
          ctx.fillStyle = '#8a5e9a'; roundRect(blanketX - 52, blanketY - 2, 104, 14, 3); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++){ const lx = blanketX - 44 + i * 22; ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 12); ctx.stroke(); }
          csDrawExpression('paul', 'talk', paulX, blanketY - 2, charH * 0.85);
          csDrawChar('krystal', krystalX, blanketY - 2, 'up', charH * 0.85, 0);
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
    id: 'beach_sunset_picnic',
    chars: ['krystal', 'paul', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Quiet scene — golden hour, everyone on the blanket — talk expression on Krystal
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawExpression('krystal', 'talk', krystal.x, krystal.feetY, charH);
          csDrawChar('wade',    wade.x,    wade.feetY,    'left',  charH * 0.95, 0);
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', "This sunset is so pretty...");
      }},
      // Step 2: Wade breaks the peace — talk expression
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,    paul.feetY,    'right', charH, 0);
          csDrawChar('krystal', krystal.x, krystal.feetY, 'down',  charH, 0);
          csDrawExpression('wade', 'talk', wade.x, wade.feetY, charH * 0.95);
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
          csDrawExpression('wade', 'nod', wade.x, wade.feetY, charH * 0.95);
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
    id: 'bakery_mishap',
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
    id: 'library_ghost',
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
      // Step 4: Ghost orb drifts across — William scared, hides behind Krystal, then shakes head in denial
      { dur: 2.5, draw(cs){
          drawBg(cs); drawGhostOrb(cs); drawFallingBook(cs);
          if (cs.stepT < 0.8){
            drawChars(true, 'surprised', 'scared');
          } else {
            drawChars(true, 'surprised', 'shake');
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
    id: 'aquarium_wonder',
    chars: ['krystal', 'luke'],
    skipable: true,
    steps: [
      // Step 1: Both watching fish — point expression on Krystal
      { dur: 2.5, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars('point', null);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Look at all the fish! 🐠");
      }},
      // Step 2: Luke spots a jellyfish — point expression
      { dur: 2.5, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars(null, 'point');
          csDrawBubble(lukeX, fY - charH * 0.95 - 4, 'Luke', "Whoa, a jellyfish! Look!");
      }},
      // Step 3: Krystal is amazed — inspect expression (looking closely)
      { dur: 2.0, draw(cs){
          drawBg(cs); drawJellies(cs); drawChars('inspect', 'cheer');
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
    id: 'rainy_day_chat',
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
      // Step 2: Paul speaks — talk expression
      { dur: 2.5, draw(cs){
          drawBg(cs); drawCharsExpr(false, 'talk', null);
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
    id: 'flower_crown',
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
      // Step 4: Wade wants one — talk expression
      { dur: 2.0, draw(cs){
          drawBg(cs); drawCharsExpr(true, false, 'cheer', null, 'talk'); drawPetals(0);
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
    id: 'snow_angel_contest',
    chars: ['krystal', 'paul', 'william'],
    skipable: true,
    steps: [
      // Step 1: Fresh snow, everyone excited — William talks, Krystal cheers
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false, 'cheer', null, 'talk');
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
      // Step 5: William proud — nod expression (self-assured), everyone warm
      { dur: 2.5, draw(cs){
          drawBg(cs);
          drawSnowAngel(williamX, groundY + 14, 'perfect');
          drawSnowAngel(paulX, groundY + 16, 'messy');
          csDrawExpression('krystal', 'cheer', paulX - 20, fY, charH);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawExpression('william', 'nod', williamX, fY, charH * 0.95);
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
    id: 'music_jam',
    chars: ['krystal', 'paul', 'luke', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Everyone picking up instruments — beckon expression on Paul
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'beckon', null, null); drawInstruments(cs); drawNotes(0);
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
    id: 'painting_together',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Both painting side by side — talk expression on Paul
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'talk');
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
      // Step 3: Paul defends his art — shake expression (defensive)
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr('laugh', 'shake');
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
    // Luke turned around, ready to seek — search expression
    csDrawExpression('luke', 'search', lukeX, fY, charH);
    csDrawChar('william', bushX, fY, 'down', charH * 0.95, 0);
    drawBush(bushX, bushBaseY, 42, 34);
    csDrawChar('krystal', W * 0.10, fY + 6, 'right', charH * 0.7, 0);
    drawBush(W * 0.10, bushBaseY, 38, 30);
  }

  function drawCharsStep4(cs){
    // Luke found William — point on Luke, embarrassed on William
    csDrawExpression('luke', 'point', bushX - 24, fY, charH);
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
    id: 'hide_and_seek',
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
    id: 'tea_party',
    chars: ['krystal', 'luna', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Everyone sipping tea — talk expression on Luna
      { dur: 2.2, draw(cs){
          drawBg(cs); drawCharsExpr(null, 'talk', null); drawTable();
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
   CUTSCENE 14: SUNSET BALLOON RIDE  (triggers at balloonride, balloonfest, kitehill)
   ============================================================================ */
function csSunsetBalloonRide(){
  const groundY = H * 0.78;
  const charH = 80;
  const fY = groundY - 10;  // they're in a basket, floating above the fields
  const basketX = W * 0.50;
  const krystalX = basketX - 18, paulX = basketX + 18;

  function drawBg(cs){
    const t = cs.totalT;
    // sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#2a1a48'); sky.addColorStop(0.25, '#8a3060'); sky.addColorStop(0.5, '#e07040');
    sky.addColorStop(0.75, '#f0a848'); sky.addColorStop(1, '#f8d888');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun — low on the horizon
    const sunX = W * 0.75, sunY = groundY - 10;
    const sg = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 50);
    sg.addColorStop(0, 'rgba(255,220,120,.9)'); sg.addColorStop(0.4, 'rgba(255,180,80,.4)');
    sg.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 50, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.arc(sunX, sunY, 14, 0, 7); ctx.fill();

    // wispy clouds
    ctx.fillStyle = 'rgba(255,200,160,.25)';
    ctx.beginPath(); ctx.ellipse(W * 0.20, H * 0.18, 40, 8, 0.1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.65, H * 0.10, 30, 6, -0.1, 0, 7); ctx.fill();

    // patchwork fields below
    const fieldCols = ['#6a9a40','#8ab050','#a0b860','#78a838','#90b048','#7aaa48'];
    const rows = 4, cols = 6;
    const fy0 = groundY;
    const fh = (H - groundY) / rows;
    const fw = W / cols;
    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        ctx.fillStyle = fieldCols[(r * cols + c) % fieldCols.length];
        ctx.fillRect(c * fw, fy0 + r * fh, fw + 1, fh + 1);
      }
    }
    // field borders
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++){
      ctx.beginPath(); ctx.moveTo(0, fy0 + r * fh); ctx.lineTo(W, fy0 + r * fh); ctx.stroke();
    }
    for (let c = 0; c <= cols; c++){
      ctx.beginPath(); ctx.moveTo(c * fw, fy0); ctx.lineTo(c * fw, H); ctx.stroke();
    }

    // tiny house in the fields
    const hx = W * 0.30, hy = groundY + (H - groundY) * 0.4;
    ctx.fillStyle = '#d8c0a0'; ctx.fillRect(hx - 4, hy - 5, 8, 5);
    ctx.fillStyle = '#a05030';
    ctx.beginPath(); ctx.moveTo(hx - 5, hy - 5); ctx.lineTo(hx, hy - 10); ctx.lineTo(hx + 5, hy - 5); ctx.closePath(); ctx.fill();

    // distant birds
    ctx.strokeStyle = 'rgba(60,30,20,.3)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++){
      const bx = W * 0.10 + i * W * 0.18 + Math.sin(t + i * 2) * 5;
      const by = H * 0.14 + (i % 2) * H * 0.06;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by + 1); ctx.quadraticCurveTo(bx - 1, by - 2, bx, by);
      ctx.quadraticCurveTo(bx + 1, by - 2, bx + 4, by + 1);
      ctx.stroke();
    }
  }

  function drawBalloon(cs){
    const t = cs.totalT;
    const sway = Math.sin(t * 0.8) * 3;
    const bx = basketX + sway;
    const envelopeY = fY - charH - 50;

    // ropes from basket to envelope
    ctx.strokeStyle = '#8a7050'; ctx.lineWidth = 0.8;
    const basketTop = fY - charH * 0.6;
    ctx.beginPath(); ctx.moveTo(bx - 22, basketTop); ctx.lineTo(bx - 14, envelopeY + 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 22, basketTop); ctx.lineTo(bx + 14, envelopeY + 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 22, basketTop); ctx.lineTo(bx + 14, envelopeY + 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 22, basketTop); ctx.lineTo(bx - 14, envelopeY + 30); ctx.stroke();

    // envelope (the balloon itself)
    const envR = 36;
    ctx.fillStyle = '#d04040';
    ctx.beginPath(); ctx.ellipse(bx, envelopeY, envR, envR * 1.2, 0, 0, 7); ctx.fill();
    // stripe
    ctx.fillStyle = '#e8a020';
    ctx.beginPath(); ctx.ellipse(bx, envelopeY, envR, envR * 1.2, 0, -0.4, 0.4); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx, envelopeY, envR, envR * 1.2, 0, Math.PI - 0.4, Math.PI + 0.4); ctx.fill();
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.beginPath(); ctx.ellipse(bx - 10, envelopeY - 8, 10, 18, -0.2, 0, 7); ctx.fill();

    // burner glow
    const burnerFlicker = 0.7 + 0.3 * Math.sin(t * 12);
    const bg = ctx.createRadialGradient(bx, envelopeY + envR * 1.2 + 2, 1, bx, envelopeY + envR * 1.2 + 2, 8);
    bg.addColorStop(0, `rgba(255,180,60,${(0.5 * burnerFlicker).toFixed(2)})`);
    bg.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, envelopeY + envR * 1.2 + 2, 8, 0, 7); ctx.fill();

    // basket
    ctx.fillStyle = '#a08050';
    ctx.fillRect(bx - 24, basketTop, 48, 16);
    ctx.strokeStyle = '#806030'; ctx.lineWidth = 0.6;
    for (let i = 0; i < 4; i++){
      ctx.beginPath(); ctx.moveTo(bx - 24 + i * 16, basketTop); ctx.lineTo(bx - 24 + i * 16, basketTop + 16); ctx.stroke();
    }
    ctx.strokeStyle = '#806030'; ctx.lineWidth = 1;
    ctx.strokeRect(bx - 24, basketTop, 48, 16);
  }

  return {
    id: 'sunset_balloon_ride',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Rising up — Krystal cheers at the view
      { dur: 2.5, draw(cs){
          drawBg(cs);
          drawBalloon(cs);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawChar('paul', paulX, fY, 'left', charH, 0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'We\'re so high up! Look at everything! ✨');
      }},
      // Step 2: Paul points out their house — Krystal surprised
      { dur: 2.5, draw(cs){
          drawBg(cs);
          drawBalloon(cs);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('paul', 'point', paulX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Look — I can see our house from here! 🏠');
      }},
      // Step 3: Krystal spots the fields — point expression
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawBalloon(cs);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'The fields look like a quilt! 💛');
      }},
      // Step 4: Romantic moment — she leans on him. Hearts.
      { dur: 3.5, draw(cs){
          drawBg(cs);
          drawBalloon(cs);
          // Draw them close together
          csDrawChar('paul', paulX - 6, fY, 'left', charH, 0);
          csDrawChar('krystal', krystalX + 8, fY, 'right', charH, 0);
          if (cs.stepT < 2.0){
            csDrawBubble(krystalX + 8, fY - charH - 4, 'Krystal', 'This is perfect...');
          } else {
            csDrawBubble(paulX - 6, fY - charH - 4, 'Paul', 'Yeah... it really is 💕');
          }
      }, onStart(cs){
          csHearts(cs, basketX, fY - charH * 0.7, 8);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 15: COOKING DISASTER  (triggers at diner, dumplinghouse, ramenshop)
   ============================================================================ */
function csCookingDisaster(){
  const groundY = H * 0.68;
  const charH = 80;
  const fY = groundY + 14;
  const krystalX = W * 0.22, wadeX = W * 0.50, williamX = W * 0.78;

  // spice cloud particle state
  let spiceParticles = [];
  function spawnSpice(cx, cy, n){
    for (let i = 0; i < n; i++){
      spiceParticles.push({
        x: cx + rand(-6, 6), y: cy,
        vx: rand(-20, 20), vy: rand(-40, -15),
        life: 0.8 + Math.random() * 0.6,
        maxLife: 0.8 + Math.random() * 0.6,
        size: 1.5 + Math.random() * 2,
        col: Math.random() < 0.5 ? '#c03020' : '#d04828'
      });
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // kitchen wall
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f0e8d8'); wall.addColorStop(0.6, '#e8dcc8'); wall.addColorStop(1, '#d8ccb0');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // tile backsplash (upper wall)
    ctx.fillStyle = '#e0d8c8';
    for (let r = 0; r < 3; r++){
      for (let c = 0; c < Math.ceil(W / 14) + 1; c++){
        const tx = c * 14 + (r % 2) * 7;
        const ty = H * 0.06 + r * 14;
        ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(tx, ty, 13, 13);
      }
    }

    // shelf with spice jars
    ctx.fillStyle = '#b89868'; ctx.fillRect(W * 0.60, H * 0.08, W * 0.32, 3);
    const jarCols = ['#c03020','#e08020','#d04828','#a02818'];
    for (let i = 0; i < 4; i++){
      const jx = W * 0.64 + i * W * 0.08;
      ctx.fillStyle = jarCols[i];
      ctx.fillRect(jx - 3, H * 0.02, 6, 6);  // jar body
      ctx.fillStyle = '#d0c0a0';
      ctx.fillRect(jx - 3, H * 0.02, 6, 1.5);  // lid
    }

    // kitchen counter (long)
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(0, groundY - 10, W, 10);
    ctx.fillStyle = '#a08060';
    ctx.fillRect(0, groundY, W, 4);

    // floor — kitchen tile
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#c0a880'); floor.addColorStop(1, '#a89068');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 18){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // hanging lamp
    const lampX = W * 0.50;
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lampX, 0); ctx.lineTo(lampX, H * 0.04); ctx.stroke();
    ctx.fillStyle = '#f0dcc0';
    ctx.beginPath(); ctx.ellipse(lampX, H * 0.06, 8, 5, 0, 0, 7); ctx.fill();
    const glow = ctx.createRadialGradient(lampX, H * 0.06, 2, lampX, H * 0.06, 55);
    glow.addColorStop(0, 'rgba(255,240,200,.14)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lampX, H * 0.06, 55, 0, 7); ctx.fill();
  }

  // draw a big pot on the counter
  const potX = W * 0.50, potY = groundY - 10;
  function drawPot(cs, steaming){
    // pot body
    ctx.fillStyle = '#606060';
    ctx.fillRect(potX - 16, potY - 18, 32, 18);
    // rim
    ctx.fillStyle = '#505050';
    ctx.fillRect(potX - 18, potY - 18, 36, 3);
    // handles
    ctx.fillStyle = '#484848';
    ctx.fillRect(potX - 22, potY - 14, 5, 3);
    ctx.fillRect(potX + 17, potY - 14, 5, 3);
    // contents
    ctx.fillStyle = steaming ? '#c06030' : '#d09050';
    ctx.fillRect(potX - 14, potY - 16, 28, 5);

    // steam
    if (steaming){
      const t = cs.totalT;
      ctx.strokeStyle = 'rgba(200,200,200,.25)'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++){
        const sx = potX - 8 + i * 8;
        const drift = Math.sin(t * 3 + i * 2) * 3;
        ctx.beginPath();
        ctx.moveTo(sx, potY - 20);
        ctx.quadraticCurveTo(sx + drift, potY - 28, sx - drift, potY - 36);
        ctx.stroke();
      }
    }
  }

  // draw a spice shaker
  function drawSpiceShaker(cx, cy, tilted){
    ctx.save();
    if (tilted){
      ctx.translate(cx, cy);
      ctx.rotate(-0.8);
      ctx.translate(-cx, -cy);
    }
    ctx.fillStyle = '#c03020'; ctx.fillRect(cx - 3, cy - 10, 6, 10);
    ctx.fillStyle = '#d0c0a0'; ctx.fillRect(cx - 3, cy - 10, 6, 2);
    // dots on lid
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 1, cy - 9.5, 1, 1);
    ctx.fillRect(cx + 1, cy - 9.5, 1, 1);
    ctx.restore();
  }

  function drawSpiceCloud(dt){
    for (let i = spiceParticles.length - 1; i >= 0; i--){
      const p = spiceParticles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 30 * dt;
      p.life -= dt;
      if (p.life <= 0){ spiceParticles.splice(i, 1); continue; }
      const a = Math.min(1, p.life / p.maxLife * 2);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = a * 0.7;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // red haze for the spice cloud lingering
  function drawSpiceHaze(cs){
    if (cs.stepIdx >= 2){
      const intensity = Math.min(0.08, (cs.stepIdx === 2 ? cs.stepT * 0.04 : 0.08));
      ctx.fillStyle = `rgba(200,60,30,${intensity.toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  return {
    id: 'cooking_disaster',
    chars: ['krystal', 'wade', 'william'],
    skipable: true,
    steps: [
      // Step 1: Cooking together — Wade near the pot
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('wade', 'talk', wadeX, fY, charH * 0.95);
          csDrawChar('william', williamX, fY, 'left', charH, 0);
          drawPot(cs, true);
          drawSpiceShaker(wadeX + 24, potY - 6, false);
          drawSpiceCloud(0);
          csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'Needs more spice! 🌶️');
      }, update(cs, dt){ drawSpiceCloud(dt); }},
      // Step 2: Wade dumps the WHOLE shaker — spice cloud!
      { dur: 2.5, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('wade', 'embarrassed', wadeX, fY, charH * 0.95);
          csDrawChar('william', williamX, fY, 'left', charH, 0);
          drawPot(cs, true);
          drawSpiceShaker(potX + 2, potY - 14, true);
          drawSpiceCloud(0);
          drawSpiceHaze(cs);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'WADE that was the WHOLE bottle! 😱');
      }, onStart(cs){
          spawnSpice(potX, potY - 20, 14);
      }, update(cs, dt){ drawSpiceCloud(dt); }},
      // Step 3: William tastes it — scared then surprised
      { dur: 2.8, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('wade', 'embarrassed', wadeX, fY, charH * 0.95);
          drawPot(cs, true);
          drawSpiceCloud(0);
          drawSpiceHaze(cs);
          if (cs.stepT < 1.4){
            csDrawExpression('william', 'scared', williamX, fY, charH);
            csDrawBubble(williamX, fY - charH - 4, 'William', '...!!! 🥵🥵🥵');
          } else {
            csDrawExpression('william', 'surprised', williamX, fY, charH);
            // everyone's eyes watering — draw tear drops
            ctx.fillStyle = 'rgba(100,160,255,.5)';
            ctx.beginPath(); ctx.arc(krystalX + 6, fY - charH * 0.55, 1.5, 0, 7); ctx.fill();
            ctx.beginPath(); ctx.arc(wadeX + 5, fY - charH * 0.50, 1.5, 0, 7); ctx.fill();
            ctx.beginPath(); ctx.arc(williamX + 6, fY - charH * 0.55, 1.5, 0, 7); ctx.fill();
            csDrawExpression('krystal', 'sad', krystalX, fY, charH);
            csDrawBubble(williamX, fY - charH - 4, 'William', 'MY TONGUE 😭');
          }
      }, update(cs, dt){ drawSpiceCloud(dt); }},
      // Step 4: Krystal calls for pizza — everyone laughing
      { dur: 3.0, draw(cs){
          drawBg(cs);
          drawPot(cs, true);
          drawSpiceCloud(0);
          drawSpiceHaze(cs);
          if (cs.stepT < 1.5){
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('wade', 'laugh', wadeX, fY, charH * 0.95);
            csDrawExpression('william', 'laugh', williamX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'We\'re ordering pizza 😂');
          } else {
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('wade', 'cheer', wadeX, fY, charH * 0.95);
            csDrawExpression('william', 'cheer', williamX, fY, charH);
            csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'Extra cheese please! 🍕');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, wadeX, fY - charH * 0.6, 3);
          csHearts(cs, williamX, fY - charH * 0.7, 4);
      }, update(cs, dt){ drawSpiceCloud(dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 16: TIDE POOL DISCOVERY  (triggers at tidepools, coralreef)
   ============================================================================ */
function csTidePoolDiscovery(){
  const groundY = H * 0.65;
  const charH = 80;
  const fY = groundY + 20;
  const krystalX = W * 0.25, lukeX = W * 0.50, lunaX = W * 0.75;

  function drawBg(cs){
    const t = cs.totalT;
    // soft blue sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY * 0.6);
    sky.addColorStop(0, '#88c8e8'); sky.addColorStop(0.5, '#a8d8f0'); sky.addColorStop(1, '#c8e4f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY * 0.6);

    // ocean horizon
    const ocean = ctx.createLinearGradient(0, groundY * 0.6, 0, groundY);
    ocean.addColorStop(0, '#3888b0'); ocean.addColorStop(0.5, '#50a0c0'); ocean.addColorStop(1, '#68b0c8');
    ctx.fillStyle = ocean; ctx.fillRect(0, groundY * 0.6, W, groundY * 0.4);

    // gentle waves on the horizon
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++){
      const wy = groundY * 0.63 + i * 8;
      ctx.beginPath();
      for (let x = 0; x < W; x += 4){
        const y = wy + Math.sin(x * 0.05 + t * 1.5 + i) * 1.5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // rocky shore
    const rock = ctx.createLinearGradient(0, groundY, 0, H);
    rock.addColorStop(0, '#8a8878'); rock.addColorStop(0.3, '#7a7868'); rock.addColorStop(1, '#6a6858');
    ctx.fillStyle = rock; ctx.fillRect(0, groundY, W, H - groundY);

    // rocky texture
    ctx.fillStyle = 'rgba(0,0,0,.04)';
    for (let i = 0; i < 12; i++){
      const rx = (i * 67 + 11) % W, ry = groundY + 4 + (i * 43 + 7) % (H - groundY - 8);
      ctx.beginPath(); ctx.ellipse(rx, ry, 6 + (i % 4) * 3, 3 + (i % 3), (i * 0.7), 0, 7); ctx.fill();
    }

    // tide pools (shallow water pools in the rocks)
    const pools = [
      { x: W * 0.20, y: groundY + 30, rx: 22, ry: 7 },
      { x: W * 0.50, y: groundY + 35, rx: 26, ry: 8 },
      { x: W * 0.78, y: groundY + 28, rx: 20, ry: 6 },
    ];
    for (const p of pools){
      // pool water
      ctx.fillStyle = 'rgba(60,140,180,.45)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, 7); ctx.fill();
      // pool rim (darker rock edge)
      ctx.strokeStyle = 'rgba(80,70,60,.3)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, 7); ctx.stroke();
      // water shimmer
      ctx.fillStyle = `rgba(255,255,255,${(0.1 + 0.06 * Math.sin(t * 2 + p.x)).toFixed(2)})`;
      ctx.beginPath(); ctx.ellipse(p.x - 4, p.y - 1, p.rx * 0.4, p.ry * 0.3, -0.2, 0, 7); ctx.fill();
    }

    // seaweed tufts near pools
    ctx.fillStyle = '#4a8848';
    for (let i = 0; i < 5; i++){
      const sx = W * 0.12 + i * W * 0.18;
      const sy = groundY + 18 + (i % 3) * 8;
      const sway = Math.sin(t * 1.2 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy); ctx.quadraticCurveTo(sx + sway, sy - 10, sx - 1, sy - 16);
      ctx.quadraticCurveTo(sx + sway * 0.5, sy - 10, sx + 2, sy);
      ctx.closePath(); ctx.fill();
    }
  }

  // draw a starfish
  function drawStarfish(cx, cy, size, rot){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    ctx.fillStyle = '#e06838';
    for (let i = 0; i < 5; i++){
      const a = i * Math.PI * 2 / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - 0.3) * size * 0.4, Math.sin(a - 0.3) * size * 0.4);
      ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
      ctx.lineTo(Math.cos(a + 0.3) * size * 0.4, Math.sin(a + 0.3) * size * 0.4);
      ctx.closePath();
      ctx.fill();
    }
    // center dot
    ctx.fillStyle = '#d05828';
    ctx.beginPath(); ctx.arc(0, 0, size * 0.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  // draw a hermit crab
  function drawCrab(cx, cy, pinching){
    // shell
    ctx.fillStyle = '#c8a868';
    ctx.beginPath(); ctx.ellipse(cx, cy - 3, 5, 4, 0.2, 0, 7); ctx.fill();
    // shell spiral
    ctx.strokeStyle = '#a88848'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(cx + 1, cy - 3, 2.5, 0, 4); ctx.stroke();
    // legs
    ctx.strokeStyle = '#c06040'; ctx.lineWidth = 0.8;
    for (let i = -1; i <= 1; i += 2){
      ctx.beginPath(); ctx.moveTo(cx + i * 4, cy); ctx.lineTo(cx + i * 7, cy + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + i * 3, cy + 1); ctx.lineTo(cx + i * 6, cy + 4); ctx.stroke();
    }
    // claws
    if (pinching){
      // claws raised and snapping!
      ctx.fillStyle = '#c06040';
      ctx.beginPath(); ctx.ellipse(cx - 7, cy - 5, 3, 2, -0.5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 7, cy - 5, 3, 2, 0.5, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = '#c06040';
      ctx.beginPath(); ctx.ellipse(cx - 6, cy - 1, 2.5, 1.5, -0.3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 6, cy - 1, 2.5, 1.5, 0.3, 0, 7); ctx.fill();
    }
    // eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(cx - 2, cy - 6, 1, 1);
    ctx.fillRect(cx + 1, cy - 6, 1, 1);
  }

  // draw a pretty shell
  function drawShell(cx, cy){
    ctx.fillStyle = '#f0d0b0';
    ctx.beginPath(); ctx.ellipse(cx, cy, 5, 3.5, 0.3, 0, 7); ctx.fill();
    // ridges
    ctx.strokeStyle = '#d8b090'; ctx.lineWidth = 0.4;
    for (let i = 0; i < 4; i++){
      const a = i * 0.6 - 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.quadraticCurveTo(cx, cy - 3 + i * 0.5, cx + 4, cy + 1);
      ctx.stroke();
    }
    // iridescent highlight
    ctx.fillStyle = 'rgba(200,180,255,.25)';
    ctx.beginPath(); ctx.ellipse(cx - 1, cy - 1, 2.5, 1.5, 0.2, 0, 7); ctx.fill();
  }

  return {
    id: 'tide_pool_discovery',
    chars: ['krystal', 'luke', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Exploring — kneeling near pools
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('luke', 'point', lukeX, fY, charH);
          csDrawChar('luna', lunaX, fY, 'left', charH, 0);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Look at all these little pools! 🌊');
      }},
      // Step 2: Luke finds a starfish — inspect expression
      { dur: 2.5, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('luke', 'inspect', lukeX, fY, charH);
          csDrawChar('luna', lunaX, fY, 'left', charH, 0);
          // starfish in his hand area
          drawStarfish(lukeX + 14, fY - charH * 0.35, 6, 0.2);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'A STARFISH!! Look at it! ⭐');
      }},
      // Step 3: Luna finds a hermit crab — it pinches her! scared then laugh
      { dur: 3.0, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawChar('luke', lukeX, fY, 'down', charH, 0);
          drawStarfish(lukeX + 14, fY - charH * 0.35, 6, 0.2);
          if (cs.stepT < 1.5){
            csDrawExpression('luna', 'scared', lunaX, fY, charH);
            drawCrab(lunaX + 10, fY - charH * 0.25, true);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'OW!! It pinched me!! 😱');
          } else {
            csDrawExpression('luna', 'laugh', lunaX, fY, charH);
            drawCrab(lunaX + 16, fY - charH * 0.10, false);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'Okay that was kind of funny 😂');
          }
      }},
      // Step 4: Krystal finds a pretty shell — hearts
      { dur: 3.0, draw(cs){
          drawBg(cs);
          csDrawExpression('luke', 'cheer', lukeX, fY, charH);
          csDrawExpression('luna', 'cheer', lunaX, fY, charH);
          drawStarfish(lukeX + 14, fY - charH * 0.35, 6, 0.2);
          // pretty shell in Krystal's hands
          drawShell(krystalX + 12, fY - charH * 0.35);
          if (cs.stepT < 1.5){
            csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Oh! Look at this one... it\'s beautiful 🐚');
          } else {
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'I\'m keeping this one forever 💕');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 6);
          csHearts(cs, lukeX, fY - charH * 0.7, 3);
          csHearts(cs, lunaX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 17: PILLOW FORT  (triggers at treehouse, sunroom, igloo)
   ============================================================================ */
function csPillowFort(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.28, wadeX = W * 0.50, lukeX = W * 0.72;

  // draw a pillow at (cx, cy) with a given colour and rotation
  function drawPillow(cx, cy, col, rot, w, h){
    w = w || 20; h = h || 14;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot || 0);
    ctx.fillStyle = col || '#e8d0f0';
    roundRect(-w / 2, -h / 2, w, h, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.10)'; ctx.lineWidth = 0.8;
    roundRect(-w / 2, -h / 2, w, h, 4); ctx.stroke();
    // seam line
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 3, 0); ctx.lineTo(w / 2 - 3, 0); ctx.stroke();
    ctx.restore();
  }

  // draw a pillow fort wall (stacked pillows)
  function drawFortWall(cx, baseY, pillows){
    const cols = ['#e8d0f0','#d0e0f8','#f8e0c8','#c8f0d8','#f0d0d8'];
    for (let i = 0; i < pillows; i++){
      const py = baseY - i * 12;
      const wobble = Math.sin(i * 2.1) * 0.15;
      drawPillow(cx + Math.sin(i * 1.7) * 3, py, cols[i % cols.length], wobble, 24, 12);
    }
  }

  // scattered collapsed pillows
  function drawCollapsedPillows(cx, baseY){
    const cols = ['#e8d0f0','#d0e0f8','#f8e0c8','#c8f0d8','#f0d0d8','#f0e8c0'];
    for (let i = 0; i < 8; i++){
      const px = cx + Math.cos(i * 0.9) * 28 - 14;
      const py = baseY - 4 + Math.sin(i * 1.3) * 6;
      const rot = (i * 0.7) - 1.4;
      drawPillow(px, py, cols[i % cols.length], rot, 18 + (i % 3) * 4, 11);
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // warm indoor — cozy golden room
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f5e8d0'); wall.addColorStop(0.5, '#eedcc0'); wall.addColorStop(1, '#e4d0b0');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wooden floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#c09860'); floor.addColorStop(1, '#a88050');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // window with warm light
    const winX = W * 0.50, winY = H * 0.08, winW = 34, winH = 26;
    ctx.fillStyle = '#d0e8f8'; ctx.fillRect(winX - winW / 2, winY, winW, winH);
    ctx.strokeStyle = '#a08060'; ctx.lineWidth = 2;
    ctx.strokeRect(winX - winW / 2, winY, winW, winH);
    ctx.beginPath(); ctx.moveTo(winX, winY); ctx.lineTo(winX, winY + winH); ctx.stroke();

    // soft glow
    const glow = ctx.createRadialGradient(winX, winY + winH / 2, 4, winX, winY + winH / 2, 60);
    glow.addColorStop(0, 'rgba(255,240,200,.14)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(winX, winY + winH / 2, 60, 0, 7); ctx.fill();

    // blanket on the floor (base for fort)
    ctx.fillStyle = 'rgba(180,140,200,.18)';
    ctx.beginPath();
    ctx.ellipse(W * 0.50, groundY + 6, W * 0.30, 8, 0, 0, 7);
    ctx.fill();
  }

  return {
    id: 'pillow_fort',
    chars: ['krystal', 'wade', 'luke'],
    skipable: true,
    steps: [
      // Step 1: Building the fort — everyone stacking pillows
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawFortWall(W * 0.38, fY + 4, 3);
          drawFortWall(W * 0.58, fY + 4, 2);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawChar('wade', wadeX, fY, 'right', charH, Math.floor(cs.totalT * 4) % 4);
          csDrawExpression('luke', 'cheer', lukeX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'This is going to be the best fort ever!');
      }},
      // Step 2: Wade stacks too high — tower wobbles
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawFortWall(W * 0.38, fY + 4, 4);
          drawFortWall(W * 0.58, fY + 4, 5 + Math.floor(cs.stepT));
          csDrawExpression('luke', 'scared', lukeX, fY, charH);
          csDrawExpression('wade', 'talk', wadeX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'Just one more... okay maybe two more...');
      }},
      // Step 3: It collapses on Wade!
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawCollapsedPillows(W * 0.50, fY + 4);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('luke', 'surprised', lukeX, fY, charH);
          // Wade is buried — just show his hand poking out
          ctx.fillStyle = '#c8a070';
          ctx.beginPath(); ctx.arc(wadeX + 6, fY - 8, 3, 0, 7); ctx.fill();
          csDrawBubble(wadeX, fY - 20, 'Wade', "...I'm okay! \ud83d\ude05");
      }},
      // Step 4: Everyone laughing under the pillow pile — cozy and silly
      { dur: 3.2, draw(cs){
          drawBg(cs);
          drawCollapsedPillows(W * 0.50, fY + 4);
          if (cs.stepT < 1.6){
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('wade', 'embarrassed', wadeX, fY, charH);
            csDrawExpression('luke', 'laugh', lukeX, fY, charH);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Your face! \ud83d\ude02');
          } else {
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('wade', 'laugh', wadeX, fY, charH);
            csDrawExpression('luke', 'laugh', lukeX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Best fort ever \ud83d\udc9b");
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, wadeX, fY - charH * 0.7, 3);
          csHearts(cs, lukeX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 18: DANCE LESSON  (triggers at balletstudio, ballroom)
   ============================================================================ */
function csDanceLesson(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.38, paulX = W * 0.62;

  function drawBg(cs){
    const t = cs.totalT;
    // elegant ballroom / studio interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f0e0d0'); wall.addColorStop(0.5, '#e8d8c8'); wall.addColorStop(1, '#dcd0c0');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // polished floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#c8a870'); floor.addColorStop(1, '#b09060');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    // floor reflection sheen
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.fillRect(0, groundY, W, 4);

    // mirror on back wall
    const mx = W * 0.50, my = H * 0.08, mw = 50, mh = 36;
    ctx.fillStyle = '#d8e8f0'; ctx.fillRect(mx - mw / 2, my, mw, mh);
    ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 2.5;
    ctx.strokeRect(mx - mw / 2, my, mw, mh);
    // mirror glow
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(mx - mw / 2 + 3, my + 3, mw / 3, mh - 6);

    // chandelier
    ctx.fillStyle = '#e0d0a0';
    ctx.beginPath(); ctx.arc(W * 0.50, 6, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#c8b880'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.50, 0); ctx.lineTo(W * 0.50, 6); ctx.stroke();
    // dangling crystals
    for (let i = -2; i <= 2; i++){
      ctx.fillStyle = 'rgba(255,248,220,.6)';
      ctx.beginPath(); ctx.arc(W * 0.50 + i * 4, 14, 1.2, 0, 7); ctx.fill();
    }

    // barre on wall
    ctx.strokeStyle = '#a08060'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.10, groundY - 30); ctx.lineTo(W * 0.30, groundY - 30); ctx.stroke();
  }

  // floating music notes
  function drawNotes(cs){
    ctx.fillStyle = 'rgba(200,160,100,.35)';
    ctx.font = '10px serif';
    const notes = ['\u266a','\u266b','\u2669'];
    for (let i = 0; i < 3; i++){
      const nx = W * 0.20 + i * W * 0.25;
      const ny = H * 0.30 + Math.sin(cs.totalT * 1.2 + i * 2) * 12;
      ctx.fillText(notes[i % 3], nx, ny);
    }
  }

  // floating hearts for the spin
  function drawFloatingHearts(cs){
    ctx.font = '11px serif';
    const cx = (krystalX + paulX) / 2;
    for (let i = 0; i < 5; i++){
      const angle = cs.totalT * 1.5 + i * 1.26;
      const r = 24 + i * 6;
      const hx = cx + Math.cos(angle) * r;
      const hy = fY - charH * 0.5 + Math.sin(angle) * r * 0.5;
      ctx.globalAlpha = 0.4 + Math.sin(cs.totalT * 2 + i) * 0.2;
      ctx.fillStyle = '#e06080';
      ctx.fillText('\u2764', hx, hy);
    }
    ctx.globalAlpha = 1;
  }

  return {
    id: 'dance_lesson',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Paul trying to dance — terrible
      { dur: 2.4, draw(cs){
          drawBg(cs); drawNotes(cs);
          csDrawExpression('paul', 'talk', paulX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', "Okay, I think I've got this...");
      }},
      // Step 2: He steps on her foot
      { dur: 2.2, draw(cs){
          drawBg(cs); drawNotes(cs);
          csDrawExpression('paul', 'embarrassed', paulX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Ow! That was my foot! \ud83d\ude33');
      }},
      // Step 3: Krystal teaches him — he gets one move right
      { dur: 2.6, draw(cs){
          drawBg(cs); drawNotes(cs);
          if (cs.stepT < 1.3){
            csDrawExpression('krystal', 'talk', krystalX, fY, charH);
            csDrawExpression('paul', 'think', paulX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Like this — one, two, step!');
          } else {
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('paul', 'cheer', paulX, fY, charH);
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Wait... I did it?!');
          }
      }},
      // Step 4: They spin together — hearts — romantic
      { dur: 2.4, draw(cs){
          drawBg(cs); drawNotes(cs); drawFloatingHearts(cs);
          const cx = (krystalX + paulX) / 2;
          const spinOff = Math.cos(cs.stepT * 2.5) * 18;
          csDrawExpression('krystal', 'cheer', cx - spinOff, fY, charH);
          csDrawExpression('paul', 'cheer', cx + spinOff, fY, charH);
          csDrawBubble(cx, fY - charH - 14, 'Krystal', "You're a natural \u2764\ufe0f");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 6);
          csHearts(cs, paulX, fY - charH * 0.7, 6);
      }},
      // Step 5: Final moment — both happy, warm
      { dur: 2.4, draw(cs){
          drawBg(cs); drawNotes(cs);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('paul', 'talk', paulX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', "Same time tomorrow? \ud83d\ude0a");
      }, onStart(cs){
          csHearts(cs, (krystalX + paulX) / 2, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 19: FIREFLY CATCHING  (triggers at fireflies, fireflypier, nightgarden)
   ============================================================================ */
function csFireflyCatching(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.26, lunaX = W * 0.50, williamX = W * 0.74;

  // draw drifting fireflies in the air
  function drawFireflies(cs, count, seed){
    for (let i = 0; i < count; i++){
      const fx = W * 0.10 + ((i * 37 + (seed || 0)) % (W * 0.80));
      const fy = H * 0.12 + ((i * 23 + (seed || 0)) % (H * 0.45));
      const pulse = 0.4 + Math.sin(cs.totalT * 3 + i * 1.7) * 0.4;
      const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 5);
      glow.addColorStop(0, 'rgba(255,240,100,' + pulse + ')');
      glow.addColorStop(1, 'rgba(255,240,100,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(fx, fy, 5, 0, 7); ctx.fill();
      // core dot
      ctx.fillStyle = 'rgba(255,250,150,' + Math.min(1, pulse + 0.3) + ')';
      ctx.beginPath(); ctx.arc(fx, fy, 1.2, 0, 7); ctx.fill();
    }
  }

  // draw a jar (with or without fireflies inside)
  function drawJar(cx, baseY, hasFly, flyCol){
    // glass body
    ctx.strokeStyle = 'rgba(200,220,240,.6)'; ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(200,220,240,.12)';
    roundRect(cx - 6, baseY - 16, 12, 16, 3); ctx.fill();
    roundRect(cx - 6, baseY - 16, 12, 16, 3); ctx.stroke();
    // lid
    ctx.fillStyle = '#8a7a60'; ctx.fillRect(cx - 7, baseY - 18, 14, 3);
    if (hasFly){
      const glow = ctx.createRadialGradient(cx, baseY - 10, 0, cx, baseY - 10, 5);
      glow.addColorStop(0, flyCol || 'rgba(255,240,100,.6)');
      glow.addColorStop(1, 'rgba(255,240,100,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, baseY - 10, 5, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,150,.8)';
      ctx.beginPath(); ctx.arc(cx, baseY - 10, 1.2, 0, 7); ctx.fill();
    }
  }

  // firefly burst — lots of them released
  function drawReleaseBurst(cs){
    const cx = (krystalX + lunaX + williamX) / 3;
    const cy = fY - charH * 0.5;
    for (let i = 0; i < 14; i++){
      const angle = i * 0.45 + cs.stepT * 0.5;
      const r = 10 + cs.stepT * 18 + i * 3;
      const fx = cx + Math.cos(angle) * r;
      const fy = cy + Math.sin(angle) * r * 0.6 - cs.stepT * 8;
      const pulse = 0.5 + Math.sin(cs.totalT * 4 + i * 1.3) * 0.4;
      const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 4);
      glow.addColorStop(0, 'rgba(255,240,100,' + pulse + ')');
      glow.addColorStop(1, 'rgba(255,240,100,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(fx, fy, 4, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,150,' + Math.min(1, pulse + 0.2) + ')';
      ctx.beginPath(); ctx.arc(fx, fy, 1, 0, 7); ctx.fill();
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // night sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#0a1028'); sky.addColorStop(0.4, '#142040'); sky.addColorStop(1, '#1a3050');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // stars
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 20; i++){
      const sx = (i * 67 + 11) % W;
      const sy = (i * 41 + 7) % (groundY * 0.5);
      const twinkle = 0.3 + Math.sin(t * 2 + i * 1.1) * 0.3;
      ctx.globalAlpha = twinkle;
      ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // crescent moon
    ctx.fillStyle = '#f0e8c0';
    ctx.beginPath(); ctx.arc(W * 0.82, H * 0.10, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#142040';
    ctx.beginPath(); ctx.arc(W * 0.82 + 4, H * 0.10 - 1, 9, 0, 7); ctx.fill();

    // dark grass ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#1a4020'); gr.addColorStop(1, '#0e2a14');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // grass blades
    ctx.fillStyle = '#1e4a28';
    for (let x = 0; x < W; x += 5){
      const bh = 3 + Math.sin(x * 0.4 + t * 0.8) * 1.5;
      ctx.fillRect(x, groundY - bh, 1.5, bh);
    }

    // dark trees silhouette in background
    for (let i = 0; i < 4; i++){
      const tx = i * W / 3 + 10;
      ctx.fillStyle = '#0a1a10';
      ctx.beginPath();
      ctx.moveTo(tx - 14, groundY);
      ctx.lineTo(tx, groundY - 40 - i * 5);
      ctx.lineTo(tx + 14, groundY);
      ctx.fill();
    }
  }

  return {
    id: 'firefly_catching',
    chars: ['krystal', 'luna', 'william'],
    skipable: true,
    steps: [
      // Step 1: Night scene — fireflies everywhere, everyone looking around
      { dur: 2.2, draw(cs){
          drawBg(cs); drawFireflies(cs, 10, 0);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('luna', 'cheer', lunaX, fY, charH);
          csDrawChar('william', williamX, fY, 'left', charH, Math.floor(cs.totalT * 3) % 4);
          csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'Look at them all! \u2728');
      }},
      // Step 2: William catches one — cheer!
      { dur: 2.4, draw(cs){
          drawBg(cs); drawFireflies(cs, 7, 42);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('luna', 'surprised', lunaX, fY, charH);
          csDrawExpression('william', 'cheer', williamX, fY, charH);
          drawJar(williamX + 14, fY - charH * 0.3, true);
          csDrawBubble(williamX, fY - charH - 4, 'William', 'I got one! I got one! \ud83d\ude04');
      }},
      // Step 3: Luna's jar is empty — sad. Krystal shares hers.
      { dur: 2.8, draw(cs){
          drawBg(cs); drawFireflies(cs, 6, 88);
          drawJar(williamX + 14, fY - charH * 0.3, true);
          if (cs.stepT < 1.4){
            csDrawExpression('luna', 'search', lunaX, fY, charH);
            csDrawExpression('krystal', 'think', krystalX, fY, charH);
            csDrawChar('william', williamX, fY, 'left', charH, 0);
            drawJar(lunaX + 14, fY - charH * 0.3, false);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', "Mine keeps getting away...");
          } else {
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('luna', 'surprised', lunaX, fY, charH);
            csDrawChar('william', williamX, fY, 'left', charH, 0);
            drawJar(lunaX + 14, fY - charH * 0.3, true, 'rgba(255,220,100,.5)');
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Here — we can share mine \ud83d\udc9b');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, lunaX, fY - charH * 0.7, 3);
      }},
      // Step 4: They release them all — burst of lights
      { dur: 3.6, draw(cs){
          drawBg(cs);
          drawReleaseBurst(cs);
          drawFireflies(cs, 4, 130);
          if (cs.stepT < 1.8){
            csDrawExpression('william', 'cheer', williamX, fY, charH);
            csDrawExpression('luna', 'cheer', lunaX, fY, charH);
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawBubble(williamX, fY - charH - 4, 'William', 'On three — let them go!');
          } else {
            csDrawExpression('william', 'wave', williamX, fY, charH);
            csDrawExpression('luna', 'cheer', lunaX, fY, charH);
            csDrawExpression('krystal', 'wave', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Fly free, little lights \u2728");
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, lunaX, fY - charH * 0.7, 4);
          csHearts(cs, williamX, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 20: MAGIC SHOW  (triggers at magicshop, tarotparlor, wizardtower)
   ============================================================================ */
function csMagicShow(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.22, paulX = W * 0.50, williamX = W * 0.78;

  function drawBg(cs){
    const t = cs.totalT;
    // dark mystical interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#1a1028'); wall.addColorStop(0.5, '#241838'); wall.addColorStop(1, '#2a1e40');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // wooden stage floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#6a4830'); floor.addColorStop(1, '#503820');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);

    // curtains on sides
    ctx.fillStyle = '#6a1040';
    ctx.fillRect(0, 0, W * 0.08, groundY);
    ctx.fillRect(W * 0.92, 0, W * 0.08, groundY);
    // curtain folds
    ctx.fillStyle = '#801858';
    ctx.fillRect(W * 0.02, 0, 3, groundY);
    ctx.fillRect(W * 0.05, 0, 2, groundY);
    ctx.fillRect(W * 0.93, 0, 3, groundY);
    ctx.fillRect(W * 0.96, 0, 2, groundY);

    // sparkles drifting
    ctx.fillStyle = 'rgba(255,220,150,.4)';
    for (let i = 0; i < 8; i++){
      const sx = W * 0.12 + ((i * 53 + 7) % (W * 0.76));
      const sy = H * 0.06 + ((i * 37 + 13) % (H * 0.50));
      const twinkle = 0.2 + Math.sin(t * 2.5 + i * 1.4) * 0.3;
      ctx.globalAlpha = twinkle;
      ctx.font = '6px serif';
      ctx.fillText('\u2728', sx, sy);
    }
    ctx.globalAlpha = 1;

    // small table center-stage for the trick
    ctx.fillStyle = '#503828';
    ctx.fillRect(paulX - 14, groundY - 18, 28, 18);
    ctx.fillStyle = '#604838';
    ctx.fillRect(paulX - 16, groundY - 20, 32, 4);
  }

  // draw a top hat (cx = center, baseY = bottom of hat)
  function drawHat(cx, baseY, tilted){
    ctx.save();
    if (tilted){
      ctx.translate(cx, baseY);
      ctx.rotate(0.35);
      ctx.translate(-cx, -baseY);
    }
    // brim
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.ellipse(cx, baseY, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    // crown
    ctx.fillStyle = '#222234';
    ctx.fillRect(cx - 9, baseY - 18, 18, 18);
    // band
    ctx.fillStyle = '#8040a0';
    ctx.fillRect(cx - 9, baseY - 6, 18, 3);
    // top
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.ellipse(cx, baseY - 18, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // draw a bunny popping out of the hat
  function drawBunny(cx, baseY, pop){
    // bunny head
    const by = baseY - 18 - pop * 14;
    ctx.fillStyle = '#f0e8e0';
    ctx.beginPath(); ctx.ellipse(cx, by - 6, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
    // ears
    ctx.fillStyle = '#f0e8e0';
    ctx.beginPath(); ctx.ellipse(cx - 3, by - 16, 2.5, 7, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, by - 16, 2.5, 7, 0.15, 0, Math.PI * 2); ctx.fill();
    // inner ears
    ctx.fillStyle = '#e8a0b0';
    ctx.beginPath(); ctx.ellipse(cx - 3, by - 16, 1.2, 4, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 3, by - 16, 1.2, 4, 0.15, 0, Math.PI * 2); ctx.fill();
    // eyes
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(cx - 2.5, by - 7, 1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 2.5, by - 7, 1, 0, 7); ctx.fill();
    // nose
    ctx.fillStyle = '#e08090';
    ctx.beginPath(); ctx.arc(cx, by - 4, 1, 0, 7); ctx.fill();
  }

  // sparkle burst around bunny
  function drawMagicBurst(cs, cx, cy){
    ctx.font = '8px serif';
    for (let i = 0; i < 6; i++){
      const angle = i * 1.05 + cs.stepT * 2;
      const r = 8 + cs.stepT * 12;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r * 0.7;
      ctx.globalAlpha = Math.max(0, 0.7 - cs.stepT * 0.25);
      ctx.fillStyle = '#f0d040';
      ctx.fillText('\u2728', sx, sy);
    }
    ctx.globalAlpha = 1;
  }

  const hatCx = paulX, hatBaseY = groundY - 20;

  return {
    id: 'magic_show',
    chars: ['krystal', 'paul', 'william'],
    skipable: true,
    steps: [
      // Step 1: William stands center with hat — announces trick
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawHat(hatCx, hatBaseY, false);
          csDrawExpression('william', 'talk', williamX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawChar('paul', paulX, fY, 'left', charH, 0);
          csDrawBubble(williamX, fY - charH - 4, 'William', 'For my next trick... \ud83c\udfa9');
      }},
      // Step 2: He waves hands — bunny pops out — magic!
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawHat(hatCx, hatBaseY, false);
          const pop = Math.min(1, cs.stepT / 1.2);
          drawBunny(hatCx, hatBaseY, pop);
          if (cs.stepT > 0.8) drawMagicBurst(cs, hatCx, hatBaseY - 28);
          csDrawExpression('william', 'wave', williamX, fY, charH);
          csDrawExpression('paul', 'surprised', paulX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          if (cs.stepT < 1.4){
            csDrawBubble(williamX, fY - charH - 4, 'William', 'Abracadabra! \u2728');
          } else {
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'NO WAY!! \ud83d\ude32');
          }
      }},
      // Step 3: Paul stunned, Krystal clapping
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawHat(hatCx, hatBaseY, false);
          drawBunny(hatCx, hatBaseY, 1);
          csDrawExpression('paul', 'surprised', paulX, fY, charH);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('william', 'cheer', williamX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'That was amazing! \ud83d\udc4f');
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
      }},
      // Step 4: William bows — hat falls off — shrug
      { dur: 2.0, draw(cs){
          drawBg(cs);
          const fallT = Math.min(1, cs.stepT / 0.6);
          drawHat(hatCx + fallT * 30, hatBaseY + fallT * 20, true);
          if (cs.stepT < 1.0){
            csDrawExpression('william', 'shrug', williamX, fY, charH);
            csDrawBubble(williamX, fY - charH - 4, 'William', 'Uhh... that was part of the show!');
          } else {
            csDrawExpression('william', 'embarrassed', williamX, fY, charH);
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
          }
      }},
      // Step 5: Everyone laughing
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('william', 'laugh', williamX, fY, charH);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('paul', 'laugh', paulX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Best magician ever \ud83d\ude02');
      }, onStart(cs){
          csHearts(cs, williamX, fY - charH * 0.7, 3);
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
          csHearts(cs, paulX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 21: SUNSET FISHING  (triggers at fishingdock, marina, river)
   ============================================================================ */
function csSunsetFishing(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.24, paulX = W * 0.50, wadeX = W * 0.76;

  function drawBg(cs){
    const t = cs.totalT;
    // warm sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY * 0.50);
    sky.addColorStop(0, '#1a2848'); sky.addColorStop(0.3, '#c06030'); sky.addColorStop(0.7, '#e8a050'); sky.addColorStop(1, '#f0c870');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY * 0.50);

    // sun low on horizon
    const sunY = groundY * 0.42;
    ctx.fillStyle = '#f0c060';
    ctx.beginPath(); ctx.arc(W * 0.50, sunY, 14, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(240,200,100,.2)';
    ctx.beginPath(); ctx.arc(W * 0.50, sunY, 22, 0, 7); ctx.fill();

    // water
    const waterTop = groundY * 0.50;
    const water = ctx.createLinearGradient(0, waterTop, 0, groundY);
    water.addColorStop(0, '#c08848'); water.addColorStop(0.3, '#4878a0'); water.addColorStop(1, '#2a5070');
    ctx.fillStyle = water; ctx.fillRect(0, waterTop, W, groundY - waterTop);

    // sun reflection on water
    ctx.fillStyle = 'rgba(240,200,100,.15)';
    ctx.fillRect(W * 0.42, waterTop, W * 0.16, groundY - waterTop);

    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++){
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8){
        const ry = waterTop + 8 + i * 10 + Math.sin(x * 0.05 + t * 1.2 + i * 1.5) * 1.5;
        if (x === 0) ctx.moveTo(x, ry); else ctx.lineTo(x, ry);
      }
      ctx.stroke();
    }

    // wooden dock planks
    const dockTop = groundY - 4;
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(0, dockTop, W, H - dockTop);
    // plank lines
    ctx.strokeStyle = '#604828'; ctx.lineWidth = 0.8;
    for (let x = 0; x < W; x += 20){
      ctx.beginPath(); ctx.moveTo(x, dockTop); ctx.lineTo(x, H); ctx.stroke();
    }
    // dock edge
    ctx.fillStyle = '#604020'; ctx.fillRect(0, dockTop, W, 3);

    // dock posts
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(W * 0.05, dockTop - 14, 4, 18);
    ctx.fillRect(W * 0.93, dockTop - 14, 4, 18);
  }

  // draw a fishing line from a character's hand into the water
  function drawFishingLine(cx, waterHit, tug){
    ctx.strokeStyle = '#a0a0a0'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 6, fY - charH * 0.45);
    const tugOff = tug ? Math.sin(cutscene.totalT * 12) * 3 : 0;
    ctx.lineTo(cx + 20, groundY * 0.60 + tugOff);
    ctx.lineTo(waterHit + tugOff, groundY - 6);
    ctx.stroke();
    // bobber
    ctx.fillStyle = tug ? '#e03030' : '#e06040';
    ctx.beginPath(); ctx.arc(waterHit + tugOff, groundY - 6, 2.5, 0, 7); ctx.fill();
  }

  // draw a boot hanging from the line
  function drawBoot(cx, t){
    const bx = cx + 16, by = fY - charH * 0.50;
    const swing = Math.sin(t * 3) * 0.15;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(swing);
    // boot shape
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(-5, -12, 10, 14);
    ctx.fillRect(-5, 2, 16, 5);
    // sole
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(-5, 5, 16, 2);
    // line going up
    ctx.strokeStyle = '#a0a0a0'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -22); ctx.stroke();
    ctx.restore();
  }

  return {
    id: 'sunset_fishing',
    chars: ['krystal', 'paul', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Peaceful fishing — everyone sitting on the dock
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawFishingLine(krystalX, krystalX + 30, false);
          drawFishingLine(paulX, paulX + 25, false);
          drawFishingLine(wadeX, wadeX + 20, false);
          csDrawChar('krystal', krystalX, fY, 'down', charH, 0);
          csDrawChar('paul', paulX, fY, 'down', charH, 0);
          csDrawChar('wade', wadeX, fY, 'down', charH, 0);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', "This is so peaceful \u2728");
      }},
      // Step 2: Wade gets a big tug! Everyone excited
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawFishingLine(krystalX, krystalX + 30, false);
          drawFishingLine(paulX, paulX + 25, false);
          drawFishingLine(wadeX, wadeX + 20, true);
          csDrawExpression('wade', 'surprised', wadeX, fY, charH);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'I GOT SOMETHING!! \ud83c\udfa3');
      }},
      // Step 3: He pulls it up — it's a boot
      { dur: 2.8, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.4){
            csDrawExpression('wade', 'cheer', wadeX, fY, charH);
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('paul', 'cheer', paulX, fY, charH);
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Pull! Pull!');
          } else {
            drawBoot(wadeX, cs.totalT);
            csDrawExpression('wade', 'surprised', wadeX, fY, charH);
            csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
            csDrawExpression('paul', 'surprised', paulX, fY, charH);
            csDrawBubble(wadeX, fY - charH - 4, 'Wade', "It's a... boot?! \ud83d\udc62");
          }
      }},
      // Step 4: Everyone laughs — Krystal's quip, then Wade nods proudly
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawBoot(wadeX, cs.totalT);
          if (cs.stepT < 1.4){
            csDrawExpression('wade', 'laugh', wadeX, fY, charH);
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'The one that got away \ud83d\ude02');
          } else {
            csDrawExpression('wade', 'nod', wadeX, fY, charH);
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
            csDrawBubble(wadeX, fY - charH - 4, 'Wade', "I'm keeping it. Trophy fish. \ud83d\ude0e");
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
          csHearts(cs, paulX, fY - charH * 0.7, 3);
          csHearts(cs, wadeX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 22: GARDEN BUTTERFLIES  (triggers at butterflydome, greenhouse, sunflowers)
   ============================================================================ */
function csGardenButterflies(){
  const groundY = H * 0.70;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.35, lunaX = W * 0.65;

  function drawBg(cs){
    const t = cs.totalT;
    // bright warm garden
    const sky = ctx.createLinearGradient(0, 0, 0, groundY * 0.45);
    sky.addColorStop(0, '#78b8e8'); sky.addColorStop(1, '#a0d8f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY * 0.45);

    // warm sun
    ctx.fillStyle = 'rgba(255,240,200,.25)';
    ctx.beginPath(); ctx.arc(W * 0.80, H * 0.08, 20, 0, 7); ctx.fill();
    ctx.fillStyle = '#f8e880';
    ctx.beginPath(); ctx.arc(W * 0.80, H * 0.08, 10, 0, 7); ctx.fill();

    // background foliage
    const foliage = ctx.createLinearGradient(0, groundY * 0.35, 0, groundY);
    foliage.addColorStop(0, '#48a848'); foliage.addColorStop(0.5, '#3a8a3a'); foliage.addColorStop(1, '#2a7a2a');
    ctx.fillStyle = foliage; ctx.fillRect(0, groundY * 0.35, W, groundY * 0.65);

    // bush clusters behind
    ctx.fillStyle = '#3a9040';
    for (let i = 0; i < 5; i++){
      const bx = W * 0.10 + i * W * 0.20;
      ctx.beginPath(); ctx.arc(bx, groundY * 0.50, 18, 0, 7); ctx.fill();
    }

    // flowers in the garden
    const colors = ['#e06080','#e8a040','#c060c0','#e0e040','#60a0e0'];
    for (let i = 0; i < 12; i++){
      const fx = W * 0.05 + ((i * 43 + 7) % (W * 0.90));
      const fy = groundY * 0.55 + ((i * 29 + 11) % (groundY * 0.40));
      ctx.fillStyle = '#3a8030';
      ctx.fillRect(fx, fy, 1.5, 6);
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath(); ctx.arc(fx + 0.75, fy, 3, 0, 7); ctx.fill();
    }

    // grassy ground
    const ground = ctx.createLinearGradient(0, groundY, 0, H);
    ground.addColorStop(0, '#4aaa40'); ground.addColorStop(1, '#388830');
    ctx.fillStyle = ground; ctx.fillRect(0, groundY, W, H - groundY);

    // grass tufts
    ctx.fillStyle = '#50b848';
    for (let x = 0; x < W; x += 6){
      const gh = 2 + Math.sin(x * 0.5 + t * 0.6) * 1;
      ctx.fillRect(x, groundY - gh, 1.5, gh);
    }
  }

  // draw a butterfly at (bx, by) with wing color, flapping
  function drawButterfly(bx, by, color, t, scale){
    scale = scale || 1;
    const flap = Math.sin(t * 8) * 0.4;
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(scale, scale);
    // left wing
    ctx.fillStyle = color;
    ctx.save(); ctx.scale(1 - flap, 1);
    ctx.beginPath(); ctx.ellipse(-3, 0, 5, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // right wing
    ctx.save(); ctx.scale(1 - flap, 1);
    ctx.beginPath(); ctx.ellipse(3, 0, 5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // body
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-0.5, -3, 1, 6);
    // antennae
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(-2, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(2, -5); ctx.stroke();
    ctx.restore();
  }

  // several ambient butterflies
  function drawAmbientButterflies(cs){
    const bflies = [
      { seed: 0, col: '#e88040' },
      { seed: 1, col: '#6080e0' },
      { seed: 2, col: '#e060a0' },
      { seed: 3, col: '#e0d040' },
      { seed: 4, col: '#60c0c0' },
    ];
    for (const b of bflies){
      const bx = W * 0.08 + ((b.seed * 73 + 17) % (W * 0.84));
      const by = H * 0.15 + ((b.seed * 41 + 9) % (H * 0.35));
      const drift = Math.sin(cs.totalT * 0.8 + b.seed * 2) * 8;
      drawButterfly(bx + drift, by + Math.cos(cs.totalT * 0.6 + b.seed) * 5, b.col, cs.totalT + b.seed, 0.8);
    }
  }

  // the special butterfly that lands on Luna's nose
  function drawNoseButterfly(cs, landed){
    const noseX = lunaX;
    const noseY = fY - charH * 0.68;
    if (landed){
      // sitting still on nose — tiny wing flutter
      drawButterfly(noseX, noseY, '#e88040', cs.totalT * 0.3, 1.0);
    } else {
      // flying near
      const bx = noseX + Math.sin(cs.totalT * 1.5) * 15;
      const by = noseY - 10 + Math.cos(cs.totalT * 1.2) * 8;
      drawButterfly(bx, by, '#e88040', cs.totalT, 1.0);
    }
  }

  // the butterfly flying away
  function drawFlyAway(cs){
    const prog = Math.min(1, cs.stepT / 1.5);
    const startX = lunaX, startY = fY - charH * 0.68;
    const endX = W * 0.85, endY = H * 0.10;
    const bx = startX + (endX - startX) * prog;
    const by = startY + (endY - startY) * prog + Math.sin(prog * 10) * 6;
    const alpha = 1 - prog * 0.6;
    ctx.globalAlpha = alpha;
    drawButterfly(bx, by, '#e88040', cs.totalT, 1.0 - prog * 0.3);
    ctx.globalAlpha = 1;
  }

  return {
    id: 'garden_butterflies',
    chars: ['krystal', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Garden scene — butterflies everywhere, both delighted
      { dur: 2.2, draw(cs){
          drawBg(cs); drawAmbientButterflies(cs);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('luna', 'cheer', lunaX, fY, charH);
          csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'Look at all the butterflies! \ud83e\udd8b');
      }},
      // Step 2: One lands on Luna's nose — she freezes
      { dur: 2.4, draw(cs){
          drawBg(cs); drawAmbientButterflies(cs);
          csDrawExpression('luna', 'surprised', lunaX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          drawNoseButterfly(cs, true);
          csDrawBubble(lunaX, fY - charH - 4, 'Luna', "There's one on my nose!! \ud83d\ude33");
      }},
      // Step 3: Krystal whispers — Luna goes cross-eyed
      { dur: 2.6, draw(cs){
          drawBg(cs); drawAmbientButterflies(cs);
          csDrawExpression('krystal', 'talk', krystalX, fY, charH);
          csDrawExpression('luna', 'scared', lunaX, fY, charH);
          drawNoseButterfly(cs, true);
          if (cs.stepT < 1.3){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Don\u2019t move! \ud83e\udd2b");
          } else {
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', "I\u2019m... trying to see it... \ud83d\ude35");
          }
      }},
      // Step 4: It flies away — both laugh — hearts
      { dur: 2.8, draw(cs){
          drawBg(cs); drawAmbientButterflies(cs);
          drawFlyAway(cs);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('luna', 'laugh', lunaX, fY, charH);
          if (cs.stepT < 1.4){
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', "It tickled! \ud83d\ude02");
          } else {
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Your face was priceless \ud83d\udc9b");
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, lunaX, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 23: TREASURE HUNT  (triggers at canyon, sanddunes, cornmaze)
   ============================================================================ */
function csTreasureHunt(){
  const groundY = H * 0.68;
  const charH = 80;
  const fY = groundY + 12;
  const krystalX = W * 0.24, paulX = W * 0.50, wadeX = W * 0.76;

  // treasure chest state
  let chestOpen = false;

  // gold coin particles
  let coins = [];
  function spawnCoins(cx, cy, n){
    for (let i = 0; i < n; i++){
      coins.push({
        x: cx + rand(-8, 8), y: cy,
        vx: rand(-18, 18), vy: rand(-50, -25),
        life: 1.2 + Math.random() * 0.8,
        maxLife: 1.2 + Math.random() * 0.8,
        size: 2 + Math.random() * 2,
        rot: Math.random() * 6.28,
        vr: rand(-4, 4)
      });
    }
  }

  function drawBg(cs){
    const t = cs.totalT;
    // warm desert/canyon sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#68a8d0'); sky.addColorStop(0.5, '#a0c8e0'); sky.addColorStop(1, '#d8c8a0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun
    ctx.fillStyle = 'rgba(255,240,180,.25)';
    ctx.beginPath(); ctx.arc(W * 0.80, H * 0.10, 18, 0, 7); ctx.fill();
    ctx.fillStyle = '#f8e080';
    ctx.beginPath(); ctx.arc(W * 0.80, H * 0.10, 10, 0, 7); ctx.fill();

    // rocky canyon walls in background
    ctx.fillStyle = '#b8784a';
    ctx.beginPath();
    ctx.moveTo(0, groundY); ctx.lineTo(0, groundY - 60); ctx.lineTo(W * 0.12, groundY - 45);
    ctx.lineTo(W * 0.08, groundY); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W, groundY); ctx.lineTo(W, groundY - 55); ctx.lineTo(W * 0.88, groundY - 40);
    ctx.lineTo(W * 0.92, groundY); ctx.closePath(); ctx.fill();

    // sandy ground
    const sand = ctx.createLinearGradient(0, groundY, 0, H);
    sand.addColorStop(0, '#d8c090'); sand.addColorStop(1, '#c8a870');
    ctx.fillStyle = sand; ctx.fillRect(0, groundY, W, H - groundY);

    // scattered rocks
    ctx.fillStyle = '#a08060';
    for (let i = 0; i < 6; i++){
      const rx = (i * 67 + 15) % W, ry = groundY + 6 + (i * 17) % 14;
      ctx.beginPath(); ctx.ellipse(rx, ry, 4 + (i % 3) * 2, 2.5, i * 0.4, 0, 7); ctx.fill();
    }
  }

  // draw a treasure map
  function drawMap(cx, cy){
    ctx.fillStyle = '#e8d8b0';
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.1);
    roundRect(-12, -8, 24, 16, 2); ctx.fill();
    ctx.strokeStyle = '#a08050'; ctx.lineWidth = 0.8;
    roundRect(-12, -8, 24, 16, 2); ctx.stroke();
    // route line
    ctx.strokeStyle = '#c04030'; ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-2, -2); ctx.lineTo(4, 1); ctx.lineTo(8, -4); ctx.stroke();
    ctx.setLineDash([]);
    // X marks the spot
    ctx.strokeStyle = '#c02020'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(10, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(6, -2); ctx.stroke();
    ctx.restore();
  }

  // draw a treasure chest
  function drawChest(cx, cy, open){
    // base
    ctx.fillStyle = '#8a5a2a';
    roundRect(cx - 14, cy - 10, 28, 14, 2); ctx.fill();
    // metal bands
    ctx.fillStyle = '#c8a040';
    ctx.fillRect(cx - 14, cy - 6, 28, 2);
    ctx.fillRect(cx - 14, cy, 28, 2);
    // lock
    ctx.fillStyle = '#c8a040';
    ctx.beginPath(); ctx.arc(cx, cy - 2, 2, 0, 7); ctx.fill();
    if (open){
      // lid open
      ctx.fillStyle = '#7a4a20';
      ctx.save(); ctx.translate(cx - 14, cy - 10); ctx.rotate(-0.8);
      ctx.fillRect(0, -12, 28, 12);
      ctx.fillStyle = '#c8a040';
      ctx.fillRect(0, -4, 28, 2);
      ctx.restore();
      // chocolate coins inside
      ctx.fillStyle = '#e8c040';
      for (let i = 0; i < 5; i++){
        ctx.beginPath();
        ctx.arc(cx - 8 + i * 4, cy - 6, 2.5, 0, 7);
        ctx.fill();
      }
      // gold wrapper highlights
      ctx.fillStyle = 'rgba(255,240,100,.4)';
      for (let i = 0; i < 5; i++){
        ctx.beginPath();
        ctx.arc(cx - 8 + i * 4 - 0.5, cy - 7, 1, 0, 7);
        ctx.fill();
      }
    } else {
      // lid closed
      ctx.fillStyle = '#7a4a20';
      roundRect(cx - 14, cy - 22, 28, 12, 2); ctx.fill();
      ctx.fillStyle = '#c8a040';
      ctx.fillRect(cx - 14, cy - 14, 28, 2);
    }
  }

  function drawCoins(dt){
    for (let i = coins.length - 1; i >= 0; i--){
      const c = coins[i];
      c.x += c.vx * dt; c.y += c.vy * dt;
      c.vy += 50 * dt;
      c.rot += c.vr * dt;
      c.life -= dt;
      if (c.life <= 0){ coins.splice(i, 1); continue; }
      const a = Math.min(1, c.life / c.maxLife * 2);
      ctx.save();
      ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle = `rgba(232,192,64,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(0, 0, c.size, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,240,100,${(a * 0.5).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(-0.5, -0.5, c.size * 0.5, 0, 7); ctx.fill();
      ctx.restore();
    }
  }

  // X mark on the ground
  function drawXMark(cx, cy){
    ctx.strokeStyle = '#c02020'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 8, cy - 6); ctx.lineTo(cx + 8, cy + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 8, cy - 6); ctx.lineTo(cx - 8, cy + 6); ctx.stroke();
  }

  const chestX = paulX, chestY = fY + 4;

  return {
    id: 'treasure_hunt',
    chars: ['krystal', 'paul', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Krystal inspects a treasure map
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
          csDrawChar('paul', paulX, fY, 'left', charH, 0);
          csDrawExpression('wade', 'search', wadeX, fY, charH * 0.95);
          drawMap(krystalX + 16, fY - charH * 0.35);
          drawCoins(0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'The map says it should be around here...');
      }, update(cs, dt){ drawCoins(dt); }},
      // Step 2: They search around — Wade looks behind a rock
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'search', krystalX, fY, charH);
          csDrawExpression('paul', 'search', paulX, fY, charH);
          csDrawExpression('wade', 'search', wadeX, fY, charH * 0.95);
          drawCoins(0);
          csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', 'Is it behind this rock? Nope!');
      }, update(cs, dt){ drawCoins(dt); }},
      // Step 3: Paul finds the X mark — points at it
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawXMark(chestX, chestY + 8);
          csDrawExpression('paul', 'point', paulX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('wade', 'surprised', wadeX, fY, charH * 0.95);
          drawCoins(0);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'X marks the spot! Right here!');
      }, update(cs, dt){ drawCoins(dt); }},
      // Step 4: They dig it up — Wade: "We're rich!" — Krystal opens it: chocolate coins
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawXMark(chestX, chestY + 8);
          drawCoins(0);
          if (cs.stepT < 1.3){
            drawChest(chestX, chestY, false);
            csDrawExpression('wade', 'cheer', wadeX, fY, charH * 0.95);
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('paul', 'cheer', paulX, fY, charH);
            csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', "We're rich!!");
          } else {
            drawChest(chestX, chestY, true);
            csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
            csDrawExpression('wade', 'surprised', wadeX, fY, charH * 0.95);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's... chocolate coins! \ud83c\udf6b\ud83d\ude02");
          }
      }, onStart(cs){
          chestOpen = true;
          spawnCoins(chestX, chestY - 10, 10);
      }, update(cs, dt){ drawCoins(dt); }},
      // Step 5: Everyone laughing — sharing the loot
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawXMark(chestX, chestY + 8);
          drawChest(chestX, chestY, true);
          drawCoins(0);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('paul', 'laugh', paulX, fY, charH);
          csDrawExpression('wade', 'laugh', wadeX, fY, charH * 0.95);
          csDrawBubble(wadeX, fY - charH * 0.95 - 4, 'Wade', "Best treasure ever! \ud83d\ude0b");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, paulX, fY - charH * 0.7, 4);
          csHearts(cs, wadeX, fY - charH * 0.6, 3);
      }, update(cs, dt){ drawCoins(dt); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 24: CLOUD WATCHING  (triggers at alpinemeadow, poppyfield, lavender)
   ============================================================================ */
function csCloudWatching(){
  const groundY = H * 0.70;
  const charH = 75;
  const blanketX = W * 0.50, blanketY = groundY + 18;
  const krystalX = blanketX + 32, paulX = blanketX - 32;

  // drifting cloud shapes
  function drawCloud(cx, cy, w, h, alpha){
    ctx.fillStyle = `rgba(255,255,255,${(alpha || 0.7).toFixed(2)})`;
    ctx.beginPath(); ctx.ellipse(cx, cy, w, h, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - w * 0.3, cy + h * 0.2, w * 0.5, h * 0.7, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + w * 0.35, cy + h * 0.1, w * 0.45, h * 0.6, 0, 0, 7); ctx.fill();
  }

  function drawBg(cs){
    const t = cs.totalT;
    // bright blue sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#4898d0'); sky.addColorStop(0.5, '#78b8e8'); sky.addColorStop(1, '#a0d0f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // drifting clouds
    const cloudDrift = t * 3;
    drawCloud((W * 0.20 + cloudDrift) % (W + 80) - 40, H * 0.14, 32, 12, 0.65);
    drawCloud((W * 0.55 + cloudDrift * 0.7) % (W + 80) - 40, H * 0.08, 28, 10, 0.55);
    drawCloud((W * 0.80 + cloudDrift * 0.5) % (W + 80) - 40, H * 0.22, 36, 14, 0.60);

    // the "bunny" cloud and "dragon" cloud they argue about
    if (cs.stepIdx >= 0){
      // big fluffy cloud — could be a bunny or a dragon
      const mainCx = W * 0.45 + Math.sin(t * 0.2) * 4;
      const mainCy = H * 0.18;
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.ellipse(mainCx, mainCy, 28, 14, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(mainCx - 10, mainCy - 8, 12, 8, -0.2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(mainCx + 14, mainCy - 4, 10, 10, 0.2, 0, 7); ctx.fill();
      // ear/horn puff
      ctx.beginPath(); ctx.ellipse(mainCx - 16, mainCy - 14, 5, 7, -0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(mainCx + 20, mainCy - 10, 5, 6, 0.3, 0, 7); ctx.fill();
    }

    // grassy meadow
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#5aaa40'); gr.addColorStop(1, '#3a8a28');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // wildflowers
    const cols = ['#e06080','#ffa040','#c060c0','#e0e040'];
    for (let i = 0; i < 10; i++){
      const fx = (i * 47 + 8) % W, fy = groundY + 4 + (i * 13) % 14;
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, 7); ctx.fill();
    }

    // grass blades
    ctx.fillStyle = '#4a9a34';
    for (let x = 0; x < W; x += 5){
      const bh = 3 + Math.sin(x * 0.3 + t * 1.2) * 1.5;
      ctx.fillRect(x, groundY - bh, 1.5, bh);
    }
  }

  function drawBlanketAndChars(cs, exprP, exprK){
    // blanket
    ctx.fillStyle = '#6898c0';
    roundRect(blanketX - 52, blanketY - 4, 104, 16, 4); ctx.fill();
    ctx.fillStyle = '#78a8d0';
    roundRect(blanketX - 48, blanketY - 2, 96, 12, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++){
      const lx = blanketX - 40 + i * 24;
      ctx.beginPath(); ctx.moveTo(lx, blanketY - 2); ctx.lineTo(lx, blanketY + 10); ctx.stroke();
    }

    if (exprP) csDrawExpression('paul', exprP, paulX, blanketY - 2, charH * 0.85);
    else csDrawChar('paul', paulX, blanketY - 2, 'up', charH * 0.85, 0);
    if (exprK) csDrawExpression('krystal', exprK, krystalX, blanketY - 2, charH * 0.85);
    else csDrawChar('krystal', krystalX, blanketY - 2, 'up', charH * 0.85, 0);
  }

  return {
    id: 'cloud_watching',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Lying on grass, peaceful
      { dur: 2.2, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs, null, null);
      }},
      // Step 2: Paul points at a cloud — "That one looks like a bunny"
      { dur: 2.4, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs, 'point', null);
          csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', 'That one looks like a bunny. \ud83d\udc30');
      }},
      // Step 3: Krystal disagrees — "That's clearly a dragon"
      { dur: 2.4, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs, null, 'talk');
          csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', "That's clearly a dragon. \ud83d\udc09");
      }},
      // Step 4: Playful argument — Paul shakes, Krystal nods
      { dur: 2.4, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.2){
            drawBlanketAndChars(cs, 'shake', 'nod');
            csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', "No way, it's a bunny!");
          } else {
            drawBlanketAndChars(cs, null, 'point');
            csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', "Look at the wings! Dragon!");
          }
      }},
      // Step 5: Both laugh — warm and peaceful
      { dur: 2.6, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs, 'laugh', 'laugh');
          if (cs.stepT < 1.3){
            csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', "Okay, it's a dragon-bunny. \ud83d\ude02");
          } else {
            csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', "I accept that compromise \ud83d\udc9b");
          }
      }, onStart(cs){
          csHearts(cs, paulX, blanketY - charH * 0.6, 4);
          csHearts(cs, krystalX, blanketY - charH * 0.6, 5);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 25: SPOOKY MANSION  (triggers at escaperoom, antiqueshop, darkroom)
   ============================================================================ */
function csSpookyMansion(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.24, williamX = W * 0.50, lukeX = W * 0.76;

  // ghost sheet state
  let ghostVisible = false;

  function drawBg(cs){
    const t = cs.totalT;
    // dark spooky interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#1a1420'); wall.addColorStop(0.5, '#241a2a'); wall.addColorStop(1, '#2a2030');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // old wooden floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#3a2a20'); floor.addColorStop(1, '#2a1e18');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 22){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }

    // creepy painting on the wall
    const paintX = W * 0.50, paintY = H * 0.12;
    ctx.fillStyle = '#4a3828';
    ctx.strokeStyle = '#6a4828'; ctx.lineWidth = 3;
    ctx.strokeRect(paintX - 16, paintY, 32, 26);
    ctx.fillRect(paintX - 14, paintY + 2, 28, 22);
    // painting contents — dark portrait
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(paintX - 14, paintY + 2, 28, 22);
    // face silhouette
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath(); ctx.ellipse(paintX, paintY + 12, 8, 10, 0, 0, 7); ctx.fill();
    // eyes that follow — they glow faintly
    const eyePulse = 0.3 + 0.2 * Math.sin(t * 2);
    ctx.fillStyle = `rgba(200,180,140,${eyePulse.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(paintX - 3, paintY + 10, 1.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(paintX + 3, paintY + 10, 1.5, 0, 7); ctx.fill();

    // cobwebs in corners
    ctx.strokeStyle = 'rgba(200,200,200,.12)'; ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++){
      ctx.beginPath(); ctx.moveTo(0, i * 6); ctx.lineTo(i * 8, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W, i * 6); ctx.lineTo(W - i * 8, 0); ctx.stroke();
    }

    // dust motes
    ctx.fillStyle = 'rgba(200,180,140,.08)';
    for (let i = 0; i < 6; i++){
      const mx = (i * 61 + Math.sin(t * 0.3 + i * 2) * 12) % W;
      const my = (i * 43 + Math.cos(t * 0.2 + i) * 10) % (groundY * 0.7) + 20;
      ctx.beginPath(); ctx.arc(mx, my, 1.2, 0, 7); ctx.fill();
    }

    // dim flickering candle on a shelf
    const candleX = W * 0.14;
    ctx.fillStyle = '#4a3828'; ctx.fillRect(candleX - 8, groundY - 24, 16, 3);
    ctx.fillStyle = '#e8e0d0'; ctx.fillRect(candleX - 2, groundY - 34, 4, 10);
    const flicker = 0.6 + 0.4 * Math.sin(t * 11);
    ctx.fillStyle = `rgba(255,180,60,${(0.6 * flicker).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(candleX, groundY - 35, 2.5, 0, 7); ctx.fill();
    const glow = ctx.createRadialGradient(candleX, groundY - 30, 2, candleX, groundY - 30, 40);
    glow.addColorStop(0, `rgba(255,180,60,${(0.12 * flicker).toFixed(2)})`);
    glow.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(candleX, groundY - 30, 40, 0, 7); ctx.fill();
  }

  // draw a ghost sheet (friendly)
  function drawGhostSheet(cx, cy, reveal){
    const wobble = Math.sin((cutscene ? cutscene.totalT : 0) * 3) * 3;
    if (reveal){
      // sheet falling off — reveals nothing, it was just a sheet
      ctx.fillStyle = 'rgba(240,240,240,.7)';
      ctx.beginPath(); ctx.ellipse(cx + 8, cy + 20, 14, 4, 0.3, 0, 7); ctx.fill();
      // crumpled fabric folds
      ctx.strokeStyle = 'rgba(200,200,200,.4)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy + 18); ctx.quadraticCurveTo(cx + 8, cy + 16, cx + 16, cy + 18); ctx.stroke();
    } else {
      // floating ghost shape
      ctx.fillStyle = 'rgba(240,240,240,.65)';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 14);
      ctx.quadraticCurveTo(cx - 14, cy - 8, cx, cy - 14 + wobble);
      ctx.quadraticCurveTo(cx + 14, cy - 8, cx + 12, cy + 14);
      // wavy bottom
      ctx.quadraticCurveTo(cx + 8, cy + 10, cx + 4, cy + 14);
      ctx.quadraticCurveTo(cx, cy + 10, cx - 4, cy + 14);
      ctx.quadraticCurveTo(cx - 8, cy + 10, cx - 12, cy + 14);
      ctx.closePath(); ctx.fill();
      // eyes
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.ellipse(cx - 4, cy - 2, 2, 3, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 4, cy - 2, 2, 3, 0, 0, 7); ctx.fill();
      // mouth
      ctx.beginPath(); ctx.ellipse(cx, cy + 4, 3, 2, 0, 0, 7); ctx.fill();
    }
  }

  return {
    id: 'spooky_mansion',
    chars: ['krystal', 'william', 'luke'],
    skipable: true,
    steps: [
      // Step 1: Exploring a dark room — creaky door — everyone scared
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'scared', krystalX, fY, charH);
          csDrawExpression('william', 'scared', williamX, fY, charH * 0.95);
          csDrawChar('luke', lukeX, fY, 'left', charH, 0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Did you hear that creak? \ud83d\ude30');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 2: William inspects the painting — eyes follow
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('william', 'inspect', williamX, fY, charH * 0.95);
          csDrawChar('luke', lukeX, fY, 'left', charH, 0);
          csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', 'Is that painting... looking at me? \ud83d\ude28');
      }},
      // Step 3: Luke beckons them to follow
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'scared', krystalX, fY, charH);
          csDrawExpression('william', 'scared', williamX, fY, charH * 0.95);
          csDrawExpression('luke', 'beckon', lukeX, fY, charH);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Come on, over here! I see something!');
      }},
      // Step 4: Ghost appears! Then it's just a sheet
      { dur: 2.8, draw(cs){
          drawBg(cs);
          if (cs.stepT < 1.4){
            drawGhostSheet(W * 0.50, fY - charH * 0.5, false);
            csDrawExpression('krystal', 'scared', krystalX, fY, charH);
            csDrawExpression('william', 'scared', williamX - 14, fY, charH * 0.95);
            csDrawExpression('luke', 'scared', lukeX, fY, charH);
            csDrawBubble(W * 0.50, fY - charH * 0.95 - 4, 'William', 'GHOST!! \ud83d\udc7b');
          } else {
            drawGhostSheet(W * 0.50, fY - charH * 0.5, true);
            csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
            csDrawExpression('william', 'surprised', williamX, fY, charH * 0.95);
            csDrawExpression('luke', 'inspect', lukeX, fY, charH);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', "Wait... it's just a sheet! \ud83e\udd23");
          }
      }, onStart(cs){
          ghostVisible = true;
          try{ sfx('tap'); }catch(e){}
      }},
      // Step 5: Everyone laughs — it was nothing
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawGhostSheet(W * 0.50, fY - charH * 0.5, true);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('william', 'laugh', williamX, fY, charH * 0.95);
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Our brave explorers! \ud83d\ude02");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, williamX, fY - charH * 0.6, 3);
          csHearts(cs, lukeX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 26: SNOWBALL FIGHT  (triggers at icepond, frozenfalls, icebergbay)
   ============================================================================ */
function csSnowballFight(){
  const groundY = H * 0.68;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.20, paulX = W * 0.42, lukeX = W * 0.62, williamX = W * 0.82;

  // snowflake particles
  const snowflakes = [];
  for (let i = 0; i < 35; i++){
    snowflakes.push({
      x: Math.random() * W, y: Math.random() * H,
      speed: 12 + Math.random() * 18,
      drift: rand(-6, 6),
      size: 1 + Math.random() * 2,
      phase: Math.random() * 6.28
    });
  }

  function drawBg(cs){
    const t = cs.totalT;
    // winter sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#a8bdd0'); sky.addColorStop(0.5, '#c4d4e4'); sky.addColorStop(1, '#dce6f0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // distant mountains
    ctx.fillStyle = '#c0cdd8';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    ctx.lineTo(W * 0.12, groundY - 45); ctx.lineTo(W * 0.28, groundY - 28);
    ctx.lineTo(W * 0.48, groundY - 58); ctx.lineTo(W * 0.68, groundY - 32);
    ctx.lineTo(W * 0.88, groundY - 50); ctx.lineTo(W, groundY - 22);
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();
    // snow peaks
    ctx.fillStyle = '#e6eef6';
    ctx.beginPath(); ctx.moveTo(W * 0.46, groundY - 53);
    ctx.lineTo(W * 0.48, groundY - 58); ctx.lineTo(W * 0.50, groundY - 52); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.86, groundY - 45);
    ctx.lineTo(W * 0.88, groundY - 50); ctx.lineTo(W * 0.90, groundY - 44); ctx.fill();

    // pine trees
    ctx.fillStyle = '#2a5040';
    for (let i = 0; i < 5; i++){
      const px = i * W / 4 + 15;
      const ph = 18 + ((i * 11) % 14);
      drawPine(px, groundY + 2, ph);
    }
    // snow caps on pines
    ctx.fillStyle = 'rgba(240,245,255,.45)';
    for (let i = 0; i < 5; i++){
      const px = i * W / 4 + 15;
      const ph = 18 + ((i * 11) % 14);
      ctx.beginPath();
      ctx.moveTo(px - 4, groundY + 2 - ph * 0.5);
      ctx.lineTo(px, groundY + 2 - ph);
      ctx.lineTo(px + 4, groundY + 2 - ph * 0.5);
      ctx.closePath(); ctx.fill();
    }

    // snowy ground
    const snow = ctx.createLinearGradient(0, groundY, 0, H);
    snow.addColorStop(0, '#eaf0f6'); snow.addColorStop(1, '#d4dce6');
    ctx.fillStyle = snow; ctx.fillRect(0, groundY, W, H - groundY);

    // subtle drifts
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.beginPath(); ctx.moveTo(0, groundY + 5);
    for (let x = 0; x <= W; x += 18) ctx.lineTo(x, groundY + 3 + Math.sin(x * 0.05 + 0.4) * 3);
    ctx.lineTo(W, groundY + 12); ctx.lineTo(0, groundY + 12); ctx.closePath(); ctx.fill();

    // falling snow
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    for (const s of snowflakes){
      const sx = (s.x + Math.sin(t * 0.6 + s.phase) * s.drift + t * s.drift * 0.15) % W;
      const sy = (s.y + s.speed * t) % H;
      ctx.beginPath(); ctx.arc(sx < 0 ? sx + W : sx, sy, s.size, 0, 7); ctx.fill();
    }
  }

  // draw a snowball in flight
  function drawSnowball(cx, cy, r){
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, r || 4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(200,210,230,.4)';
    ctx.beginPath(); ctx.arc(cx - 1, cy - 1, (r || 4) * 0.4, 0, 7); ctx.fill();
  }

  // draw William's snow wall
  function drawSnowWall(cx, baseY){
    ctx.fillStyle = '#dce6f0';
    ctx.beginPath();
    ctx.moveTo(cx - 22, baseY);
    ctx.lineTo(cx - 20, baseY - 28);
    ctx.quadraticCurveTo(cx, baseY - 34, cx + 20, baseY - 28);
    ctx.lineTo(cx + 22, baseY);
    ctx.closePath(); ctx.fill();
    // snow texture
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.arc(cx - 8, baseY - 18, 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6, baseY - 22, 4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, baseY - 10, 4, 0, 7); ctx.fill();
  }

  return {
    id: 'snowball_fight',
    chars: ['krystal', 'paul', 'luke', 'william'],
    skipable: true,
    steps: [
      // Step 1: Luke winds up and throws first snowball at Paul
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('luke', 'point', lukeX, fY, charH);
          csDrawChar('paul', paulX, fY, 'right', charH, 0);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawChar('william', williamX, fY, 'left', charH * 0.95, 0);
          // snowball in flight
          const prog = Math.min(1, cs.stepT / 1.0);
          const sbx = lukeX + (paulX - lukeX) * prog;
          const sby = fY - charH * 0.5 - Math.sin(prog * Math.PI) * 30;
          if (prog < 1) drawSnowball(sbx, sby);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Think fast, Paul! \u2744\ufe0f');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 2: Paul gets hit — surprised! All-out war begins
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('paul', 'surprised', paulX, fY, charH);
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('william', 'talk', williamX, fY, charH * 0.95);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Oh it is ON! \ud83d\ude24');
      }},
      // Step 3: William builds a snow wall, hides behind it — search + inspect
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawSnowWall(williamX, fY + 5);
          if (cs.stepT < 1.2){
            csDrawExpression('william', 'search', williamX, fY, charH * 0.95);
          } else {
            csDrawExpression('william', 'inspect', williamX, fY - 6, charH * 0.7);
          }
          csDrawExpression('krystal', 'think', krystalX, fY, charH);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawExpression('luke', 'beckon', lukeX, fY, charH);
          csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', 'Strategic advantage! \ud83e\uddf1');
      }},
      // Step 4: Krystal nails Paul — perfect shot! Paul embarrassed, everyone laughs
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawSnowWall(williamX, fY + 5);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawExpression('paul', 'embarrassed', paulX, fY, charH);
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawExpression('william', 'laugh', williamX, fY, charH * 0.95);
          // snow splatter on Paul
          ctx.fillStyle = 'rgba(255,255,255,.5)';
          ctx.beginPath(); ctx.arc(paulX + 4, fY - charH * 0.55, 5, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(paulX - 2, fY - charH * 0.6, 3, 0, 7); ctx.fill();
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Direct hit! \ud83c\udfaf');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      // Step 5: Truce — group hug, everyone cheering, hearts
      { dur: 2.8, draw(cs){
          drawBg(cs);
          const cx = W * 0.5;
          csDrawExpression('krystal', 'cheer', cx - 24, fY, charH);
          csDrawExpression('paul', 'laugh', cx - 8, fY, charH);
          csDrawExpression('luke', 'cheer', cx + 8, fY, charH);
          csDrawExpression('william', 'wave', cx + 24, fY, charH * 0.95);
          csDrawBubble(cx, fY - charH - 4, 'Paul', 'Truce! Truce! Group hug! \u2764\ufe0f');
      }, onStart(cs){
          const cx = W * 0.5;
          csHearts(cs, cx - 24, fY - charH * 0.7, 4);
          csHearts(cs, cx - 8, fY - charH * 0.7, 3);
          csHearts(cs, cx + 8, fY - charH * 0.7, 3);
          csHearts(cs, cx + 24, fY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 27: WISHING WELL  (triggers at starpool, moontemple, fairyring)
   ============================================================================ */
function csWishingWell(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.38, paulX = W * 0.62;
  const wellX = W * 0.50, wellBaseY = groundY + 4;

  function drawBg(cs){
    const t = cs.totalT;
    // twilight sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#1a1a3a'); sky.addColorStop(0.4, '#2a2850'); sky.addColorStop(0.8, '#3a3060'); sky.addColorStop(1, '#4a3868');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // stars
    ctx.fillStyle = 'rgba(255,255,220,.6)';
    const starSeeds = [0.1, 0.2, 0.35, 0.55, 0.7, 0.85, 0.92];
    for (const s of starSeeds){
      const sx = s * W;
      const sy = 10 + ((s * 137) % 1) * groundY * 0.4;
      const twinkle = 0.4 + 0.3 * Math.sin(t * 2 + s * 20);
      ctx.globalAlpha = twinkle;
      ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // crescent moon
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath(); ctx.arc(W * 0.82, H * 0.1, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath(); ctx.arc(W * 0.82 + 4, H * 0.1 - 2, 9, 0, 7); ctx.fill();

    // mossy stone ground
    const ground = ctx.createLinearGradient(0, groundY, 0, H);
    ground.addColorStop(0, '#2a3a28'); ground.addColorStop(1, '#1e2a1c');
    ctx.fillStyle = ground; ctx.fillRect(0, groundY, W, H - groundY);

    // scattered grass tufts
    ctx.strokeStyle = 'rgba(80,120,60,.3)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++){
      const gx = (i * 47 + 15) % W;
      const gy = groundY + 4;
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 2, gy - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 3, gy); ctx.lineTo(gx + 5, gy - 5); ctx.stroke();
    }

    // ambient fireflies
    ctx.fillStyle = 'rgba(200,220,120,.4)';
    for (let i = 0; i < 4; i++){
      const fx = (W * 0.2 + i * W * 0.2) + Math.sin(t * 0.8 + i * 3) * 12;
      const fy = groundY - 20 - i * 8 + Math.cos(t * 0.6 + i * 2) * 8;
      const glow = 0.2 + 0.2 * Math.sin(t * 3 + i * 5);
      ctx.globalAlpha = glow;
      ctx.beginPath(); ctx.arc(fx, fy, 2, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // draw the wishing well
  function drawWell(cs){
    const bx = wellX, by = wellBaseY;
    // stone base — circular well
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath(); ctx.ellipse(bx, by, 22, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(bx - 22, by - 20, 44, 20);
    // top rim
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath(); ctx.ellipse(bx, by - 20, 24, 9, 0, 0, 7); ctx.fill();
    // dark water inside
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.ellipse(bx, by - 20, 18, 6, 0, 0, 7); ctx.fill();
    // wooden posts + roof
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(bx - 20, by - 50, 4, 30);
    ctx.fillRect(bx + 16, by - 50, 4, 30);
    // little peaked roof
    ctx.fillStyle = '#4a3018';
    ctx.beginPath();
    ctx.moveTo(bx - 24, by - 48);
    ctx.lineTo(bx, by - 60);
    ctx.lineTo(bx + 24, by - 48);
    ctx.closePath(); ctx.fill();
    // rope and bucket
    ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, by - 55); ctx.lineTo(bx, by - 30); ctx.stroke();
    ctx.fillStyle = '#6a5030';
    ctx.fillRect(bx - 4, by - 32, 8, 6);
  }

  // draw sparkle rising from well
  function drawSparkle(cs, prog){
    const t = cs.totalT;
    const n = Math.floor(prog * 8) + 2;
    for (let i = 0; i < n; i++){
      const angle = t * 2 + i * (6.28 / n);
      const r = 6 + i * 3 * prog;
      const sx = wellX + Math.cos(angle) * r;
      const sy = wellBaseY - 24 - prog * 40 + Math.sin(angle) * r * 0.5;
      const alpha = (0.8 - prog * 0.5);
      ctx.fillStyle = `rgba(255,240,180,${alpha.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1.5 + prog, 0, 7); ctx.fill();
    }
  }

  return {
    id: 'wishing_well',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Standing at the well — Paul hands her a coin
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawWell(cs);
          csDrawExpression('paul', 'beckon', paulX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Here — make a wish! \u2728');
      }},
      // Step 2: Krystal closes her eyes and thinks
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawWell(cs);
          csDrawExpression('krystal', 'think', krystalX, fY, charH);
          csDrawExpression('paul', 'wave', paulX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'What did you wish for?');
      }},
      // Step 3: Krystal shakes her head — can't tell!
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawWell(cs);
          csDrawExpression('krystal', 'shake', krystalX, fY, charH);
          if (cs.stepT < 1.4){
            csDrawExpression('paul', 'surprised', paulX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Can't tell or it won't come true! \ud83e\udd2b");
          } else {
            csDrawExpression('paul', 'shrug', paulX, fY, charH);
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Fair enough! \ud83d\ude04');
          }
      }},
      // Step 4: She tosses the coin — Paul laughs — sparkle rises
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawWell(cs);
          const prog = Math.min(1, cs.stepT / 1.5);
          // coin arc
          if (prog < 0.5){
            const coinProg = prog * 2;
            const cx = krystalX + (wellX - krystalX) * coinProg;
            const cy = fY - charH * 0.3 - Math.sin(coinProg * Math.PI) * 35;
            ctx.fillStyle = '#d4a840';
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
            ctx.fillStyle = '#eac050';
            ctx.beginPath(); ctx.arc(cx - 0.5, cy - 0.5, 1.5, 0, 7); ctx.fill();
          }
          // sparkle from well after coin lands
          if (prog > 0.5) drawSparkle(cs, (prog - 0.5) * 2);
          csDrawExpression('krystal', 'nod', krystalX, fY, charH);
          csDrawExpression('paul', 'laugh', paulX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'There it goes\u2026 \u2728');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 5: Sparkle bloom — hearts — warm moment
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawWell(cs);
          drawSparkle(cs, 1.0);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'I think the well liked that one \u2764\ufe0f');
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, paulX, fY - charH * 0.7, 4);
          csHearts(cs, wellX, wellBaseY - 40, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 28: PET SHOP CHAOS  (triggers at petshop, catcafe, aviary)
   ============================================================================ */
function csPetShopChaos(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.26, lunaX = W * 0.50, wadeX = W * 0.74;

  function drawBg(cs){
    const t = cs.totalT;
    // warm indoor shop
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f0e8d8'); wall.addColorStop(0.5, '#e8dcc8'); wall.addColorStop(1, '#e0d4b8');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // tiled floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#d0c4a8'); floor.addColorStop(1, '#c0b498');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);
    // tile lines
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 26){
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = groundY; y < H; y += 20){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // shelves on the wall
    ctx.fillStyle = '#a0886a';
    ctx.fillRect(W * 0.04, H * 0.12, W * 0.18, 4);
    ctx.fillRect(W * 0.78, H * 0.15, W * 0.18, 4);
    ctx.fillRect(W * 0.04, H * 0.28, W * 0.14, 4);

    // pet food bags on shelves
    const bagColors = ['#e06040','#40a0e0','#60c060'];
    for (let i = 0; i < 3; i++){
      ctx.fillStyle = bagColors[i];
      ctx.fillRect(W * 0.05 + i * 14, H * 0.04, 10, 14);
    }

    // fish tank in corner
    ctx.fillStyle = 'rgba(100,180,220,.25)';
    ctx.fillRect(W * 0.80, H * 0.04, W * 0.14, H * 0.10);
    ctx.strokeStyle = 'rgba(60,120,160,.3)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(W * 0.80, H * 0.04, W * 0.14, H * 0.10);
    // little fish
    ctx.fillStyle = '#e08030';
    const fishX = W * 0.86 + Math.sin(t * 2) * 6;
    ctx.beginPath(); ctx.ellipse(fishX, H * 0.09, 3, 2, 0, 0, 7); ctx.fill();

    // warm overhead light
    const lightX = W * 0.5;
    ctx.fillStyle = '#c0a870';
    ctx.fillRect(lightX - 12, 0, 24, 6);
    const glow = ctx.createRadialGradient(lightX, 4, 3, lightX, 4, 80);
    glow.addColorStop(0, 'rgba(255,240,200,.08)');
    glow.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lightX, 4, 80, 0, 7); ctx.fill();
  }

  // draw a running puppy
  function drawPuppy(cx, cy, t){
    const bounce = Math.abs(Math.sin(t * 8)) * 3;
    // body
    ctx.fillStyle = '#c09060';
    ctx.beginPath(); ctx.ellipse(cx, cy - 5 - bounce, 8, 5, 0, 0, 7); ctx.fill();
    // head
    ctx.beginPath(); ctx.arc(cx + 6, cy - 9 - bounce, 4.5, 0, 7); ctx.fill();
    // ears
    ctx.fillStyle = '#a07040';
    ctx.beginPath(); ctx.ellipse(cx + 4, cy - 13 - bounce, 2, 3, -0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 8, cy - 13 - bounce, 2, 3, 0.4, 0, 7); ctx.fill();
    // tail (wagging)
    const wagAngle = Math.sin(t * 12) * 0.5;
    ctx.strokeStyle = '#c09060'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 7, cy - 6 - bounce);
    ctx.quadraticCurveTo(cx - 12, cy - 14 - bounce + wagAngle * 6, cx - 10, cy - 16 - bounce);
    ctx.stroke();
    // eyes + nose
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(cx + 8, cy - 10 - bounce, 1, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 10, cy - 8 - bounce, 1.2, 0, 7); ctx.fill();
    // legs (running)
    ctx.strokeStyle = '#c09060'; ctx.lineWidth = 1.5;
    const legPhase = t * 8;
    ctx.beginPath(); ctx.moveTo(cx - 4, cy - 2 - bounce); ctx.lineTo(cx - 4 + Math.sin(legPhase) * 3, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 4, cy - 2 - bounce); ctx.lineTo(cx + 4 + Math.sin(legPhase + 3) * 3, cy); ctx.stroke();
  }

  // draw a parrot
  function drawParrot(cx, cy, t){
    const flapAngle = Math.sin(t * 10) * 0.6;
    // body
    ctx.fillStyle = '#30a040';
    ctx.beginPath(); ctx.ellipse(cx, cy, 4, 6, 0, 0, 7); ctx.fill();
    // wings
    ctx.fillStyle = '#40c050';
    ctx.save(); ctx.translate(cx - 3, cy - 2);
    ctx.rotate(-flapAngle); ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(cx + 3, cy - 2);
    ctx.rotate(flapAngle); ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, Math.PI, 2 * Math.PI); ctx.fill();
    ctx.restore();
    // head
    ctx.fillStyle = '#e04040';
    ctx.beginPath(); ctx.arc(cx, cy - 6, 3.5, 0, 7); ctx.fill();
    // beak
    ctx.fillStyle = '#e8c030';
    ctx.beginPath(); ctx.moveTo(cx + 3, cy - 6);
    ctx.lineTo(cx + 7, cy - 5); ctx.lineTo(cx + 3, cy - 4); ctx.closePath(); ctx.fill();
    // eye
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + 1, cy - 7, 1.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx + 1, cy - 7, 0.6, 0, 7); ctx.fill();
  }

  // draw kittens around a character
  function drawKittens(cx, baseY, t){
    const kittenColors = ['#4a4a4a', '#e0a040', '#f0f0f0', '#a06030'];
    for (let i = 0; i < 4; i++){
      const kx = cx - 16 + i * 11 + Math.sin(t * 1.5 + i * 2) * 3;
      const ky = baseY - 4 + Math.cos(t * 1.2 + i * 3) * 2;
      ctx.fillStyle = kittenColors[i];
      // body
      ctx.beginPath(); ctx.ellipse(kx, ky - 3, 4, 3, 0, 0, 7); ctx.fill();
      // head
      ctx.beginPath(); ctx.arc(kx + 2, ky - 6, 2.5, 0, 7); ctx.fill();
      // ears
      ctx.beginPath(); ctx.moveTo(kx + 0.5, ky - 8); ctx.lineTo(kx + 1.5, ky - 10); ctx.lineTo(kx + 2.5, ky - 8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(kx + 2, ky - 8); ctx.lineTo(kx + 3, ky - 10); ctx.lineTo(kx + 4, ky - 8); ctx.fill();
      // eyes
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.arc(kx + 1.5, ky - 6, 0.5, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(kx + 3, ky - 6, 0.5, 0, 7); ctx.fill();
    }
  }

  return {
    id: 'pet_shop_chaos',
    chars: ['krystal', 'luna', 'wade'],
    skipable: true,
    steps: [
      // Step 1: A puppy runs loose! Wade chases it
      { dur: 2.4, draw(cs){
          drawBg(cs);
          const puppyX = W * 0.45 + Math.sin(cs.stepT * 3) * 30;
          const puppyY = fY + 4;
          drawPuppy(puppyX, puppyY, cs.totalT);
          csDrawExpression('wade', 'search', wadeX - cs.stepT * 15, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('luna', 'surprised', lunaX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'Loose puppy! I got it! \ud83d\udc36');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 2: Luna tries to catch a parrot — points at it flying overhead
      { dur: 2.4, draw(cs){
          drawBg(cs);
          const parrotX = W * 0.3 + cs.stepT * 40;
          const parrotY = H * 0.22 + Math.sin(cs.stepT * 4) * 10;
          drawParrot(parrotX, parrotY, cs.totalT);
          const puppyX = W * 0.6 + Math.sin(cs.stepT * 2.5) * 15;
          drawPuppy(puppyX, fY + 4, cs.totalT);
          csDrawExpression('luna', 'point', lunaX, fY, charH);
          csDrawExpression('wade', 'sad', wadeX, fY, charH);
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'The parrot escaped too?! \ud83e\udd9c');
      }},
      // Step 3: Krystal sits down — all the animals come to her
      { dur: 2.6, draw(cs){
          drawBg(cs);
          // Krystal seated (lower, smaller)
          csDrawExpression('krystal', 'beckon', krystalX, fY + 16, charH * 0.65);
          // kittens gathering
          drawKittens(krystalX, fY + 16, cs.totalT);
          // puppy trotting over (slowing)
          const puppyX = W * 0.45 - cs.stepT * 10;
          drawPuppy(puppyX, fY + 4, cs.totalT * 0.3);
          // parrot landing
          const parrotY = H * 0.22 + cs.stepT * 14;
          drawParrot(krystalX + 18, Math.min(parrotY, fY - charH * 0.65 + 4), cs.totalT * 0.4);
          csDrawExpression('luna', 'think', lunaX, fY, charH);
          csDrawExpression('wade', 'inspect', wadeX, fY, charH);
          csDrawBubble(krystalX, fY + 16 - charH * 0.65 - 4, 'Krystal', 'Come here, little ones\u2026 \ud83d\udc95');
      }},
      // Step 4: Wade is stunned — everyone covered in animals
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'laugh', krystalX, fY + 16, charH * 0.65);
          drawKittens(krystalX, fY + 16, cs.totalT);
          drawPuppy(krystalX + 22, fY + 8, cs.totalT * 0.2);
          drawParrot(krystalX + 16, fY - charH * 0.65 + 6, cs.totalT * 0.3);
          csDrawExpression('wade', 'surprised', wadeX, fY, charH);
          csDrawExpression('luna', 'shrug', lunaX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'How do you DO that?! \ud83d\ude32');
      }},
      // Step 5: Everyone laughs — wholesome ending, hearts
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'cheer', krystalX, fY + 16, charH * 0.65);
          drawKittens(krystalX, fY + 16, cs.totalT);
          drawPuppy(krystalX + 22, fY + 8, cs.totalT * 0.15);
          drawParrot(krystalX + 16, fY - charH * 0.65 + 6, cs.totalT * 0.2);
          csDrawExpression('wade', 'laugh', wadeX, fY, charH);
          csDrawExpression('luna', 'laugh', lunaX, fY, charH);
          csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'The Krystal effect! \ud83d\ude02\u2764\ufe0f');
      }, onStart(cs){
          csHearts(cs, krystalX, fY + 16 - charH * 0.5, 5);
          csHearts(cs, wadeX, fY - charH * 0.7, 3);
          csHearts(cs, lunaX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 29: KARAOKE NIGHT  (triggers at jazzclub, recordshop, carnival)
   ============================================================================ */
function csKaraokeNight(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.18, paulX = W * 0.38, lunaX = W * 0.62, wadeX = W * 0.82;
  const micX = W * 0.50, stageY = groundY - 8;

  function drawBg(cs){
    const t = cs.totalT;
    // dark club interior
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1a0e2e'); bg.addColorStop(0.4, '#221640'); bg.addColorStop(1, '#140c22');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // stage platform
    ctx.fillStyle = '#2e1a48';
    ctx.fillRect(W * 0.15, stageY, W * 0.70, 14);
    ctx.fillStyle = '#3a2258';
    ctx.fillRect(W * 0.15, stageY, W * 0.70, 4);

    // spotlight cone
    const spotA = 0.25 + 0.08 * Math.sin(t * 1.5);
    const spot = ctx.createRadialGradient(micX, stageY - 80, 5, micX, stageY + 20, 100);
    spot.addColorStop(0, `rgba(255,220,120,${spotA})`);
    spot.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = spot; ctx.beginPath(); ctx.arc(micX, stageY - 30, 100, 0, 7); ctx.fill();

    // disco ball sparkles
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 12; i++){
      const sx = (i * 73 + t * 25) % W;
      const sy = (i * 47 + t * 12) % (groundY * 0.5);
      const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 2.5);
      ctx.globalAlpha = tw * 0.35;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    // floor
    const fl = ctx.createLinearGradient(0, groundY, 0, H);
    fl.addColorStop(0, '#1e1232'); fl.addColorStop(1, '#120a20');
    ctx.fillStyle = fl; ctx.fillRect(0, groundY, W, H - groundY);

    // mic stand
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(micX, stageY); ctx.lineTo(micX, stageY - 50); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(micX, stageY - 52, 5, 0, 7); ctx.fill();
    // mic base
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.ellipse(micX, stageY + 2, 8, 3, 0, 0, 7); ctx.fill();
  }

  // floating music notes
  function drawNotes(cs, cx, cy){
    const t = cs.totalT;
    ctx.font = '14px serif'; ctx.textAlign = 'center';
    const notes = ['\u{1F3B5}', '\u{1F3B6}', '\u{266A}'];
    for (let i = 0; i < 4; i++){
      const ny = cy - 20 - ((t * 22 + i * 18) % 50);
      const nx = cx + Math.sin(t * 2 + i * 1.8) * 12;
      const a = Math.max(0, 1 - ((t * 22 + i * 18) % 50) / 50);
      ctx.globalAlpha = a * 0.7;
      ctx.fillText(notes[i % notes.length], nx, ny);
    }
    ctx.globalAlpha = 1;
  }

  // 10/10 sign
  function drawSign(cx, cy, t){
    const bob = Math.sin(t * 3) * 3;
    ctx.save();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e85a8a'; ctx.lineWidth = 2;
    const sw = 46, sh = 22;
    roundRect(cx - sw / 2, cy - sh / 2 + bob, sw, sh, 6); ctx.fill();
    roundRect(cx - sw / 2, cy - sh / 2 + bob, sw, sh, 6); ctx.stroke();
    ctx.fillStyle = '#e85a8a'; ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('10/10', cx, cy + bob + 1);
    ctx.restore();
  }

  return {
    id: 'karaoke_night',
    chars: ['krystal', 'paul', 'luna', 'wade'],
    skipable: true,
    steps: [
      // Step 1: Wade takes the stage — terrible but confident
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('wade', 'cheer', micX, fY - 8, charH);
          drawNotes(cs, micX, fY - charH - 8);
          csDrawExpression('krystal', 'embarrassed', krystalX, fY, charH);
          csDrawExpression('paul', 'scared', paulX, fY, charH);
          csDrawExpression('luna', 'shake', lunaX, fY, charH);
          csDrawBubble(micX, fY - charH - 14, 'Wade', 'IIII WILL ALWAYS LOVE YOUUU\u{1F3A4}');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 2: Everyone cringing — Wade oblivious
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('wade', 'wave', micX, fY - 8, charH);
          drawNotes(cs, micX, fY - charH - 8);
          csDrawExpression('krystal', 'think', krystalX, fY, charH);
          csDrawExpression('paul', 'sad', paulX, fY, charH);
          csDrawExpression('luna', 'inspect', lunaX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Is he\u2026 is he serious? \ud83d\ude30');
      }},
      // Step 3: Luna takes the mic — nails it! Everyone surprised
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('luna', 'talk', micX, fY - 8, charH);
          drawNotes(cs, micX, fY - charH - 8);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawExpression('wade', 'search', wadeX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Wait\u2026 she\u2019s AMAZING! \ud83d\ude2e');
      }},
      // Step 4: Everyone cheers for Luna
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('luna', 'shrug', micX, fY - 8, charH);
          drawNotes(cs, micX, fY - charH - 8);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawExpression('wade', 'point', wadeX, fY, charH);
          csDrawBubble(lunaX + 30, fY - charH - 14, 'Luna', 'Oh stop it\u2026 \ud83d\ude0a');
      }, onStart(cs){
          csHearts(cs, micX, fY - charH * 0.7, 4);
      }},
      // Step 5: Krystal & Paul duet — hearts float, Wade holds 10/10 sign
      { dur: 3.2, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'laugh', micX - 16, fY - 8, charH);
          csDrawExpression('paul', 'laugh', micX + 16, fY - 8, charH);
          drawNotes(cs, micX, fY - charH - 8);
          csDrawExpression('luna', 'beckon', lunaX, fY, charH);
          csDrawExpression('wade', 'wave', wadeX, fY, charH);
          drawSign(wadeX, fY - charH - 12, cs.totalT);
          csDrawBubble(micX, fY - charH - 18, null, '\u{1F3B6} You\u2019re my sunshine\u2026 \u{1F3B6}');
      }, onStart(cs){
          csHearts(cs, micX - 16, fY - charH * 0.5, 5);
          csHearts(cs, micX + 16, fY - charH * 0.5, 5);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 30: PUDDLE JUMPING  (triggers at rainystreet, waterfall, river)
   ============================================================================ */
function csPuddleJumping(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.25, lukeX = W * 0.50, williamX = W * 0.75;

  // rain particles
  const raindrops = [];
  for (let i = 0; i < 50; i++){
    raindrops.push({
      x: Math.random() * W, y: Math.random() * H,
      speed: 180 + Math.random() * 120,
      len: 6 + Math.random() * 8
    });
  }

  function drawBg(cs){
    const t = cs.totalT;
    // grey rainy sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#5a6270'); sky.addColorStop(0.5, '#6e7888'); sky.addColorStop(1, '#8a94a0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // distant buildings silhouette
    ctx.fillStyle = '#555d6a';
    const bldgs = [0.05, 0.15, 0.28, 0.42, 0.58, 0.72, 0.85];
    const bldgH = [35, 50, 28, 55, 40, 48, 32];
    const bldgW2 = [18, 14, 20, 16, 18, 15, 22];
    for (let i = 0; i < bldgs.length; i++){
      ctx.fillRect(bldgs[i] * W - bldgW2[i], groundY - bldgH[i], bldgW2[i] * 2, bldgH[i]);
    }

    // wet ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#4a5260'); gr.addColorStop(1, '#3e4550');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);
    // wet reflection sheen
    ctx.fillStyle = 'rgba(150,170,200,.12)';
    ctx.fillRect(0, groundY, W, 6);

    // puddles
    ctx.fillStyle = 'rgba(120,145,180,.3)';
    ctx.beginPath(); ctx.ellipse(lukeX, fY + 8, 28, 6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(krystalX + 30, fY + 10, 18, 4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.5, fY + 14, 40, 8, 0, 0, 7); ctx.fill();

    // rain
    ctx.strokeStyle = 'rgba(180,200,220,.4)'; ctx.lineWidth = 1;
    for (const r of raindrops){
      const ry = (r.y + r.speed * t) % (H + 20) - 10;
      const rx = (r.x + t * 8) % (W + 20) - 10;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 1, ry + r.len); ctx.stroke();
    }
  }

  // splash effect
  function drawSplash(cx, cy, radius, t){
    const prog = (t * 3) % 1;
    const r = radius * prog;
    const a = 1 - prog;
    ctx.strokeStyle = `rgba(150,180,220,${(a * 0.6).toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, 7); ctx.stroke();
    // droplets
    ctx.fillStyle = `rgba(150,180,220,${(a * 0.5).toFixed(2)})`;
    for (let i = 0; i < 5; i++){
      const angle = i / 5 * 6.28;
      const dx = cx + Math.cos(angle) * r * 0.8;
      const dy = cy + Math.sin(angle) * r * 0.2 - prog * 14;
      ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, 7); ctx.fill();
    }
  }

  return {
    id: 'puddle_jumping',
    chars: ['krystal', 'luke', 'william'],
    skipable: true,
    steps: [
      // Step 1: Luke runs and jumps in a huge puddle — splash!
      { dur: 2.2, draw(cs){
          drawBg(cs);
          const jumpProg = Math.min(1, cs.stepT / 0.8);
          const jumpY = fY - Math.sin(jumpProg * Math.PI) * 30;
          csDrawExpression('luke', 'cheer', lukeX, jumpY, charH);
          if (cs.stepT > 0.8) drawSplash(lukeX, fY + 8, 35, cs.stepT - 0.8);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawExpression('william', 'surprised', williamX, fY, charH);
          csDrawBubble(lukeX, jumpY - charH - 4, 'Luke', 'CANNONBALL! \ud83d\udca6');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 2: William tries to stay dry — shakes his head
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawExpression('william', 'shake', williamX, fY, charH);
          csDrawExpression('krystal', 'think', krystalX, fY, charH);
          // water droplets on William
          ctx.fillStyle = 'rgba(140,170,210,.4)';
          for (let i = 0; i < 4; i++){
            ctx.beginPath();
            ctx.arc(williamX - 8 + i * 5, fY - charH * 0.5 - i * 6, 1.5, 0, 7);
            ctx.fill();
          }
          csDrawBubble(williamX, fY - charH - 4, 'William', 'No way. I\u2019m staying DRY. \ud83d\ude45');
      }},
      // Step 3: Krystal grabs William's hand — beckon
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'beckon', krystalX + 20, fY, charH);
          csDrawExpression('william', 'scared', williamX - 20, fY, charH);
          csDrawExpression('luke', 'point', lukeX, fY, charH);
          csDrawBubble(krystalX + 20, fY - charH - 4, 'Krystal', 'Come on, it\u2019ll be fun! \ud83e\udd1d');
      }},
      // Step 4: All three jump together — massive splash!
      { dur: 2.0, draw(cs){
          drawBg(cs);
          const cx = W * 0.50;
          const jumpProg = Math.min(1, cs.stepT / 0.6);
          const jumpY = fY - Math.sin(jumpProg * Math.PI) * 35;
          csDrawExpression('krystal', 'cheer', cx - 28, jumpY, charH);
          csDrawExpression('luke', 'cheer', cx, jumpY, charH);
          csDrawExpression('william', 'wave', cx + 28, jumpY, charH * 0.95);
          if (cs.stepT > 0.6) drawSplash(cx, fY + 8, 50, cs.stepT - 0.6);
          csDrawBubble(cx, jumpY - charH - 4, null, 'ONE\u2026 TWO\u2026 THREE! \ud83d\udca6\ud83d\udca6');
      }, onStart(cs){ try{ sfx('tap'); }catch(e){} }},
      // Step 5: Everyone soaked and laughing
      { dur: 2.0, draw(cs){
          drawBg(cs);
          const cx = W * 0.50;
          csDrawExpression('krystal', 'laugh', cx - 28, fY, charH);
          csDrawExpression('luke', 'laugh', cx, fY, charH);
          csDrawExpression('william', 'embarrassed', cx + 28, fY, charH * 0.95);
          // water dripping off all of them
          ctx.fillStyle = 'rgba(140,170,210,.35)';
          for (let c = -1; c <= 1; c++){
            const px = cx + c * 28;
            for (let i = 0; i < 3; i++){
              const dy = (cs.stepT * 40 + i * 14) % 30;
              ctx.beginPath(); ctx.arc(px - 6 + i * 6, fY - charH * 0.3 + dy, 1.2, 0, 7); ctx.fill();
            }
          }
          csDrawBubble(cx + 28, fY - charH * 0.95 - 4, 'William', 'Okay\u2026 that was worth it. \ud83d\ude02');
      }, onStart(cs){
          const cx = W * 0.50;
          csHearts(cs, cx - 28, fY - charH * 0.7, 3);
          csHearts(cs, cx, fY - charH * 0.7, 3);
          csHearts(cs, cx + 28, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 31: CONSTELLATION DRAWING  (triggers at observatory, planetarium, aurora)
   ============================================================================ */
function csConstellationDrawing(){
  const groundY = H * 0.78;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.35, paulX = W * 0.65;

  // fixed star field
  const stars = [];
  for (let i = 0; i < 60; i++){
    stars.push({
      x: (i * 83 + 17) % W,
      y: (i * 53 + 11) % (groundY - 20),
      size: 0.8 + Math.random() * 1.4,
      phase: Math.random() * 6.28,
      brightness: 0.3 + Math.random() * 0.7
    });
  }

  // heart constellation points (relative to center, scaled)
  const heartPts = [
    { x: 0, y: -28 },    // top center dip
    { x: -12, y: -38 },  // left bump
    { x: -22, y: -30 },  // left outer
    { x: -18, y: -16 },  // left lower
    { x: -8, y: -4 },    // left bottom
    { x: 0, y: 6 },      // bottom point
    { x: 8, y: -4 },     // right bottom
    { x: 18, y: -16 },   // right lower
    { x: 22, y: -30 },   // right outer
    { x: 12, y: -38 },   // right bump
  ];

  function drawBg(cs){
    const t = cs.totalT;
    // deep night sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#060818'); sky.addColorStop(0.3, '#0c1028'); sky.addColorStop(0.7, '#161838'); sky.addColorStop(1, '#1e1e40');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // milky way band (faint)
    ctx.save();
    ctx.globalAlpha = 0.06;
    const mw = ctx.createLinearGradient(0, 0, W, groundY * 0.5);
    mw.addColorStop(0, 'transparent'); mw.addColorStop(0.3, '#8888cc'); mw.addColorStop(0.7, '#8888cc'); mw.addColorStop(1, 'transparent');
    ctx.fillStyle = mw;
    ctx.translate(W * 0.5, groundY * 0.25);
    ctx.rotate(-0.3);
    ctx.fillRect(-W * 0.7, -25, W * 1.4, 50);
    ctx.restore();

    // stars
    for (const s of stars){
      const tw = 0.5 + 0.5 * Math.sin(t * 1.8 + s.phase);
      ctx.fillStyle = `rgba(255,255,240,${(s.brightness * (0.4 + 0.6 * tw)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, 7); ctx.fill();
    }

    // gentle rolling hill silhouette
    ctx.fillStyle = '#0e1220';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 8){
      ctx.lineTo(x, groundY - 8 + Math.sin(x * 0.02 + 1) * 6 + Math.sin(x * 0.05) * 3);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    // ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#141828'); gr.addColorStop(1, '#0e1220');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);
  }

  // draw the traced constellation line (arbitrary shape)
  function drawTrace(cs, pts, cx, cy, progress){
    if (progress <= 0) return;
    const n = pts.length;
    const segCount = n; // closed loop
    const totalSegs = segCount;
    const segsDrawn = progress * totalSegs;

    ctx.strokeStyle = 'rgba(180,200,255,.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < Math.min(segsDrawn, totalSegs); i++){
      const p1 = pts[i % n];
      const p2 = pts[(i + 1) % n];
      const px1 = cx + p1.x, py1 = cy + p1.y;
      const px2 = cx + p2.x, py2 = cy + p2.y;
      if (i === 0) ctx.moveTo(px1, py1);
      if (i < Math.floor(segsDrawn)){
        ctx.lineTo(px2, py2);
      } else {
        const frac = segsDrawn - Math.floor(segsDrawn);
        ctx.lineTo(px1 + (px2 - px1) * frac, py1 + (py2 - py1) * frac);
      }
    }
    ctx.stroke();

    // dots at vertices
    ctx.fillStyle = 'rgba(200,220,255,.8)';
    for (let i = 0; i <= Math.min(Math.floor(segsDrawn), n - 1); i++){
      const p = pts[i % n];
      ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2.2, 0, 7); ctx.fill();
    }
  }

  // Krystal's made-up constellation (squiggly shape)
  const funnyPts = [
    { x: -14, y: -20 }, { x: -6, y: -30 }, { x: 8, y: -24 },
    { x: 16, y: -34 }, { x: 22, y: -18 }, { x: 10, y: -10 },
    { x: -4, y: -8 },
  ];

  return {
    id: 'constellation_drawing',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Night sky, Krystal points up and traces a constellation
      { dur: 2.4, draw(cs){
          drawBg(cs);
          const traceProgress = Math.min(1, cs.stepT / 2.0);
          drawTrace(cs, funnyPts, W * 0.35, H * 0.22, traceProgress);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawChar('paul', paulX, fY, 'left', charH, 0);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'See that one? Right there! \u2b50');
      }},
      // Step 2: Paul asks what it is — Krystal shrugs then laughs
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTrace(cs, funnyPts, W * 0.35, H * 0.22, 1);
          csDrawExpression('paul', 'search', paulX, fY, charH);
          if (cs.stepT < 1.2){
            csDrawExpression('krystal', 'shrug', krystalX, fY, charH);
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'What\u2019s that one called? \ud83e\udd14');
          } else {
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'I just made it up! \ud83d\ude1d');
          }
      }},
      // Step 3: Paul nods, starts tracing his own — it's a heart
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawTrace(cs, funnyPts, W * 0.35, H * 0.22, 1);
          const heartProg = Math.min(1, cs.stepT / 2.2);
          drawTrace(cs, heartPts, W * 0.65, H * 0.22, heartProg);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Okay my turn\u2026 watch this. \u270b');
      }},
      // Step 4: Heart constellation complete — stars connect and glow
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawTrace(cs, funnyPts, W * 0.35, H * 0.22, 1);
          drawTrace(cs, heartPts, W * 0.65, H * 0.22, 1);
          // glow around heart constellation
          const glow = ctx.createRadialGradient(W * 0.65, H * 0.22 - 16, 5, W * 0.65, H * 0.22 - 16, 40);
          glow.addColorStop(0, 'rgba(255,180,200,.15)'); glow.addColorStop(1, 'rgba(255,180,200,0)');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(W * 0.65, H * 0.22 - 16, 40, 0, 7); ctx.fill();
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('paul', 'talk', paulX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Wait\u2026 is that a\u2026?! \ud83d\udc96');
      }},
      // Step 5: Krystal cheers — hearts everywhere
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawTrace(cs, funnyPts, W * 0.35, H * 0.22, 1);
          drawTrace(cs, heartPts, W * 0.65, H * 0.22, 1);
          // warm glow
          const glow = ctx.createRadialGradient(W * 0.65, H * 0.22 - 16, 5, W * 0.65, H * 0.22 - 16, 50);
          glow.addColorStop(0, 'rgba(255,180,200,.22)'); glow.addColorStop(1, 'rgba(255,180,200,0)');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(W * 0.65, H * 0.22 - 16, 50, 0, 7); ctx.fill();
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('paul', 'embarrassed', paulX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'I call it\u2026 us. \u2764\ufe0f');
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
          csHearts(cs, paulX, fY - charH * 0.7, 5);
          csHearts(cs, W * 0.65, H * 0.22 - 16, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 32: LANTERN RELEASE  (triggers at lanternfestival, nightmarket, harbornight)
   ============================================================================ */
function csLanternRelease(){
  const groundY = H * 0.72;
  const charH = 78;
  const fY = groundY + 10;
  // 6 characters spaced across the shore
  const krystalX = W * 0.18, paulX = W * 0.34, lunaX = W * 0.50;
  const wadeX = W * 0.66, lukeX = W * 0.78, williamX = W * 0.92;
  const lakeY = groundY + 8;

  // fixed star field
  const stars = [];
  for (let i = 0; i < 55; i++){
    stars.push({
      x: (i * 79 + 11) % W,
      y: (i * 47 + 9) % (groundY * 0.55),
      size: 0.8 + Math.random() * 1.2,
      phase: Math.random() * 6.28
    });
  }

  // lantern particles (released in step 4, float upward)
  const lanterns = [];

  function drawBg(cs){
    const t = cs.totalT;
    // deep night sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#06081a'); sky.addColorStop(0.4, '#0e1638'); sky.addColorStop(1, '#1a1e44');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // stars
    for (const s of stars){
      const tw = 0.5 + 0.5 * Math.sin(t * 1.6 + s.phase);
      ctx.fillStyle = `rgba(255,255,240,${(0.3 + 0.5 * tw).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, 7); ctx.fill();
    }

    // distant treeline silhouette
    ctx.fillStyle = '#0a1218';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 12){
      ctx.lineTo(x, groundY - 10 + Math.sin(x * 0.04) * 5 + Math.sin(x * 0.09 + 1) * 3);
    }
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // lake surface
    const lake = ctx.createLinearGradient(0, lakeY, 0, H);
    lake.addColorStop(0, '#0c1428'); lake.addColorStop(0.5, '#0e1830'); lake.addColorStop(1, '#081020');
    ctx.fillStyle = lake; ctx.fillRect(0, lakeY, W, H - lakeY);

    // star reflections in water
    for (const s of stars){
      if (s.y > groundY * 0.35) continue;
      const ry = lakeY + (groundY * 0.55 - s.y) * 0.3 + Math.sin(t * 1.2 + s.phase) * 1.5;
      ctx.fillStyle = `rgba(255,255,220,${(0.06 + 0.06 * Math.sin(t * 1.6 + s.phase)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(s.x, ry, 0.8, 0, 7); ctx.fill();
    }

    // gentle water ripples
    ctx.strokeStyle = 'rgba(180,200,255,.04)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++){
      const ry = lakeY + 6 + i * 10;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, ry + Math.sin(x * 0.06 + t * 0.8 + i) * 1.5);
      ctx.stroke();
    }

    // shore edge
    ctx.fillStyle = '#1a2030';
    ctx.beginPath(); ctx.moveTo(0, lakeY);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, lakeY - 1 + Math.sin(x * 0.08) * 1.5);
    ctx.lineTo(W, lakeY + 4); ctx.lineTo(0, lakeY + 4); ctx.closePath(); ctx.fill();
  }

  // draw a paper lantern (glowing)
  function drawLantern(cx, cy, size, glow){
    ctx.fillStyle = `rgba(255,180,60,${glow.toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx + size * 0.7, cy - size * 0.3, cx + size * 0.5, cy + size * 0.3);
    ctx.lineTo(cx - size * 0.5, cy + size * 0.3);
    ctx.quadraticCurveTo(cx - size * 0.7, cy - size * 0.3, cx, cy - size);
    ctx.fill();
    // inner glow
    const ig = ctx.createRadialGradient(cx, cy - size * 0.2, 1, cx, cy - size * 0.2, size * 0.6);
    ig.addColorStop(0, `rgba(255,220,120,${(glow * 0.5).toFixed(2)})`);
    ig.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy - size * 0.2, size * 0.6, 0, 7); ctx.fill();
  }

  // draw floating lanterns (released ones)
  function drawFloatingLanterns(cs){
    for (const l of lanterns){
      const age = cs.totalT - l.born;
      const ly = l.y0 - age * l.speed;
      const lx = l.x + Math.sin(age * 0.8 + l.phase) * 8;
      const fade = Math.max(0, 1 - age / 6);
      if (fade > 0) drawLantern(lx, ly, l.size, fade * 0.7);
    }
  }

  // draw held lanterns (small, at hand position)
  function drawHeldLantern(cx, handY){
    drawLantern(cx, handY, 8, 0.6);
  }

  return {
    id: 'lantern_release',
    chars: ['krystal', 'paul', 'luna', 'wade', 'luke', 'william'],
    skipable: true,
    steps: [
      // Step 1: Everyone standing by the lake holding unlit lanterns. Quiet anticipation.
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawFloatingLanterns(cs);
          csDrawExpression('krystal', 'talk', krystalX, fY, charH);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawExpression('luna', 'wave', lunaX, fY, charH);
          csDrawExpression('wade', 'inspect', wadeX, fY, charH);
          csDrawExpression('luke', 'think', lukeX, fY, charH);
          csDrawExpression('william', 'search', williamX, fY, charH * 0.95);
          // held lanterns
          drawHeldLantern(krystalX + 10, fY - charH * 0.45);
          drawHeldLantern(paulX + 10, fY - charH * 0.45);
          drawHeldLantern(lunaX + 10, fY - charH * 0.45);
          drawHeldLantern(wadeX + 10, fY - charH * 0.45);
          drawHeldLantern(lukeX + 10, fY - charH * 0.45);
          drawHeldLantern(williamX + 10, fY - charH * 0.42);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Everyone ready? \u2728');
      }},
      // Step 2: They light lanterns one by one. Paul lights his, speaks.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawFloatingLanterns(cs);
          const litProg = Math.min(1, cs.stepT / 1.6);
          csDrawExpression('paul', 'talk', paulX, fY, charH);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawExpression('luna', 'nod', lunaX, fY, charH);
          csDrawExpression('wade', 'surprised', wadeX, fY, charH);
          csDrawExpression('luke', 'beckon', lukeX, fY, charH);
          csDrawExpression('william', 'think', williamX, fY, charH * 0.95);
          // lanterns glow brighter as they light
          drawLantern(krystalX + 10, fY - charH * 0.45, 8, litProg * 0.8);
          drawLantern(paulX + 10, fY - charH * 0.45, 8, litProg * 0.8);
          drawLantern(lunaX + 10, fY - charH * 0.45, 8, litProg * 0.6);
          drawLantern(wadeX + 10, fY - charH * 0.45, 8, litProg * 0.4);
          drawLantern(lukeX + 10, fY - charH * 0.45, 8, litProg * 0.3);
          drawLantern(williamX + 10, fY - charH * 0.42, 8, litProg * 0.2);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'For all the good things ahead. \ud83d\udd6f\ufe0f');
      }},
      // Step 3: Luna and Wade say something heartfelt. All lanterns glowing.
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawFloatingLanterns(cs);
          // all lanterns fully lit
          drawLantern(krystalX + 10, fY - charH * 0.45, 8, 0.8);
          drawLantern(paulX + 10, fY - charH * 0.45, 8, 0.8);
          drawLantern(lunaX + 10, fY - charH * 0.45, 8, 0.8);
          drawLantern(wadeX + 10, fY - charH * 0.45, 8, 0.8);
          drawLantern(lukeX + 10, fY - charH * 0.45, 8, 0.8);
          drawLantern(williamX + 10, fY - charH * 0.42, 8, 0.8);
          if (cs.stepT < 1.3){
            csDrawExpression('luna', 'talk', lunaX, fY, charH);
            csDrawExpression('wade', 'nod', wadeX, fY, charH);
            csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
            csDrawExpression('paul', 'shrug', paulX, fY, charH);
            csDrawExpression('luke', 'wave', lukeX, fY, charH);
            csDrawExpression('william', 'nod', williamX, fY, charH * 0.95);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'For friendship that never fades. \ud83c\udf1f');
          } else {
            csDrawExpression('luna', 'laugh', lunaX, fY, charH);
            csDrawExpression('wade', 'talk', wadeX, fY, charH);
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
            csDrawExpression('luke', 'point', lukeX, fY, charH);
            csDrawExpression('william', 'shake', williamX, fY, charH * 0.95);
            csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'For snacks! \u2026and love, I guess. \ud83d\ude05');
          }
      }},
      // Step 4: Luke and William say theirs. Then all release together!
      { dur: 2.8, draw(cs){
          drawBg(cs);
          drawFloatingLanterns(cs);
          if (cs.stepT < 1.0){
            csDrawExpression('luke', 'talk', lukeX, fY, charH);
            csDrawExpression('william', 'talk', williamX, fY, charH * 0.95);
            csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
            csDrawExpression('paul', 'nod', paulX, fY, charH);
            csDrawExpression('luna', 'wave', lunaX, fY, charH);
            csDrawExpression('wade', 'laugh', wadeX, fY, charH);
            drawLantern(krystalX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(paulX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(lunaX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(wadeX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(lukeX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(williamX + 10, fY - charH * 0.42, 8, 0.8);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'For adventures yet to come! \ud83d\ude80');
          } else if (cs.stepT < 1.8){
            csDrawExpression('william', 'talk', williamX, fY, charH * 0.95);
            csDrawExpression('krystal', 'nod', krystalX, fY, charH);
            csDrawExpression('paul', 'think', paulX, fY, charH);
            csDrawExpression('luna', 'nod', lunaX, fY, charH);
            csDrawExpression('wade', 'nod', wadeX, fY, charH);
            csDrawExpression('luke', 'nod', lukeX, fY, charH);
            drawLantern(krystalX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(paulX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(lunaX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(wadeX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(lukeX + 10, fY - charH * 0.45, 8, 0.8);
            drawLantern(williamX + 10, fY - charH * 0.42, 8, 0.8);
            csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', 'For the ones who hold us together. \ud83e\udde1');
          } else {
            // release — hands up, no held lanterns
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('paul', 'cheer', paulX, fY, charH);
            csDrawExpression('luna', 'cheer', lunaX, fY, charH);
            csDrawExpression('wade', 'cheer', wadeX, fY, charH);
            csDrawExpression('luke', 'cheer', lukeX, fY, charH);
            csDrawExpression('william', 'cheer', williamX, fY, charH * 0.95);
            csDrawBubble(W * 0.5, fY - charH - 4, null, 'Let go! \ud83c\udf1f');
          }
      }, onStart(cs){
          // spawn 6 rising lanterns (one per character)
          const xs = [krystalX, paulX, lunaX, wadeX, lukeX, williamX];
          const delay = 1.8; // release happens 1.8s into this step
          // we spawn immediately but set born relative to release time
          for (let i = 0; i < 6; i++){
            lanterns.push({
              x: xs[i] + rand(-8, 12), y0: fY - charH * 0.45,
              speed: 22 + Math.random() * 10, phase: Math.random() * 6.28,
              size: 7 + Math.random() * 3,
              born: cs.totalT + delay
            });
          }
      }},
      // Step 5: Lanterns float up, reflected in water. Krystal's final line.
      { dur: 4.0, draw(cs){
          drawBg(cs);
          // floating lanterns with water reflections
          for (const l of lanterns){
            const age = cs.totalT - l.born;
            if (age < 0) continue;
            const ly = l.y0 - age * l.speed;
            const lx = l.x + Math.sin(age * 0.8 + l.phase) * 8;
            const fade = Math.max(0, 1 - age / 8);
            if (fade > 0){
              drawLantern(lx, ly, l.size, fade * 0.7);
              // reflection
              const ry = lakeY + (lakeY - ly) * 0.15 + Math.sin(cs.totalT * 0.6 + l.phase) * 2;
              if (ry > lakeY && ry < H){
                ctx.globalAlpha = fade * 0.15;
                ctx.fillStyle = 'rgba(255,180,60,1)';
                ctx.beginPath(); ctx.arc(lx, ry, l.size * 0.4, 0, 7); ctx.fill();
                ctx.globalAlpha = 1;
              }
            }
          }
          csDrawExpression('krystal', 'talk', krystalX, fY, charH);
          csDrawExpression('paul', 'wave', paulX, fY, charH);
          csDrawExpression('luna', 'cheer', lunaX, fY, charH);
          csDrawExpression('wade', 'laugh', wadeX, fY, charH);
          csDrawExpression('luke', 'cheer', lukeX, fY, charH);
          csDrawExpression('william', 'wave', williamX, fY, charH * 0.95);
          if (cs.stepT < 2.0){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'I love all of you so much. \u2764\ufe0f');
          } else {
            csDrawBubble(W * 0.5, fY - charH - 4, null, '\ud83e\udd79 \u2764\ufe0f \ud83e\udd79');
          }
      }, onStart(cs){
          csHearts(cs, W * 0.2, fY - charH * 0.7, 4);
          csHearts(cs, W * 0.4, fY - charH * 0.7, 4);
          csHearts(cs, W * 0.5, fY - charH * 0.7, 4);
          csHearts(cs, W * 0.6, fY - charH * 0.7, 4);
          csHearts(cs, W * 0.8, fY - charH * 0.7, 4);
          csHearts(cs, W * 0.9, fY - charH * 0.6, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 33: BOARD GAME NIGHT  (triggers at treehouse, snowycabin, igloo)
   ============================================================================ */
function csBoardGameNight(){
  const groundY = H * 0.70;
  const charH = 78;
  const fY = groundY + 10;
  const tableX = W * 0.50, tableY = groundY - 10;
  const krystalX = W * 0.22, paulX = W * 0.40, wadeX = W * 0.60, lukeX = W * 0.78;

  function drawBg(cs){
    const t = cs.totalT;
    // cozy indoor warm tones
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#3a2818'); wall.addColorStop(0.6, '#4a3425'); wall.addColorStop(1, '#5a4030');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // warm lamplight glow from above
    const lamp = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.7);
    lamp.addColorStop(0, 'rgba(255,200,100,.12)'); lamp.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = lamp; ctx.fillRect(0, 0, W, H);

    // wooden floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#5c4232'); floor.addColorStop(1, '#4a3525');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);

    // floor planks
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 0.5;
    for (let i = 0; i < 6; i++){
      const py = groundY + 6 + i * 12;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // pendant lamp
    ctx.strokeStyle = '#8a7060'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, 18); ctx.stroke();
    ctx.fillStyle = '#d4a864';
    ctx.beginPath(); ctx.moveTo(W * 0.5 - 12, 18); ctx.lineTo(W * 0.5 + 12, 18);
    ctx.lineTo(W * 0.5 + 8, 28); ctx.lineTo(W * 0.5 - 8, 28); ctx.closePath(); ctx.fill();
    // bulb glow
    const bg = ctx.createRadialGradient(W * 0.5, 28, 2, W * 0.5, 28, 30);
    bg.addColorStop(0, 'rgba(255,230,160,.25)'); bg.addColorStop(1, 'rgba(255,230,160,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(W * 0.5, 28, 30, 0, 7); ctx.fill();
  }

  // draw the table with board game on it
  function drawTable(){
    // table top
    ctx.fillStyle = '#7a6048';
    ctx.beginPath();
    ctx.moveTo(tableX - 55, tableY); ctx.lineTo(tableX + 55, tableY);
    ctx.lineTo(tableX + 48, tableY + 8); ctx.lineTo(tableX - 48, tableY + 8);
    ctx.closePath(); ctx.fill();
    // table sides
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(tableX - 48, tableY + 8, 96, 5);

    // board game (colorful square with grid)
    const bx = tableX - 20, by = tableY - 18, bw = 40, bh = 16;
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#a08060'; ctx.lineWidth = 0.5;
    ctx.strokeRect(bx, by, bw, bh);
    // colored squares on board
    const colors = ['#e86060', '#60a8e8', '#60c860', '#e8c840', '#c860c8', '#60c8c8'];
    for (let r = 0; r < 2; r++){
      for (let c = 0; c < 6; c++){
        ctx.fillStyle = colors[(r * 6 + c) % 6];
        ctx.fillRect(bx + 2 + c * 6, by + 2 + r * 6, 5, 5);
      }
    }
    // little game pieces
    ctx.fillStyle = '#e04040'; // Krystal's piece (ahead)
    ctx.beginPath(); ctx.arc(bx + 34, by + 4, 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#4080e0'; // Paul's piece
    ctx.beginPath(); ctx.arc(bx + 28, by + 10, 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#40c040'; // Wade's piece (far behind)
    ctx.beginPath(); ctx.arc(bx + 6, by + 4, 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#c0c040'; // Luke's piece
    ctx.beginPath(); ctx.arc(bx + 18, by + 10, 2.2, 0, 7); ctx.fill();
  }

  return {
    id: 'board_game_night',
    chars: ['krystal', 'paul', 'wade', 'luke'],
    skipable: true,
    steps: [
      // Step 1: Everyone around the table. Wade is losing badly.
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable();
          csDrawExpression('krystal', 'talk', krystalX, fY, charH);
          csDrawExpression('paul', 'shrug', paulX, fY, charH);
          csDrawExpression('wade', 'sad', wadeX, fY, charH);
          csDrawExpression('luke', 'beckon', lukeX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'How am I still on square one?! \ud83d\ude29');
      }},
      // Step 2: Luke rolls and lands on Wade's spot
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable();
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawExpression('wade', 'scared', wadeX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          csDrawExpression('paul', 'point', paulX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'NOOO! Not my spot! \ud83d\ude31');
      }},
      // Step 3: Everyone laughing at Wade's despair
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable();
          csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          csDrawExpression('paul', 'laugh', paulX, fY, charH);
          csDrawExpression('luke', 'laugh', lukeX, fY, charH);
          csDrawExpression('wade', 'shake', wadeX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'His face! \ud83d\ude02');
      }},
      // Step 4: Krystal wins! Paul: "She always wins."
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawTable();
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('paul', 'talk', paulX, fY, charH);
          csDrawExpression('wade', 'sad', wadeX, fY, charH);
          csDrawExpression('luke', 'nod', lukeX, fY, charH);
          if (cs.stepT < 1.4){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'I WIN! \ud83c\udfc6');
          } else {
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'She always wins. \ud83e\udee0');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
      }},
      // Step 5: Wade demands a rematch. Everyone cheering.
      { dur: 2.0, draw(cs){
          drawBg(cs);
          drawTable();
          csDrawExpression('wade', 'beckon', wadeX, fY, charH);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('paul', 'laugh', paulX, fY, charH);
          csDrawExpression('luke', 'wave', lukeX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'REMATCH! Best of three! \ud83d\udd25');
      }, onStart(cs){
          csHearts(cs, W * 0.5, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 34: SUNRISE YOGA  (triggers at beach, alpinemeadow, rooftoppool)
   ============================================================================ */
function csSunriseYoga(){
  const groundY = H * 0.75;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.38, lunaX = W * 0.62;

  function drawBg(cs){
    const t = cs.totalT;
    // dawn sky — soft pink gradient
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#3a2848'); sky.addColorStop(0.25, '#7a4468');
    sky.addColorStop(0.5, '#d4807a'); sky.addColorStop(0.75, '#f0b88c');
    sky.addColorStop(1, '#fce4c4');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun peeking over horizon
    const sunY = groundY - 4;
    const sunR = 22;
    // glow
    const sg = ctx.createRadialGradient(W * 0.5, sunY, sunR * 0.3, W * 0.5, sunY, sunR * 3);
    sg.addColorStop(0, 'rgba(255,220,160,.35)'); sg.addColorStop(0.5, 'rgba(255,180,120,.10)'); sg.addColorStop(1, 'rgba(255,180,120,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W * 0.5, sunY, sunR * 3, 0, 7); ctx.fill();
    // sun disc (half visible)
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, groundY); ctx.clip();
    ctx.fillStyle = '#ffe8b0';
    ctx.beginPath(); ctx.arc(W * 0.5, sunY, sunR, 0, 7); ctx.fill();
    ctx.restore();

    // distant hills
    ctx.fillStyle = 'rgba(180,140,160,.25)';
    ctx.beginPath(); ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, groundY - 14 + Math.sin(x * 0.03 + 0.5) * 8);
    ctx.lineTo(W, groundY); ctx.closePath(); ctx.fill();

    // soft ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#c8dca0'); gr.addColorStop(1, '#a8c480');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // grass texture
    ctx.fillStyle = 'rgba(140,180,90,.2)';
    for (let x = 0; x < W; x += 8){
      const gh = 3 + Math.sin(x * 0.3 + t * 0.5) * 1.5;
      ctx.fillRect(x, groundY - gh, 1.5, gh);
    }

    // tiny clouds (wispy, dawn-lit)
    ctx.fillStyle = 'rgba(255,200,180,.15)';
    for (let i = 0; i < 3; i++){
      const cx = (W * 0.2 + i * W * 0.3 + t * 2) % (W + 40) - 20;
      const cy = 20 + i * 18;
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 12, cy - 2, 7, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 8, cy + 1, 6, 0, 7); ctx.fill();
    }
  }

  // draw a yoga mat
  function drawMat(cx, baseY, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 22, baseY); ctx.lineTo(cx + 22, baseY);
    ctx.lineTo(cx + 20, baseY - 3); ctx.lineTo(cx - 20, baseY - 3);
    ctx.closePath(); ctx.fill();
    // mat stripe
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(cx - 18, baseY - 2.5, 36, 1);
  }

  return {
    id: 'sunrise_yoga',
    chars: ['krystal', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Early morning — both doing yoga on mats. Peaceful.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawMat(krystalX, fY + 4, 'rgba(160,120,200,.4)');
          drawMat(lunaX, fY + 4, 'rgba(120,180,160,.4)');
          csDrawExpression('krystal', 'think', krystalX, fY, charH);
          csDrawExpression('luna', 'nod', lunaX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Breathe in\u2026 and hold\u2026 \ud83e\uddd8');
      }},
      // Step 2: Luna wobbles and falls! Embarrassed. Krystal holds pose perfectly.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawMat(krystalX, fY + 4, 'rgba(160,120,200,.4)');
          drawMat(lunaX, fY + 4, 'rgba(120,180,160,.4)');
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          if (cs.stepT < 1.2){
            csDrawExpression('luna', 'search', lunaX, fY, charH);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'Whoa\u2014 whoa\u2014! \ud83d\ude35\u200d\ud83d\udcab');
          } else {
            csDrawExpression('luna', 'embarrassed', lunaX, fY + 6, charH * 0.85);
            csDrawBubble(lunaX, fY - charH * 0.85 + 2, 'Luna', '\u2026I meant to do that. \ud83d\ude33');
          }
      }},
      // Step 3: Luna tries again. Krystal encourages.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawMat(krystalX, fY + 4, 'rgba(160,120,200,.4)');
          drawMat(lunaX, fY + 4, 'rgba(120,180,160,.4)');
          csDrawExpression('krystal', 'beckon', krystalX, fY, charH);
          csDrawExpression('luna', 'nod', lunaX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'You got this! One more try. \ud83d\udcaa');
      }},
      // Step 4: Both hold a pose together perfectly. Peaceful. Hearts.
      { dur: 2.8, draw(cs){
          drawBg(cs);
          drawMat(krystalX, fY + 4, 'rgba(160,120,200,.4)');
          drawMat(lunaX, fY + 4, 'rgba(120,180,160,.4)');
          csDrawExpression('krystal', 'wave', krystalX, fY, charH);
          csDrawExpression('luna', 'cheer', lunaX, fY, charH);
          if (cs.stepT < 1.6){
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'I\u2019m doing it! Look! \ud83c\udf1f');
          } else {
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Perfect. \u2728 Just like that.');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 4);
          csHearts(cs, lunaX, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 35: SANDCASTLE CONTEST  (triggers at beach, moonbeach, driftwoodbeach)
   ============================================================================ */
function csSandcastleContest(){
  const groundY = H * 0.74;
  const charH = 78;
  const fY = groundY + 10;
  const krystalX = W * 0.18, paulX = W * 0.40, wadeX = W * 0.62, williamX = W * 0.82;

  function drawBg(cs){
    const t = cs.totalT;
    // bright beach sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#5fa8d4'); sky.addColorStop(0.6, '#8cc8e8'); sky.addColorStop(1, '#c8e4f4');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun
    const sg = ctx.createRadialGradient(W * 0.8, H * 0.12, 4, W * 0.8, H * 0.12, 50);
    sg.addColorStop(0, 'rgba(255,240,180,.6)'); sg.addColorStop(0.4, 'rgba(255,220,140,.15)');
    sg.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.12, 50, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff4cc'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.12, 14, 0, 7); ctx.fill();

    // wispy clouds
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    for (let i = 0; i < 3; i++){
      const cx = (W * 0.1 + i * W * 0.35 + t * 1.5) % (W + 60) - 30;
      ctx.beginPath(); ctx.arc(cx, 22 + i * 12, 12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 14, 20 + i * 12, 8, 0, 7); ctx.fill();
    }

    // ocean at horizon
    ctx.fillStyle = '#5098c0';
    ctx.fillRect(0, groundY - 16, W, 16);
    // wave line
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, groundY - 8 + Math.sin(x * 0.06 + t * 2) * 2);
    ctx.stroke();

    // sandy beach ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#f0dca8'); gr.addColorStop(1, '#e0cc90');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // sand texture
    ctx.fillStyle = 'rgba(200,170,100,.15)';
    for (let i = 0; i < 30; i++){
      const sx = (i * 67 + 11) % W, sy = groundY + 4 + (i * 23) % (H - groundY - 8);
      ctx.fillRect(sx, sy, 1.5, 1);
    }
  }

  // draw a sandcastle of given size and detail
  function drawCastle(cx, baseY, size, fancy){
    // base mound
    ctx.fillStyle = '#d4b878';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.7, baseY);
    ctx.quadraticCurveTo(cx, baseY - size * 0.5, cx + size * 0.7, baseY);
    ctx.closePath(); ctx.fill();

    if (fancy){
      // elaborate fortress — multiple towers, battlements
      ctx.fillStyle = '#c8a860';
      ctx.fillRect(cx - size * 0.5, baseY - size * 0.8, size * 0.3, size * 0.5);
      ctx.fillRect(cx + size * 0.2, baseY - size * 0.8, size * 0.3, size * 0.5);
      ctx.fillRect(cx - size * 0.15, baseY - size, size * 0.3, size * 0.7);
      // battlements
      ctx.fillStyle = '#b89850';
      for (let i = 0; i < 3; i++){
        ctx.fillRect(cx - size * 0.18 + i * size * 0.12, baseY - size - size * 0.12, size * 0.08, size * 0.12);
      }
      // door
      ctx.fillStyle = '#8a6830';
      ctx.beginPath(); ctx.arc(cx, baseY - size * 0.15, size * 0.08, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - size * 0.08, baseY - size * 0.15, size * 0.16, size * 0.15);
      // flag
      ctx.strokeStyle = '#8a6830'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, baseY - size); ctx.lineTo(cx, baseY - size - size * 0.3); ctx.stroke();
      ctx.fillStyle = '#e04040';
      ctx.beginPath(); ctx.moveTo(cx, baseY - size - size * 0.3); ctx.lineTo(cx + size * 0.15, baseY - size - size * 0.22);
      ctx.lineTo(cx, baseY - size - size * 0.14); ctx.closePath(); ctx.fill();
    } else {
      // tiny lopsided tower
      ctx.fillStyle = '#c8a860';
      ctx.save(); ctx.translate(cx, baseY - size * 0.3); ctx.rotate(0.15);
      ctx.fillRect(-size * 0.12, -size * 0.3, size * 0.24, size * 0.3);
      ctx.restore();
    }
  }

  // moat around Krystal's castle
  function drawMoat(cx, baseY, size){
    ctx.strokeStyle = '#6898c0'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, baseY + 2, size * 0.85, 0, Math.PI);
    ctx.stroke();
    // water fill
    ctx.fillStyle = 'rgba(100,160,210,.25)';
    ctx.beginPath();
    ctx.arc(cx, baseY + 2, size * 0.85, 0, Math.PI);
    ctx.fill();
  }

  // draw wave washing away (animated)
  function drawWashWave(cs, t){
    const progress = Math.min(1, (t) / 1.2);
    const waveX = W * (-0.2 + progress * 1.4);
    ctx.fillStyle = 'rgba(100,180,220,.35)';
    ctx.beginPath();
    ctx.moveTo(waveX - 60, groundY + 3);
    for (let x = waveX - 60; x <= waveX + 60; x += 4){
      ctx.lineTo(x, groundY + 1 + Math.sin((x - waveX) * 0.08 + cs.totalT * 6) * 3);
    }
    ctx.lineTo(waveX + 60, H); ctx.lineTo(waveX - 60, H); ctx.closePath(); ctx.fill();
  }

  return {
    id: 'sandcastle_contest',
    chars: ['krystal', 'paul', 'wade', 'william'],
    skipable: true,
    steps: [
      // Step 1: Everyone building sandcastles. Wade has a tiny lopsided one.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawCastle(wadeX, fY + 6, 18, false);
          drawCastle(krystalX, fY + 6, 24, false);
          csDrawExpression('krystal', 'nod', krystalX, fY, charH);
          csDrawExpression('paul', 'search', paulX, fY, charH);
          csDrawExpression('wade', 'shrug', wadeX, fY, charH);
          csDrawExpression('william', 'think', williamX, fY, charH);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', "Well... it's got character. 🏖️");
      }},
      // Step 2: William reveals an elaborate fortress. Paul inspects it — stunned.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawCastle(wadeX, fY + 6, 18, false);
          drawCastle(williamX - 10, fY + 6, 30, true);
          drawCastle(krystalX, fY + 6, 24, false);
          csDrawExpression('william', 'cheer', williamX, fY, charH);
          csDrawExpression('paul', 'inspect', paulX, fY, charH);
          csDrawExpression('krystal', 'wave', krystalX, fY, charH);
          csDrawExpression('wade', 'surprised', wadeX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'How?! It has a FLAG! 😲');
      }},
      // Step 3: A wave comes and washes William's castle away. William: sad. Krystal's survives — moat!
      { dur: 2.8, draw(cs){
          drawBg(cs);
          // Krystal's castle with moat survives
          drawMoat(krystalX, fY + 6, 26);
          drawCastle(krystalX, fY + 6, 24, true);
          drawCastle(wadeX, fY + 6, 18, false);
          // William's castle gone after wave
          if (cs.stepT < 1.0){
            drawCastle(williamX - 10, fY + 6, 30, true);
          }
          drawWashWave(cs, cs.stepT);
          csDrawExpression('william', 'sad', williamX, fY, charH);
          csDrawExpression('paul', 'scared', paulX, fY, charH);
          csDrawExpression('krystal', 'point', krystalX, fY, charH);
          csDrawExpression('wade', 'shake', wadeX, fY, charH);
          if (cs.stepT < 1.4){
            csDrawBubble(williamX, fY - charH - 4, 'William', 'My fortress... no... 😢');
          } else {
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'MOAT! Always build a moat! 🏰');
          }
      }},
      // Step 4: Everyone surprised then laughing. Hearts.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawMoat(krystalX, fY + 6, 26);
          drawCastle(krystalX, fY + 6, 24, true);
          if (cs.stepT < 1.2){
            csDrawExpression('paul', 'surprised', paulX, fY, charH);
            csDrawExpression('wade', 'surprised', wadeX, fY, charH);
            csDrawExpression('william', 'surprised', williamX, fY, charH);
            csDrawExpression('krystal', 'beckon', krystalX, fY, charH);
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Wait — yours survived?!');
          } else {
            csDrawExpression('paul', 'laugh', paulX, fY, charH);
            csDrawExpression('wade', 'laugh', wadeX, fY, charH);
            csDrawExpression('william', 'laugh', williamX, fY, charH);
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Engineering! 😂👑');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 36: CANDLELIT DINNER  (triggers at cafe, diner, winecellar)
   ============================================================================ */
function csCandlelitDinner(){
  const groundY = H * 0.72;
  const charH = 80;
  const fY = groundY + 10;
  const krystalX = W * 0.62, paulX = W * 0.38;
  const tableX = W * 0.50, tableY = groundY - 6;

  function drawBg(cs){
    const t = cs.totalT;
    // warm dim interior
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#2a1a18'); wall.addColorStop(0.5, '#3a2420'); wall.addColorStop(1, '#4a3028');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);

    // warm ambient glow from candles
    const glow = ctx.createRadialGradient(tableX, tableY - 20, 3, tableX, tableY - 20, H * 0.5);
    glow.addColorStop(0, 'rgba(255,180,80,.18)'); glow.addColorStop(0.5, 'rgba(255,150,60,.06)');
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // elegant wallpaper pattern (faint diamond)
    ctx.strokeStyle = 'rgba(255,200,140,.04)'; ctx.lineWidth = 0.5;
    for (let r = 0; r < 6; r++){
      for (let c = 0; c < 10; c++){
        const dx = c * 28 + (r % 2) * 14, dy = r * 26;
        ctx.beginPath(); ctx.moveTo(dx, dy + 13); ctx.lineTo(dx + 14, dy);
        ctx.lineTo(dx + 28, dy + 13); ctx.lineTo(dx + 14, dy + 26); ctx.closePath(); ctx.stroke();
      }
    }

    // floor
    const floor = ctx.createLinearGradient(0, groundY, 0, H);
    floor.addColorStop(0, '#3c2820'); floor.addColorStop(1, '#2c1c14');
    ctx.fillStyle = floor; ctx.fillRect(0, groundY, W, H - groundY);

    // subtle floor reflection
    const ref = ctx.createRadialGradient(tableX, groundY + 10, 0, tableX, groundY + 10, 50);
    ref.addColorStop(0, 'rgba(255,180,80,.06)'); ref.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = ref; ctx.beginPath(); ctx.arc(tableX, groundY + 10, 50, 0, 7); ctx.fill();
  }

  function drawTable(cs){
    const t = cs.totalT;
    // white tablecloth
    ctx.fillStyle = '#f0ece4';
    ctx.beginPath();
    ctx.moveTo(tableX - 50, tableY); ctx.lineTo(tableX + 50, tableY);
    ctx.lineTo(tableX + 44, tableY + 8); ctx.lineTo(tableX - 44, tableY + 8);
    ctx.closePath(); ctx.fill();
    // draping cloth sides
    ctx.fillStyle = '#e8e0d4';
    ctx.fillRect(tableX - 44, tableY + 8, 88, 18);
    // cloth edge lace
    ctx.strokeStyle = 'rgba(200,180,160,.3)'; ctx.lineWidth = 0.5;
    for (let x = tableX - 42; x < tableX + 42; x += 6){
      ctx.beginPath(); ctx.arc(x, tableY + 26, 2, 0, Math.PI); ctx.stroke();
    }

    // candles (two)
    for (const cx of [tableX - 12, tableX + 12]){
      // candlestick
      ctx.fillStyle = '#c0a060';
      ctx.fillRect(cx - 2, tableY - 18, 4, 14);
      ctx.beginPath(); ctx.arc(cx, tableY - 4, 5, 0, 7); ctx.fill();
      // candle
      ctx.fillStyle = '#f5f0e0';
      ctx.fillRect(cx - 1.5, tableY - 28, 3, 10);
      // flame
      const fl = 0.7 + 0.3 * Math.sin(t * 8 + cx);
      ctx.fillStyle = '#ffa830';
      ctx.beginPath(); ctx.moveTo(cx - 2, tableY - 28);
      ctx.quadraticCurveTo(cx + Math.sin(t * 10 + cx) * 1.5, tableY - 28 - 7 * fl, cx + 2, tableY - 28);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffe880';
      ctx.beginPath(); ctx.moveTo(cx - 1, tableY - 28);
      ctx.quadraticCurveTo(cx + Math.sin(t * 10 + cx) * 0.8, tableY - 28 - 4 * fl, cx + 1, tableY - 28);
      ctx.closePath(); ctx.fill();
      // glow
      const cg = ctx.createRadialGradient(cx, tableY - 28, 1, cx, tableY - 28, 18);
      cg.addColorStop(0, 'rgba(255,200,100,.2)'); cg.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, tableY - 28, 18, 0, 7); ctx.fill();
    }

    // wine glasses
    for (const gx of [tableX - 28, tableX + 28]){
      ctx.strokeStyle = 'rgba(200,200,200,.5)'; ctx.lineWidth = 0.8;
      // stem
      ctx.beginPath(); ctx.moveTo(gx, tableY - 2); ctx.lineTo(gx, tableY - 12); ctx.stroke();
      // bowl
      ctx.beginPath(); ctx.arc(gx, tableY - 16, 5, 0.3, Math.PI - 0.3); ctx.stroke();
      // base
      ctx.beginPath(); ctx.moveTo(gx - 4, tableY - 1); ctx.lineTo(gx + 4, tableY - 1); ctx.stroke();
      // wine
      ctx.fillStyle = 'rgba(160,40,60,.35)';
      ctx.beginPath(); ctx.arc(gx, tableY - 14, 3.5, 0.2, Math.PI - 0.2); ctx.fill();
    }

    // small flower vase center
    ctx.fillStyle = 'rgba(180,200,220,.5)';
    ctx.fillRect(tableX - 3, tableY - 14, 6, 10);
    ctx.fillStyle = '#e06080';
    ctx.beginPath(); ctx.arc(tableX, tableY - 16, 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#e87090';
    ctx.beginPath(); ctx.arc(tableX + 3, tableY - 18, 3, 0, 7); ctx.fill();
  }

  // water spill puddle
  function drawSpill(cs){
    ctx.fillStyle = 'rgba(140,180,220,.3)';
    ctx.beginPath();
    ctx.arc(paulX + 14, tableY - 2, 10, 0, 7); ctx.fill();
    // tipped glass
    ctx.save();
    ctx.translate(paulX + 8, tableY - 6); ctx.rotate(1.2);
    ctx.strokeStyle = 'rgba(200,200,200,.4)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -10, 4, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.restore();
  }

  return {
    id: 'candlelit_dinner',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      // Step 1: Romantic setup. Paul pulls out her chair (beckon).
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable(cs);
          csDrawExpression('paul', 'beckon', paulX, fY, charH);
          csDrawExpression('krystal', 'wave', krystalX, fY, charH);
          csDrawBubble(paulX, fY - charH - 4, 'Paul', 'After you, my lady. 🪑✨');
      }},
      // Step 2: They clink glasses (cheer). Sweet moment.
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable(cs);
          csDrawExpression('paul', 'cheer', paulX, fY, charH);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'To us. 🥂💛');
      }, onStart(cs){
          csHearts(cs, tableX, tableY - 30, 4);
      }},
      // Step 3: Paul tries to be smooth — knocks over his water. Embarrassed.
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawTable(cs);
          drawSpill(cs);
          csDrawExpression('paul', 'embarrassed', paulX, fY, charH);
          csDrawExpression('krystal', 'surprised', krystalX, fY, charH);
          if (cs.stepT < 1.2){
            csDrawBubble(paulX, fY - charH - 4, 'Paul', '...I did not just do that. 😳');
          } else {
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Smooth moves, babe. 😂');
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
          }
      }},
      // Step 4: Paul owns it — nods. Romantic despite chaos. Hearts.
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawTable(cs);
          drawSpill(cs);
          csDrawExpression('paul', 'nod', paulX, fY, charH);
          csDrawExpression('krystal', 'talk', krystalX, fY, charH);
          if (cs.stepT < 1.2){
            csDrawBubble(paulX, fY - charH - 4, 'Paul', 'Nailed it. 😎');
          } else {
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'You really did. 💛');
            csDrawExpression('krystal', 'think', krystalX, fY, charH);
          }
      }, onStart(cs){
          csHearts(cs, tableX, tableY - 30, 8);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 37: FOSSIL DISCOVERY  (triggers at naturalhistory, canyon, cliffs)
   ============================================================================ */
function csFossilDiscovery(){
  const groundY = H * 0.74;
  const charH = 78;
  const fY = groundY + 10;
  const lukeX = W * 0.30, krystalX = W * 0.54, lunaX = W * 0.76;

  function drawBg(cs){
    const t = cs.totalT;
    // warm canyon/dig-site sky
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#6aa0c8'); sky.addColorStop(0.5, '#90b8d8'); sky.addColorStop(1, '#d0c8b0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

    // sun
    ctx.fillStyle = '#fff4cc';
    ctx.beginPath(); ctx.arc(W * 0.15, H * 0.10, 14, 0, 7); ctx.fill();
    const sg = ctx.createRadialGradient(W * 0.15, H * 0.10, 4, W * 0.15, H * 0.10, 40);
    sg.addColorStop(0, 'rgba(255,240,180,.3)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W * 0.15, H * 0.10, 40, 0, 7); ctx.fill();

    // layered rock strata behind
    const strata = ['#c0a070', '#b89060', '#a88050', '#987040'];
    for (let i = 0; i < strata.length; i++){
      ctx.fillStyle = strata[i];
      const sy = groundY - 40 + i * 10;
      ctx.beginPath(); ctx.moveTo(0, sy);
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, sy + Math.sin(x * 0.04 + i) * 4);
      ctx.lineTo(W, groundY); ctx.lineTo(0, groundY); ctx.closePath(); ctx.fill();
    }

    // rocky ground
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#c0a878'); gr.addColorStop(1, '#a89060');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);

    // scattered pebbles
    ctx.fillStyle = 'rgba(140,110,70,.2)';
    for (let i = 0; i < 20; i++){
      const px = (i * 53 + 7) % W, py = groundY + 3 + (i * 31) % (H - groundY - 6);
      ctx.beginPath(); ctx.arc(px, py, 1.5 + (i % 3), 0, 7); ctx.fill();
    }

    // dig site — a small excavation pit
    const pitX = W * 0.40, pitY = groundY + 2;
    ctx.fillStyle = '#a08050';
    ctx.beginPath();
    ctx.moveTo(pitX - 35, pitY); ctx.quadraticCurveTo(pitX, pitY + 14, pitX + 35, pitY);
    ctx.lineTo(pitX + 30, pitY - 3); ctx.quadraticCurveTo(pitX, pitY + 8, pitX - 30, pitY - 3);
    ctx.closePath(); ctx.fill();
    // dig edge shadow
    ctx.strokeStyle = 'rgba(80,60,30,.2)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pitX - 30, pitY - 3); ctx.quadraticCurveTo(pitX, pitY + 8, pitX + 30, pitY - 3);
    ctx.stroke();

    // small tools on ground
    // brush
    ctx.fillStyle = '#8a6840';
    ctx.fillRect(pitX + 20, pitY + 2, 12, 2);
    ctx.fillStyle = '#c0a060';
    ctx.fillRect(pitX + 30, pitY + 1, 5, 4);
    // pick/hammer
    ctx.fillStyle = '#6a5030';
    ctx.save(); ctx.translate(pitX - 25, pitY + 4); ctx.rotate(-0.4);
    ctx.fillRect(0, 0, 14, 2);
    ctx.fillStyle = '#888';
    ctx.fillRect(12, -2, 5, 6);
    ctx.restore();
  }

  // draw the fossil embedded in rock
  function drawFossil(cx, cy, revealed){
    if (!revealed) return;
    // rock slab
    ctx.fillStyle = '#b09868';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,30,.3)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.stroke();
    // fossil imprint — simple ammonite spiral
    ctx.strokeStyle = '#705830'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.2){
      const r = 2 + a * 1.4;
      const fx = cx + Math.cos(a) * r;
      const fy = cy + Math.sin(a) * r * 0.7;
      if (a === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
    }
    ctx.stroke();
    // highlight
    ctx.fillStyle = 'rgba(255,240,200,.15)';
    ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 8, 0, 7); ctx.fill();
  }

  const fossilX = W * 0.36, fossilY = groundY + 6;

  return {
    id: 'fossil_discovery',
    chars: ['krystal', 'luke', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Digging in rock. Luke brushes dirt away carefully (inspect).
      { dur: 2.2, draw(cs){
          drawBg(cs);
          drawFossil(fossilX, fossilY, false);
          csDrawExpression('luke', 'inspect', lukeX, fY, charH);
          csDrawExpression('krystal', 'search', krystalX, fY, charH);
          csDrawExpression('luna', 'beckon', lunaX, fY, charH);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Hold on, there\u2019s something here\u2026 🪨');
      }},
      // Step 2: Luna asks. Luke reveals: "A fossil!" (surprised + point)
      { dur: 2.6, draw(cs){
          drawBg(cs);
          drawFossil(fossilX, fossilY, true);
          csDrawExpression('luna', 'talk', lunaX, fY, charH);
          if (cs.stepT < 1.2){
            csDrawExpression('luke', 'surprised', lukeX, fY, charH);
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'What is it?! Let me see! 👀');
          } else {
            csDrawExpression('luke', 'point', lukeX, fY, charH);
            csDrawExpression('krystal', 'wave', krystalX, fY, charH);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'A fossil! A real one! 🦴✨');
          }
      }},
      // Step 3: Krystal examines it (inspect). "Millions of years old..."
      { dur: 2.4, draw(cs){
          drawBg(cs);
          drawFossil(fossilX, fossilY, true);
          csDrawExpression('krystal', 'inspect', krystalX, fY, charH);
          csDrawExpression('luke', 'nod', lukeX, fY, charH);
          csDrawExpression('luna', 'scared', lunaX, fY, charH);
          if (cs.stepT < 1.3){
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'It\u2019s millions of years old\u2026 🌍');
          } else {
            csDrawBubble(lunaX, fY - charH - 4, 'Luna', 'That\u2019s older than grandma\u2019s couch! 😳');
          }
      }},
      // Step 4: All three think, then cheer. Science moment!
      { dur: 2.8, draw(cs){
          drawBg(cs);
          drawFossil(fossilX, fossilY, true);
          if (cs.stepT < 1.2){
            csDrawExpression('krystal', 'think', krystalX, fY, charH);
            csDrawExpression('luke', 'think', lukeX, fY, charH);
            csDrawExpression('luna', 'shake', lunaX, fY, charH);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Imagine what it saw\u2026 🤔');
          } else {
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('luke', 'cheer', lukeX, fY, charH);
            csDrawExpression('luna', 'laugh', lunaX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'SCIENCE! 🔬🎉');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
          csHearts(cs, lukeX, fY - charH * 0.7, 3);
          csHearts(cs, lunaX, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* ============================================================================
   GENERIC CUTSCENES  —  work on any scene using the current background
   ============================================================================ */
const CS_ALL_CHARS = ['paul', 'luna', 'wade', 'luke', 'william'];

function csPickCompanion(exclude){
  const pool = CS_ALL_CHARS.filter(c => !exclude || !exclude.includes(c));
  return pool[Math.floor(Math.random() * pool.length)];
}

function csCurrentBg(){
  const scene = SCENES[currentScene];
  const draw = SCENE_RENDERERS[scene];
  if (draw) draw();
  else { ctx.fillStyle = '#4a6a5a'; ctx.fillRect(0,0,W,H); }
}

/* 1) Thinking Out Loud */
function csGenThinkingOutLoud(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;
  return {
    id: 'gen_thinking_out_loud',
    chars: ['krystal'],
    skipable: true,
    steps: [
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'think', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'I wonder what Paul is up to right now...');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'talk', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "He's probably thinking about me too \u{1F49B}");
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* 2) Friendly Wave */
function csGenFriendlyWave(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.40;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const greetings = [
    "Hey Krystal! How's it going?",
    "There you are! I was looking for you!",
    "Krystal! Guess what?",
    "Oh hey! Fancy meeting you here!",
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  let friendX = W + 40; // start off-screen right

  return {
    id: 'gen_friendly_wave',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          // friend walks in from right
          const progress = Math.min(1, cs.stepT / 1.5);
          friendX = W + 40 - (W + 40 - W * 0.62) * progress;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, friendX, fY, 'left', charH, frame);
          csDrawChar('krystal', kx, fY, 'right', charH, 0);
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'wave', W * 0.62, fY, charH);
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(W * 0.62, fY - charH - 4, friendName, greeting);
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          // friend walks out right
          const progress = Math.min(1, cs.stepT / 2.0);
          friendX = W * 0.62 + (W + 40 - W * 0.62) * progress;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, friendX, fY, 'right', charH, frame);
          csDrawExpression('krystal', 'wave', kx, fY, charH);
      }},
    ]
  };
}

/* 3) Found Something */
function csGenFoundSomething(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;
  const trinkets = [
    { emoji: '\u{1F41A}', name: 'a pretty shell' },
    { emoji: '\u{1F343}', name: 'a four-leaf clover' },
    { emoji: '\u2B50', name: 'a shiny pebble' },
    { emoji: '\u{1F48E}', name: 'something sparkly' },
    { emoji: '\u{1F52E}', name: 'a little marble' },
  ];
  const trinket = trinkets[Math.floor(Math.random() * trinkets.length)];

  return {
    id: 'gen_found_something',
    chars: ['krystal'],
    skipable: true,
    steps: [
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'search', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Hmm, what\u2019s that over there?');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'inspect', kx, fY, charH);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Oh! I found ' + trinket.name + '! ' + trinket.emoji);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "I'll keep this forever!");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 4) Missing Paul */
function csGenMissingPaul(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;

  return {
    id: 'gen_missing_paul',
    chars: ['krystal'],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'search', kx, fY, charH);
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sad', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'I miss Paul...');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'think', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Wait... I just remembered something he said...');
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Hehe, he always makes me smile \u{1F49B}');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 6);
      }},
    ]
  };
}

/* 5) Dance Break */
function csGenDanceBreak(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.38;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);

  return {
    id: 'gen_dance_break',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawChar(friend, W * 0.62, fY, 'left', charH, 0);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "I can't help it, I gotta dance!");
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          const frame = Math.floor(cs.stepT * 5) % 4;
          csDrawExpression('krystal', 'cheer', kx, fY, charH, frame);
          csDrawExpression(friend, 'cheer', W * 0.62, fY, charH, frame);
          csDrawBubble(W * 0.62, fY - charH - 4, friendName, "Wait for me! \u{1F3B6}");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
          csHearts(cs, W * 0.62, fY - charH * 0.7, 3);
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawExpression(friend, 'laugh', W * 0.62, fY, charH);
      }},
    ]
  };
}

/* 6) Photo Moment */
function csGenPhotoMoment(){
  const charH = 80, fY = H * 0.72 + 10;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const kx = W * 0.42, fx = W * 0.58;

  return {
    id: 'gen_photo_moment',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'talk', kx, fY, charH);
          csDrawChar(friend, fx, fY, 'left', charH, 0);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "Let's take a picture together!");
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'wave', kx, fY, charH);
          csDrawExpression(friend, 'cheer', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, null, '3... 2... 1...');
      }},
      { dur: 2.2, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend, 'wave', fx, fY, charH);
          // camera flash effect
          if (cs.stepT < 0.25){
            const flash = Math.max(0, 1 - cs.stepT / 0.25);
            ctx.fillStyle = `rgba(255,255,255,${(flash * 0.8).toFixed(2)})`;
            ctx.fillRect(0, 0, W, H);
          }
          if (cs.stepT > 0.6){
            csDrawBubble(fx, fY - charH - 4, friendName, "That's a keeper! \u{1F4F8}");
          }
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
          csHearts(cs, kx, fY - charH * 0.7, 4);
          csHearts(cs, fx, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 7) Sharing Snack */
function csGenSharingSnack(){
  const charH = 80, fY = H * 0.72 + 10;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const kx = W * 0.42, fx = W * 0.58;
  const snacks = ['a cookie \u{1F36A}', 'some candy \u{1F36C}', 'a cupcake \u{1F9C1}', 'a donut \u{1F369}'];
  const snack = snacks[Math.floor(Math.random() * snacks.length)];

  return {
    id: 'gen_sharing_snack',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'beckon', fx, fY, charH);
          csDrawChar('krystal', kx, fY, 'right', charH, 0);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Hey Krystal, want ' + snack + '?');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawExpression(friend, 'nod', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'For me? Really?!');
      }},
      { dur: 2.2, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend, 'cheer', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "Yay! You're the best! \u{1F49B}");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* 8) Cloud Pointing */
function csGenCloudPointing(){
  const charH = 80, fY = H * 0.72 + 10;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const kx = W * 0.42, fx = W * 0.58;
  const shapes = ['a cookie', 'a bunny', 'a heart', 'a dinosaur', 'a puppy'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  return {
    id: 'gen_cloud_pointing',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'point', kx, fY, charH);
          csDrawChar(friend, fx, fY, 'left', charH, 0);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Look up there! See that cloud?');
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'point', kx, fY, charH);
          csDrawExpression(friend, 'think', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Hmm, which one?');
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend, 'laugh', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'That one looks like ' + shape + '! \u{1F602}');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 9) Humming a Tune */
function csGenHummingTune(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;

  return {
    id: 'gen_humming_tune',
    chars: ['krystal'],
    skipable: true,
    steps: [
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', '\u266a La la laaa~ \u266b');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'talk', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "Paul taught me this one...");
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', '\u266b Hmm hmm hmmm~ \u266a');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 10) Stretching */
function csGenStretching(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;

  return {
    id: 'gen_stretching',
    chars: ['krystal'],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'shrug', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', '*biiiig stretch*');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "Ahhh, that's better!");
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'nod', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Okay, ready for anything! \u{1F4AA}');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 11) High Five */
function csGenHighFive(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.42;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  let friendX = W + 40;

  return {
    id: 'gen_high_five',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.8, draw(cs){
          csCurrentBg();
          const progress = Math.min(1, cs.stepT / 1.3);
          friendX = W + 40 - (W + 40 - W * 0.58) * progress;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, friendX, fY, 'left', charH, frame);
          csDrawExpression('krystal', 'look', kx, fY, charH);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'highfive', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'highfive', kx, fY, charH);
          csDrawBubble(W * 0.50, fY - charH - 4, null, 'High five! ✋');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const progress = Math.min(1, cs.stepT / 1.5);
          friendX = W * 0.58 + (W + 40 - W * 0.58) * progress;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, friendX, fY, 'right', charH, frame);
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "Yeah! \uD83D\uDE0E");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 12) Delivery */
function csGenDelivery(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.40;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  let friendX = W + 40;

  return {
    id: 'gen_delivery',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const progress = Math.min(1, cs.stepT / 1.5);
          friendX = W + 40 - (W + 40 - W * 0.62) * progress;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, friendX, fY, 'left', charH, frame);
          csDrawChar('krystal', kx, fY, 'right', charH, 0);
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'carry', W * 0.62, fY, charH);
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawBubble(W * 0.62, fY - charH - 4, friendName, 'Special delivery for you! \uD83D\uDCE6');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'give', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'For me?! What is it??');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'laugh', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "I love it!! Thank you!! \uD83D\uDC9B");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 6);
      }},
    ]
  };
}

/* 13) Sneaking Up */
function csGenSneakingUp(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.40;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);

  return {
    id: 'gen_sneaking_up',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const progress = Math.min(1, cs.stepT / 1.8);
          const fx = W + 40 - (W + 40 - W * 0.62) * progress;
          csDrawExpression(friend, 'sneak', fx, fY, charH);
          csDrawExpression('krystal', 'think', kx, fY, charH);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'sneak', W * 0.62, fY, charH);
          csDrawExpression('krystal', 'look', kx, fY, charH);
          if (cs.stepT > 0.8){
            csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Huh? Is someone there...?');
          }
      }},
      { dur: 1.2, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'cheer', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'startled', kx, fY, charH);
          csDrawBubble(W * 0.58, fY - charH - 4, friendName, 'BOO! \uD83D\uDC7B');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'laugh', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'You got me!! \uD83D\uDE02');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 14) Nap Time */
function csGenNapTime(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.42;
  const friend = csPickCompanion();

  return {
    id: 'gen_nap_time',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'shrug', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', '*yaaawn* So sleepy...');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sit', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Just gonna rest my eyes...');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sleep', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, null, 'z z z \uD83D\uDCA4');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sleep', kx, fY, charH);
          const progress = Math.min(1, cs.stepT / 1.2);
          const fx = W + 40 - (W + 40 - W * 0.58) * progress;
          csDrawExpression(friend, 'sneak', fx, fY, charH);
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sleep', kx, fY, charH);
          csDrawExpression(friend, 'give', W * 0.55, fY, charH);
          csDrawBubble(W * 0.55, fY - charH - 4, null, '*tucks blanket* \uD83E\uDDE1');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* 15) Trip and Catch */
function csGenTripAndCatch(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.42;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);

  return {
    id: 'gen_trip_and_catch',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar('krystal', kx, fY, 'right', charH, frame);
          csDrawChar(friend, W * 0.62, fY, 'left', charH, 0);
      }},
      { dur: 1.2, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'trip', kx, fY, charH);
          csDrawExpression(friend, 'startled', W * 0.60, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Whoa—!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'pull', W * 0.55, fY, charH);
          csDrawExpression('krystal', 'interact', kx, fY, charH);
          csDrawBubble(W * 0.55, fY - charH - 4, friendName, 'Gotcha!');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'embarrassed', kx, fY, charH);
          csDrawExpression(friend, 'laugh', W * 0.58, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'That was so embarrassing... \uD83D\uDE33');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 16) Group Hug */
function csGenGroupHug(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;
  const friend1 = csPickCompanion();
  const friend2 = csPickCompanion([friend1]);
  const name1 = friend1.charAt(0).toUpperCase() + friend1.slice(1);
  const name2 = friend2.charAt(0).toUpperCase() + friend2.slice(1);

  return {
    id: 'gen_group_hug',
    chars: ['krystal', friend1, friend2],
    skipable: true,
    steps: [
      { dur: 1.8, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.5);
          const f1x = -40 + (W * 0.32 + 40) * p;
          const f2x = W + 40 - (W + 40 - W * 0.68) * p;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend1, f1x, fY, 'right', charH, frame);
          csDrawChar(friend2, f2x, fY, 'left', charH, frame);
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'hug', W * 0.38, fY, charH);
          csDrawExpression('krystal', 'hug', kx, fY, charH);
          csDrawExpression(friend2, 'hug', W * 0.62, fY, charH);
          csDrawBubble(kx, fY - charH - 4, null, 'GROUP HUG!! 🤗');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.2, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'cheer', W * 0.35, fY, charH);
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend2, 'cheer', W * 0.65, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'I love you guys!! 💛');
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 8);
      }},
    ]
  };
}

/* 17) Show and Tell */
function csGenShowAndTell(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.40;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);

  return {
    id: 'gen_show_and_tell',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.5);
          const fx = W + 40 - (W + 40 - W * 0.62) * p;
          const frame = Math.floor(cs.stepT * 4) % 4;
          csDrawChar(friend, fx, fY, 'left', charH, frame);
          csDrawExpression('krystal', 'look', kx, fY, charH);
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'carry', W * 0.62, fY, charH);
          csDrawExpression('krystal', 'look', kx, fY, charH);
          csDrawBubble(W * 0.62, fY - charH - 4, friendName, 'Check out what I found! ✨');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'point', W * 0.60, fY, charH);
          csDrawExpression('krystal', 'inspect', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Oooh, let me see...');
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'cheer', W * 0.58, fY, charH);
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', "That's amazing!! 🤩");
      }, onStart(cs){
          csHearts(cs, kx, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 18) Racing */
function csGenRacing(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.35;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.55;

  return {
    id: 'gen_racing',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'crouch', kx, fY, charH);
          csDrawExpression(friend, 'crouch', fx, fY, charH);
          csDrawBubble(W * 0.45, fY - charH - 4, null, 'Ready... set...');
      }},
      { dur: 1.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'crouch', kx, fY, charH);
          csDrawExpression(friend, 'crouch', fx, fY, charH);
          csDrawBubble(W * 0.45, fY - charH - 4, null, 'GO!! 🏁');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 2.2);
          const kRunX = kx + (W * 0.85 - kx) * p;
          const fRunX = fx + (W * 0.88 - fx) * p;
          const frame = Math.floor(cs.stepT * 6) % 4;
          csDrawChar('krystal', kRunX, fY, 'right', charH, frame);
          csDrawChar(friend, fRunX, fY, 'right', charH, frame);
      }},
      { dur: 2.2, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', W * 0.42, fY, charH);
          csDrawExpression(friend, 'laugh', W * 0.58, fY, charH);
          csDrawBubble(W * 0.50, fY - charH - 4, null, 'Photo finish!! 😂');
      }, onStart(cs){
          csHearts(cs, W * 0.50, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 19) Pushing a Door */
function csGenPushingDoor(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.38;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const doorX = W * 0.50;

  return {
    id: 'gen_pushing_door',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'push', kx, fY, charH);
          csDrawExpression(friend, 'pull', W * 0.62, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Nngh... it won\'t budge!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'push', kx, fY, charH);
          csDrawExpression(friend, 'pull', W * 0.62, fY, charH);
          csDrawBubble(W * 0.62, fY - charH - 4, friendName, 'Pull harder!!');
      }},
      { dur: 1.2, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'trip', kx + 15, fY, charH);
          csDrawExpression(friend, 'trip', W * 0.65, fY, charH);
          csDrawBubble(doorX, fY - charH - 4, null, '*WHOOSH!* 💨');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawExpression(friend, 'laugh', W * 0.62, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'We did it!! 😂');
      }, onStart(cs){
          csHearts(cs, doorX, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 20) Looking for Something */
function csGenLookingFor(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.38;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.62;

  return {
    id: 'gen_looking_for',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'search', kx, fY, charH);
          csDrawExpression(friend, 'search', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Where did it go...? 🔍');
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'look', kx - 20, fY, charH);
          csDrawExpression(friend, 'crouch', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Let me check under here...');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'crouch', kx, fY, charH);
          csDrawExpression(friend, 'surprised', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Wait— I found it!!');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend, 'cheer', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'YESSS!! You found it!! 🎉');
      }, onStart(cs){
          csHearts(cs, W * 0.50, fY - charH * 0.7, 6);
      }},
    ]
  };
}

/* 21) Secret Handshake */
function csGenSecretHandshake(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.38;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.58;

  return {
    id: 'gen_secret_handshake',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'highfive', kx, fY, charH);
          csDrawExpression(friend, 'highfive', fx, fY, charH);
          csDrawBubble(W * 0.48, fY - charH - 4, null, '✋ Slap!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'interact', kx, fY, charH);
          csDrawExpression(friend, 'interact', fx, fY, charH);
          csDrawBubble(W * 0.48, fY - charH - 4, null, 'Wiggle wiggle~');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'wave', kx, fY, charH);
          csDrawExpression(friend, 'wave', fx, fY, charH);
          csDrawBubble(W * 0.48, fY - charH - 4, null, 'Jazz hands!! ✨');
      }},
      { dur: 1.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'embarrassed', kx, fY, charH);
          csDrawExpression(friend, 'embarrassed', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Wait... that wasn\'t right 😅');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawExpression(friend, 'laugh', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Close enough!! 😂');
      }, onStart(cs){
          csHearts(cs, W * 0.48, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 22) Piggyback Ride */
function csGenPiggybackRide(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.45;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.45;

  return {
    id: 'gen_piggyback_ride',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'crouch', fx, fY, charH);
          csDrawExpression('krystal', 'cheer', kx + 5, fY - charH * 0.3, charH * 0.8);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Hop on!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'carry', fx, fY, charH);
          csDrawExpression('krystal', 'cheer', kx + 5, fY - charH * 0.5, charH * 0.8);
          csDrawBubble(kx, fY - charH * 1.4, 'Krystal', 'Wheeee!! 🎉');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.8);
          const runX = fx + (W * 0.75 - fx) * p;
          const frame = Math.floor(cs.stepT * 6) % 4;
          csDrawChar(friend, runX, fY, 'right', charH, frame);
          csDrawChar('krystal', runX + 5, fY - charH * 0.5, 'right', charH * 0.8, frame);
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', W * 0.65, fY, charH);
          csDrawExpression(friend, 'cheer', W * 0.50, fY, charH);
          csDrawBubble(W * 0.57, fY - charH - 4, null, 'That was awesome!! 🤩');
      }, onStart(cs){
          csHearts(cs, W * 0.57, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* 23) Gift Giving */
function csGenGiftGiving(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.55;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.35;

  return {
    id: 'gen_gift_giving',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'look', kx, fY, charH);
          csDrawExpression(friend, 'sneak', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Hey Krystal, close your eyes~');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'think', kx, fY, charH);
          csDrawExpression(friend, 'give', fx + 15, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Okay... open! 🎁');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'surprised', kx, fY, charH);
          csDrawExpression(friend, 'cheer', fx + 15, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'No way!! For me?! 😮');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'hug', kx - 10, fY, charH);
          csDrawExpression(friend, 'hug', fx + 20, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Thank you so much!! 💕');
      }, onStart(cs){
          csHearts(cs, W * 0.45, fY - charH * 0.7, 6);
      }},
    ]
  };
}

/* 24) Sitting Together */
function csGenSittingTogether(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.52;
  const px = W * 0.42;

  return {
    id: 'gen_sitting_together',
    chars: ['krystal', 'paul'],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sit', kx, fY, charH);
          csDrawExpression('paul', 'sit', px, fY, charH);
          csDrawBubble(W * 0.47, fY - charH - 4, null, '...');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'sit', kx, fY, charH);
          csDrawExpression('paul', 'sit', px, fY, charH);
          csDrawBubble(px, fY - charH - 4, 'Paul', 'This is nice.');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('paul', 'hug', px + 5, fY, charH);
          csDrawExpression('krystal', 'sit', kx - 5, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Mmhm... 💗');
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression('paul', 'sit', px + 5, fY, charH);
          csDrawExpression('krystal', 'sleep', kx - 8, fY, charH);
          csDrawBubble(W * 0.47, fY - charH - 4, null, '💤');
      }, onStart(cs){
          csHearts(cs, W * 0.47, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 25) Running Late */
function csGenRunningLate(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.25;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.65;

  return {
    id: 'gen_running_late',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.8, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.5);
          const runX = kx + (W * 0.45 - kx) * p;
          const frame = Math.floor(cs.stepT * 6) % 4;
          csDrawChar('krystal', runX, fY, 'right', charH, frame);
          csDrawExpression(friend, 'look', fx, fY, charH);
          csDrawBubble(runX, fY - charH - 4, 'Krystal', 'Wait for meee!! 😫');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'trip', W * 0.48, fY, charH);
          csDrawExpression(friend, 'startled', fx, fY, charH);
          csDrawBubble(W * 0.48, fY - charH - 4, 'Krystal', 'WHOA—!! 💥');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'pull', fx - 15, fY, charH);
          csDrawExpression('krystal', 'scared', W * 0.48, fY, charH);
          csDrawBubble(fx - 15, fY - charH - 4, friendName, 'Gotcha! You okay?');
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', W * 0.48, fY, charH);
          csDrawExpression(friend, 'cheer', fx, fY, charH);
          csDrawBubble(W * 0.53, fY - charH - 4, null, 'We made it!! 🎉');
      }, onStart(cs){
          csHearts(cs, W * 0.53, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 26) Compliment Chain */
function csGenComplimentChain(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.48;
  const friend1 = csPickCompanion();
  const friend1Name = friend1.charAt(0).toUpperCase() + friend1.slice(1);
  const f1x = W * 0.30;
  const friend2 = csPickCompanion(friend1);
  const friend2Name = friend2.charAt(0).toUpperCase() + friend2.slice(1);
  const f2x = W * 0.68;

  return {
    id: 'gen_compliment_chain',
    chars: ['krystal', friend1, friend2],
    skipable: true,
    steps: [
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'talk', f1x, fY, charH);
          csDrawExpression('krystal', 'look', kx, fY, charH);
          csDrawBubble(f1x, fY - charH - 4, friend1Name, 'You look amazing today, Krystal! ✨');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'cheer', f1x, fY, charH);
          csDrawExpression('krystal', 'embarrassed', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Oh stop... 😊');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'nod', f1x, fY, charH);
          csDrawExpression('krystal', 'talk', kx, fY, charH);
          csDrawExpression(friend2, 'look', f2x, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Hey ' + friend2Name + '! You\'re the best! 💖');
      }},
      { dur: 2.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend1, 'cheer', f1x, fY, charH);
          csDrawExpression('krystal', 'point', kx, fY, charH);
          csDrawExpression(friend2, 'embarrassed', f2x, fY, charH);
          csDrawBubble(f2x, fY - charH - 4, friend2Name, 'Aww!! Compliment chain! 🥰');
      }, onStart(cs){
          csHearts(cs, W * 0.50, fY - charH * 0.7, 5);
      }},
    ]
  };
}

/* 27) Doorway Scare */
function csGenDoorwayScare(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.55;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.35;

  return {
    id: 'gen_doorway_scare',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'doorway', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, null, '...');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'doorway', fx, fY, charH);
          csDrawExpression('krystal', 'startled', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'AAHH!! 😱');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'laugh', fx, fY, charH);
          csDrawExpression('krystal', 'shake', kx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Not funny!! 😤');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'laugh', fx, fY, charH);
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawBubble(W * 0.45, fY - charH - 4, null, 'Okay... maybe a little 😂');
      }, onStart(cs){
          csHearts(cs, W * 0.45, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 28) Arm Wrestling */
function csGenArmWrestling(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.52;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.38;

  return {
    id: 'gen_arm_wrestling',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'interact', kx, fY, charH);
          csDrawExpression(friend, 'interact', fx, fY, charH);
          csDrawBubble(W * 0.45, fY - charH - 4, null, 'Arm wrestling! 💪');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'push', kx - 3, fY, charH);
          csDrawExpression(friend, 'push', fx + 3, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Nnngh...!!');
          csDrawBubble(fx, fY - charH * 1.3, friendName, 'No way...!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'cheer', kx, fY, charH);
          csDrawExpression(friend, 'embarrassed', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'I WIN!! 🏆');
      }, onStart(cs){
          try{ sfx('tap'); }catch(e){}
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'highfive', kx - 5, fY, charH);
          csDrawExpression(friend, 'highfive', fx + 5, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Good game... rematch later! 😅');
      }, onStart(cs){
          csHearts(cs, W * 0.45, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* 29) Looking Up */
function csGenLookingUp(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.50;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.38;

  return {
    id: 'gen_looking_up',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'look', kx, fY, charH);
          csDrawExpression(friend, 'look', fx, fY, charH);
          csDrawBubble(kx, fY - charH - 4, 'Krystal', 'Wait... what IS that? 🤔');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'point', kx, fY, charH);
          csDrawExpression(friend, 'point', fx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Up there! You see it too?!');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'shrug', kx, fY, charH);
          csDrawExpression(friend, 'shrug', fx, fY, charH);
          csDrawBubble(W * 0.44, fY - charH - 4, null, '...it\'s just a cloud ☁️');
      }},
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'laugh', kx, fY, charH);
          csDrawExpression(friend, 'laugh', fx, fY, charH);
          csDrawBubble(W * 0.44, fY - charH - 4, null, 'We\'re both ridiculous 😂');
      }, onStart(cs){
          csHearts(cs, W * 0.44, fY - charH * 0.7, 3);
      }},
    ]
  };
}

/* 30) Sharing Umbrella */
function csGenSharingUmbrella(){
  const charH = 80, fY = H * 0.72 + 10;
  const kx = W * 0.25;
  const friend = csPickCompanion();
  const friendName = friend.charAt(0).toUpperCase() + friend.slice(1);
  const fx = W * 0.60;

  return {
    id: 'gen_sharing_umbrella',
    chars: ['krystal', friend],
    skipable: true,
    steps: [
      { dur: 1.5, draw(cs){
          csCurrentBg();
          csDrawExpression(friend, 'beckon', fx, fY, charH);
          csDrawExpression('krystal', 'look', kx, fY, charH);
          csDrawBubble(fx, fY - charH - 4, friendName, 'Over here! I have an umbrella! ☂️');
      }},
      { dur: 1.8, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.5);
          const runX = kx + (fx - 10 - kx) * p;
          const frame = Math.floor(cs.stepT * 6) % 4;
          csDrawChar('krystal', runX, fY, 'right', charH, frame);
          csDrawExpression(friend, 'beckon', fx, fY, charH);
      }},
      { dur: 1.7, draw(cs){
          csCurrentBg();
          csDrawExpression('krystal', 'nod', fx - 12, fY, charH);
          csDrawExpression(friend, 'talk', fx, fY, charH);
          csDrawBubble(fx - 6, fY - charH - 4, 'Krystal', 'Thank you! You\'re the best 💕');
      }},
      { dur: 2.0, draw(cs){
          csCurrentBg();
          const p = Math.min(1, cs.stepT / 1.8);
          const walkX = fx + (W * 0.80 - fx) * p;
          csDrawExpression('krystal', 'talk', walkX - 12, fY, charH);
          csDrawExpression(friend, 'nod', walkX, fY, charH);
          csDrawBubble(walkX - 6, fY - charH - 4, null, 'Let\'s go! 🌧️');
      }, onStart(cs){
          csHearts(cs, fx, fY - charH * 0.7, 4);
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 38: ARCADE HIGH SCORE  (triggers at arcade, candyfactory, bowling)
   Interactive: mash-tap during a window to boost Krystal's score.
   ============================================================================ */
function csArcadeHighScore(){
  const groundY = H * 0.70, charH = 80, fY = groundY + 10;
  const krystalX = W * 0.38, lukeX = W * 0.62;
  let taps = 0, tapPhaseActive = false;

  function drawBg(cs){
    const t = cs.totalT;
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#1a1230'); wall.addColorStop(0.5, '#241840'); wall.addColorStop(1, '#2e2048');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);
    const fl = ctx.createLinearGradient(0, groundY, 0, H);
    fl.addColorStop(0, '#3a2a50'); fl.addColorStop(1, '#2a1a40');
    ctx.fillStyle = fl; ctx.fillRect(0, groundY, W, H - groundY);
    const glowCols = ['#ff3080','#30ff80','#3080ff','#ffff30'];
    for (let i = 0; i < 4; i++){
      const nx = W * 0.1 + i * W * 0.25;
      ctx.fillStyle = glowCols[i]; ctx.globalAlpha = (0.4 + 0.4 * Math.sin(t * 4 + i * 1.5)) * 0.15;
      ctx.fillRect(nx - 1, 0, 3, groundY);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++){
      const cx = W * 0.12 + i * W * 0.32;
      ctx.fillStyle = '#18102a'; ctx.fillRect(cx - 12, groundY - 55, 24, 55);
      ctx.fillStyle = '#222'; ctx.fillRect(cx - 9, groundY - 50, 18, 14);
      ctx.fillStyle = glowCols[(i + Math.floor(t * 2)) % 4]; ctx.globalAlpha = 0.25;
      ctx.fillRect(cx - 8, groundY - 49, 16, 12); ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 12; i++){
      ctx.fillStyle = glowCols[i % 4]; ctx.globalAlpha = (0.5 + 0.3 * Math.sin(t * 3 + i)) * 0.7;
      ctx.beginPath(); ctx.arc(i * W / 11, 6, 2.5, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTapPrompt(cs){
    if (!tapPhaseActive) return;
    const remaining = 3.5 - cs.stepT;
    const barW = 100, barH = 8, barX = W * 0.5 - barW / 2, barY = H * 0.18;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(barX, barY, barW, barH, 4); ctx.fill();
    const fill = Math.max(0, remaining / 3.5);
    ctx.fillStyle = fill > 0.3 ? '#30ff80' : '#ff3030';
    roundRect(barX, barY, barW * fill, barH, 4); ctx.fill();
    ctx.save();
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(255,255,100,${(0.6 + 0.4 * Math.sin(cs.totalT * 10)).toFixed(2)})`;
    ctx.fillText('TAP! TAP! TAP!', W * 0.5, H * 0.12);
    ctx.font = 'bold 13px "Segoe UI", sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('x' + taps, W * 0.5, H * 0.26);
    ctx.restore();
  }

  return {
    id: 'arcade_high_score',
    chars: ['krystal', 'luke'],
    skipable: true,
    steps: [
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('luke', 'point', lukeX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'This game has a high score \u2014 wanna try?');
      }},
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'nod', krystalX, fY, charH);
          csDrawExpression('luke', 'cheer', lukeX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "You're on! Let's do this! \uD83D\uDCAA");
      }},
      { dur: 3.5, draw(cs){
          drawBg(cs); drawTapPrompt(cs);
          const expr = taps >= 10 ? 'run' : taps >= 4 ? 'interact' : 'inspect';
          csDrawExpression('krystal', expr, krystalX, fY, charH);
          csDrawExpression('luke', 'cheer', lukeX, fY, charH);
      }, onStart(cs){ taps = 0; tapPhaseActive = true; },
         onEnd(cs){ tapPhaseActive = false; },
         onTap(cs, px, py){
          taps++;
          cs.hearts.push({ x: px, y: py, vx: rand(-12,12), vy: rand(-40,-20), life: 0.4, ch: '\u2728' });
      }},
      { dur: 2.8, draw(cs){
          drawBg(cs);
          if (taps >= 10){
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('luke', 'surprised', lukeX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'NEW HIGH SCORE!! \uD83C\uDF1F');
          } else if (taps >= 4){
            csDrawExpression('krystal', 'laugh', krystalX, fY, charH);
            csDrawExpression('luke', 'nod', lukeX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'Not bad! Almost had it!');
          } else {
            csDrawExpression('krystal', 'embarrassed', krystalX, fY, charH);
            csDrawExpression('luke', 'laugh', lukeX, fY, charH);
            csDrawBubble(lukeX, fY - charH - 4, 'Luke', 'Did you even press anything? \uD83D\uDE02');
          }
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, taps >= 10 ? 8 : 3);
      }},
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('luke', 'highfive', lukeX - 10, fY, charH);
          csDrawExpression('krystal', 'highfive', krystalX + 10, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', taps >= 10 ? 'Rematch tomorrow!' : "I'll beat it next time!");
      }, onStart(cs){ csHearts(cs, (krystalX + lukeX) / 2, fY - charH * 0.7, 4); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 39: ENCHANTED GIFT  (triggers at enchantedforest, crystalgrotto, mushroomglade)
   Interactive: tap one of 3 glowing objects to choose a gift.
   ============================================================================ */
function csEnchantedGift(){
  const groundY = H * 0.70, charH = 80, fY = groundY + 10;
  const krystalX = W * 0.35, williamX = W * 0.65;
  let choice = -1, choicePhaseActive = false;
  const gifts = [
    { emoji: '\uD83D\uDC8E', reaction: 'It hums when I hold it\u2026 warm!',          krExpr: 'surprised' },
    { emoji: '\uD83C\uDF38', reaction: "It's glowing! Like a little night-light!", krExpr: 'cheer'     },
    { emoji: '\uD83E\uDEB6', reaction: 'It tickles! And it floats on its own!',    krExpr: 'laugh'     },
  ];
  const optX = [W * 0.22, W * 0.50, W * 0.78], optY = H * 0.38;

  function drawBg(cs){
    const t = cs.totalT;
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#0a1628'); sky.addColorStop(0.4, '#162040'); sky.addColorStop(1, '#1a3030');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);
    for (let i = 0; i < 30; i++){
      const sx = (i * 83 + 11) % W, sy = (i * 41 + 5) % (groundY * 0.5);
      ctx.fillStyle = `rgba(200,220,255,${(0.2 + 0.3 * Math.sin(t * 1.5 + i)).toFixed(2)})`;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.fillStyle = '#0a1a12';
    for (let i = 0; i < 6; i++){
      const tx = i * W / 5 - 10, th = 40 + (i * 13) % 20;
      ctx.beginPath(); ctx.moveTo(tx - 14, groundY + 2); ctx.lineTo(tx, groundY - th);
      ctx.lineTo(tx + 14, groundY + 2); ctx.fill();
    }
    const gr = ctx.createLinearGradient(0, groundY, 0, H);
    gr.addColorStop(0, '#1a3020'); gr.addColorStop(1, '#0e2018');
    ctx.fillStyle = gr; ctx.fillRect(0, groundY, W, H - groundY);
    const mc = ['#60ff90','#40e0a0','#80ffc0'];
    for (let i = 0; i < 5; i++){
      const mx = W * 0.08 + i * W * 0.22, my = groundY + 6;
      ctx.fillStyle = mc[i % 3]; ctx.globalAlpha = 0.15 + 0.1 * Math.sin(t * 2 + i);
      ctx.beginPath(); ctx.arc(mx, my - 3, 4, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#c0c0a0'; ctx.fillRect(mx - 1, my - 3, 2, 5); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++){
      const px = (i * 71 + Math.sin(t * 0.4 + i) * 20) % W;
      const py = groundY * 0.3 + Math.sin(t * 0.8 + i * 1.5) * 20;
      ctx.fillStyle = `rgba(150,255,200,${(0.1 + 0.15 * Math.sin(t * 2 + i * 0.7)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, 7); ctx.fill();
    }
  }

  function drawChoiceUI(cs){
    if (!choicePhaseActive) return;
    const t = cs.totalT;
    ctx.save();
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(220,255,240,0.7)';
    ctx.fillText('Tap one to choose!', W * 0.5, H * 0.26);
    const labels = ['\uD83D\uDC8E Crystal', '\uD83C\uDF38 Flower', '\uD83E\uDEB6 Feather'];
    for (let i = 0; i < 3; i++){
      const bob = Math.sin(t * 2.5 + i * 2.1) * 6;
      ctx.fillStyle = `rgba(180,255,220,${((0.6 + 0.3 * Math.sin(t * 4 + i * 1.2)) * 0.2).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(optX[i], optY + bob, 22, 0, 7); ctx.fill();
      ctx.font = '22px serif'; ctx.fillStyle = '#fff';
      ctx.fillText(gifts[i].emoji, optX[i], optY + bob);
      ctx.font = '9px "Segoe UI", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(labels[i], optX[i], optY + bob + 26);
    }
    ctx.restore();
  }

  return {
    id: 'enchanted_gift',
    chars: ['krystal', 'william'],
    skipable: true,
    steps: [
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('william', 'search', williamX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawBubble(williamX, fY - charH - 4, 'William', 'Whoa, look what the forest left us\u2026');
      }},
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('william', 'point', williamX, fY, charH);
          csDrawExpression('krystal', 'look', krystalX, fY, charH);
          csDrawBubble(williamX, fY - charH - 4, 'William', 'Pick one \u2014 they only glow like this once!');
      }},
      { dur: 5.0, draw(cs){
          drawBg(cs);
          if (choice >= 0){
            csDrawExpression('krystal', 'carry', krystalX, fY, charH);
            csDrawExpression('william', 'nod', williamX, fY, charH);
            ctx.save(); ctx.font = '18px serif'; ctx.textAlign = 'center';
            ctx.fillText(gifts[choice].emoji, krystalX, fY - charH - 8); ctx.restore();
            csDrawBubble(krystalX, fY - charH - 24, 'Krystal', 'This one!');
          } else {
            drawChoiceUI(cs);
            csDrawExpression('krystal', 'think', krystalX, fY, charH);
            csDrawExpression('william', 'look', williamX, fY, charH);
          }
      }, onStart(cs){ choice = -1; choicePhaseActive = true; },
         onEnd(cs){ choicePhaseActive = false; if (choice < 0) choice = Math.floor(Math.random() * 3); },
         onTap(cs, px, py){
          if (choice >= 0) return;
          for (let i = 0; i < 3; i++){
            const dx = px - optX[i], dy = py - optY;
            if (dx * dx + dy * dy < 30 * 30){
              choice = i; choicePhaseActive = false;
              csHearts(cs, optX[i], optY, 5);
              cs.stepT = Math.max(cs.stepT, 3.5);
              return;
            }
          }
      }},
      { dur: 2.8, draw(cs){
          drawBg(cs);
          const g = gifts[Math.max(0, choice)];
          csDrawExpression('krystal', g.krExpr, krystalX, fY, charH);
          csDrawExpression('william', 'laugh', williamX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', g.reaction);
      }, onStart(cs){ csHearts(cs, krystalX, fY - charH * 0.7, 6); }},
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('william', 'give', williamX - 8, fY, charH);
          csDrawExpression('krystal', 'hug', krystalX + 8, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', 'The forest is magic with you here \u2728');
      }, onStart(cs){ csHearts(cs, (krystalX + williamX) / 2, fY - charH * 0.7, 6); }},
    ]
  };
}

/* ============================================================================
   CUTSCENE 40: TOY SHOP RACE  (triggers at toyshop, candyshop, comicshop)
   Interactive: tap at the right moment on a countdown for a wind-up race.
   ============================================================================ */
function csToyShopRace(){
  const groundY = H * 0.70, charH = 80, fY = groundY + 10;
  const krystalX = W * 0.32, wadeX = W * 0.68;
  let goPhaseActive = false, goShown = false, tapTiming = -1;

  function drawBg(cs){
    const t = cs.totalT;
    const wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#f8e8d0'); wall.addColorStop(0.5, '#f0dcc0'); wall.addColorStop(1, '#e8d0b0');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, W, groundY);
    const fl = ctx.createLinearGradient(0, groundY, 0, H);
    fl.addColorStop(0, '#c09060'); fl.addColorStop(1, '#a07848');
    ctx.fillStyle = fl; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++){
      const ly = groundY + i * (H - groundY) / 5;
      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
    }
    for (let row = 0; row < 2; row++){
      const sy = H * 0.10 + row * 28;
      ctx.fillStyle = '#b08050'; ctx.fillRect(W * 0.05, sy, W * 0.9, 3);
      const tc = ['#ff6060','#60a0ff','#60dd60','#ffcc30','#ff80c0'];
      for (let i = 0; i < 6; i++){
        ctx.fillStyle = tc[i % 5];
        ctx.beginPath(); ctx.arc(W * 0.12 + i * W * 0.14, sy - 5, 4 + (i % 3), 0, 7); ctx.fill();
      }
    }
    const warm = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.6);
    warm.addColorStop(0, 'rgba(255,240,200,0.08)'); warm.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = warm; ctx.fillRect(0, 0, W, H);
  }

  function drawRacers(cs, progress){
    const raceY = groundY + 25, startX = W * 0.15, endX = W * 0.85;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(startX, raceY); ctx.lineTo(endX, raceY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333'; ctx.fillRect(endX - 1, raceY - 10, 2, 14);
    ctx.fillStyle = '#fff'; ctx.fillRect(endX, raceY - 10, 6, 5);
    ctx.fillStyle = '#333'; ctx.fillRect(endX + 3, raceY - 10, 3, 5);
    ctx.fillStyle = '#333'; ctx.fillRect(endX, raceY - 5, 3, 5);
    ctx.fillStyle = '#fff'; ctx.fillRect(endX + 3, raceY - 5, 3, 5);
    const kProg = Math.min(1, progress * (tapTiming === 0 ? 1.15 : tapTiming === 2 ? 0.85 : 1.0));
    const kRX = startX + (endX - startX) * kProg;
    ctx.fillStyle = '#e04040'; ctx.fillRect(kRX - 6, raceY - 5, 12, 6);
    ctx.fillStyle = '#c03030';
    ctx.beginPath(); ctx.arc(kRX - 3, raceY + 1, 2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(kRX + 3, raceY + 1, 2, 0, 7); ctx.fill();
    const wProg = Math.min(1, progress * (tapTiming === 0 ? 0.92 : tapTiming === 2 ? 1.1 : 1.02));
    const wRX = startX + (endX - startX) * wProg;
    ctx.fillStyle = '#4060e0'; ctx.fillRect(wRX - 6, raceY + 4, 12, 6);
    ctx.fillStyle = '#3050c0';
    ctx.beginPath(); ctx.arc(wRX - 3, raceY + 10, 2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(wRX + 3, raceY + 10, 2, 0, 7); ctx.fill();
  }

  function drawCountdown(cs){
    if (!goPhaseActive) return;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const el = cs.stepT;
    let label = '', col = '#fff';
    if (el < 1){ label = '3'; col = '#ffcc30'; }
    else if (el < 2){ label = '2'; col = '#ff9030'; }
    else if (el < 3){ label = '1'; col = '#ff5030'; }
    else { label = 'GO!'; col = '#30ff60'; goShown = true; }
    const sc = 1 + 0.15 * Math.sin(cs.totalT * 8);
    ctx.font = `bold ${Math.round(22 * sc)}px "Segoe UI", sans-serif`;
    ctx.fillStyle = col; ctx.fillText(label, W * 0.5, H * 0.15);
    if (el >= 3 && tapTiming < 0){
      ctx.font = '10px "Segoe UI", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Tap NOW!', W * 0.5, H * 0.22);
    }
    if (tapTiming >= 0){
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillStyle = tapTiming === 0 ? '#30ff60' : '#ffcc30';
      ctx.fillText(tapTiming === 0 ? 'PERFECT!' : tapTiming === 1 ? 'Too early!' : 'A bit late!', W * 0.5, H * 0.22);
    }
    ctx.restore();
  }

  return {
    id: 'toy_shop_race',
    chars: ['krystal', 'wade'],
    skipable: true,
    steps: [
      { dur: 2.4, draw(cs){
          drawBg(cs);
          csDrawExpression('wade', 'carry', wadeX, fY, charH);
          csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
          csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'Check it out \u2014 wind-up racers! Wanna go?');
      }},
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'run', krystalX, fY, charH);
          csDrawExpression('wade', 'cheer', wadeX, fY, charH);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Oh you're SO going down! \uD83C\uDFC1");
      }},
      { dur: 4.5, draw(cs){
          drawBg(cs); drawCountdown(cs);
          csDrawExpression('krystal', 'crouch', krystalX, fY, charH);
          csDrawExpression('wade', 'crouch', wadeX, fY, charH);
          drawRacers(cs, 0);
      }, onStart(cs){ goPhaseActive = true; goShown = false; tapTiming = -1; },
         onEnd(cs){ goPhaseActive = false; if (tapTiming < 0) tapTiming = 2; },
         onTap(cs, px, py){
          if (tapTiming >= 0) return;
          if (cs.stepT < 3.0) tapTiming = 1;
          else if (cs.stepT < 3.8) tapTiming = 0;
          else tapTiming = 2;
      }},
      { dur: 3.0, draw(cs){
          drawBg(cs);
          const progress = Math.min(1, cs.stepT / 2.5);
          drawRacers(cs, progress);
          csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
          csDrawExpression('wade', 'cheer', wadeX, fY, charH);
          if (progress > 0.8){
            const winner = tapTiming === 0 ? 'Krystal' : 'Wade';
            csDrawBubble(W * 0.5, fY - charH - 14, null, winner + "'s toy is winning! \uD83C\uDFC1");
          }
      }},
      { dur: 2.8, draw(cs){
          drawBg(cs); drawRacers(cs, 1.0);
          if (tapTiming === 0){
            csDrawExpression('krystal', 'cheer', krystalX, fY, charH);
            csDrawExpression('wade', 'sad', wadeX, fY, charH);
            csDrawBubble(wadeX, fY - charH - 4, 'Wade', 'No way!! Best two out of three?! \uD83D\uDE29');
          } else {
            csDrawExpression('wade', 'cheer', wadeX, fY, charH);
            csDrawExpression('krystal', 'shrug', krystalX, fY, charH);
            csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Okay fine, you got lucky\u2026");
          }
      }, onStart(cs){ csHearts(cs, (krystalX + wadeX) / 2, fY - charH * 0.7, 4); }},
      { dur: 2.2, draw(cs){
          drawBg(cs);
          csDrawExpression('krystal', 'highfive', krystalX + 10, fY, charH);
          csDrawExpression('wade', 'highfive', wadeX - 10, fY, charH);
          csDrawBubble(W * 0.5, fY - charH - 14, null, 'Good race! \uD83E\uDD1D');
      }, onStart(cs){ csHearts(cs, (krystalX + wadeX) / 2, fY - charH * 0.7, 6); }},
    ]
  };
}

const GENERIC_CUTSCENES = [
  csGenThinkingOutLoud,
  csGenFriendlyWave,
  csGenFoundSomething,
  csGenMissingPaul,
  csGenDanceBreak,
  csGenPhotoMoment,
  csGenSharingSnack,
  csGenCloudPointing,
  csGenHummingTune,
  csGenStretching,
  csGenHighFive,
  csGenDelivery,
  csGenSneakingUp,
  csGenNapTime,
  csGenTripAndCatch,
  csGenGroupHug,
  csGenShowAndTell,
  csGenRacing,
  csGenPushingDoor,
  csGenLookingFor,
  csGenSecretHandshake,
  csGenPiggybackRide,
  csGenGiftGiving,
  csGenSittingTogether,
  csGenRunningLate,
  csGenComplimentChain,
  csGenDoorwayScare,
  csGenArmWrestling,
  csGenLookingUp,
  csGenSharingUmbrella,
];

/* ============================================================================
   CUTSCENE CATALOG  —  master list for the journal / checklist UI
   ============================================================================ */
const CUTSCENE_CATALOG = [
  // Scene-specific cutscenes
  { id: 'campfire_story',        name: 'Campfire Story',        description: 'Spooky stories by the campfire.',              scenes: ['campsite'],                               chars: ['krystal','paul','luna'] },
  { id: 'stargazing',            name: 'Stargazing',            description: 'A quiet night under the stars.',               scenes: ['starrymeadow','observatory'],              chars: ['krystal','paul'] },
  { id: 'beach_sunset_picnic',   name: 'Beach Sunset Picnic',   description: 'Golden hour at the beach with friends.',       scenes: ['beach','moonbeach'],                       chars: ['krystal','paul','wade'] },
  { id: 'bakery_mishap',         name: 'Bakery Mishap',         description: 'Flour explosions in the kitchen!',             scenes: ['bakery','gingerbreadkitchen'],              chars: ['krystal','luna'] },
  { id: 'library_ghost',         name: 'Library Ghost',         description: 'Mysterious things in the library...',          scenes: ['library','arcanelibrary'],                  chars: ['krystal','william'] },
  { id: 'aquarium_wonder',       name: 'Aquarium Wonder',       description: 'Marveling at ocean creatures.',                scenes: ['aquarium','aquariumtunnel'],                chars: ['krystal','luke'] },
  { id: 'rainy_day_chat',        name: 'Rainy Day Chat',        description: 'Cozy under the umbrella together.',            scenes: ['rainystreet'],                              chars: ['krystal','paul'] },
  { id: 'flower_crown',          name: 'Flower Crown',          description: 'Flower crowns for everyone!',                  scenes: ['florist','cherryblossom','lavender','peonygarden'], chars: ['krystal','luna','wade'] },
  { id: 'snow_angel_contest',    name: 'Snow Angel Contest',    description: 'Who makes the best snow angel?',               scenes: ['snowycabin','icepond','frozenfalls'],       chars: ['krystal','paul','william'] },
  { id: 'music_jam',             name: 'Music Jam',             description: 'An impromptu band practice.',                  scenes: ['musicroom','recordshop','jazzclub'],        chars: ['krystal','paul','luke','luna'] },
  { id: 'painting_together',     name: 'Painting Together',     description: 'Art class side by side.',                      scenes: ['artstudio','pottery'],                      chars: ['krystal','paul'] },
  { id: 'hide_and_seek',         name: 'Hide and Seek',         description: 'Ready or not, here I come!',                   scenes: ['hedgemaze','topiary','backyard'],            chars: ['krystal','luke','william'] },
  { id: 'tea_party',             name: 'Tea Party',             description: 'Pinkies up, everyone!',                        scenes: ['teahouse','bambootearoom','cafe'],           chars: ['krystal','luna','wade'] },
  { id: 'sunset_balloon_ride',   name: 'Sunset Balloon Ride',   description: 'Floating high above the world.',               scenes: ['balloonride','balloonfest','kitehill'],      chars: ['krystal','paul'] },
  { id: 'cooking_disaster',      name: 'Cooking Disaster',      description: 'When the recipe goes very wrong.',             scenes: ['diner','dumplinghouse','ramenshop'],         chars: ['krystal','wade','william'] },
  { id: 'tide_pool_discovery',   name: 'Tide Pool Discovery',   description: 'Tiny creatures in the tide pools.',            scenes: ['tidepools','coralreef'],                    chars: ['krystal','luke','luna'] },
  { id: 'pillow_fort',           name: 'Pillow Fort',           description: 'Building the ultimate blanket fortress.',      scenes: ['treehouse','sunroom','igloo'],               chars: ['krystal','wade','luke'] },
  { id: 'dance_lesson',          name: 'Dance Lesson',          description: 'One-two-three, one-two-three...',              scenes: ['balletstudio','ballroom'],                   chars: ['krystal','paul'] },
  { id: 'firefly_catching',      name: 'Firefly Catching',      description: 'Chasing tiny lights in the dark.',             scenes: ['fireflies','fireflypier','nightgarden'],     chars: ['krystal','luna','william'] },
  { id: 'magic_show',            name: 'Magic Show',            description: 'Pick a card, any card...',                     scenes: ['magicshop','tarotparlor','wizardtower'],     chars: ['krystal','paul','william'] },
  { id: 'sunset_fishing',        name: 'Sunset Fishing',        description: 'Patience and a good view.',                    scenes: ['fishingdock','marina','river'],              chars: ['krystal','paul','wade'] },
  { id: 'garden_butterflies',    name: 'Garden Butterflies',    description: 'Flutter flutter flutter.',                     scenes: ['butterflydome','greenhouse','sunflowers'],   chars: ['krystal','luna'] },
  { id: 'treasure_hunt',         name: 'Treasure Hunt',         description: 'X marks the spot!',                            scenes: ['canyon','sanddunes','cornmaze'],             chars: ['krystal','paul','wade'] },
  { id: 'cloud_watching',        name: 'Cloud Watching',        description: 'What shapes do you see?',                      scenes: ['alpinemeadow','poppyfield','lavender'],      chars: ['krystal','paul'] },
  { id: 'spooky_mansion',        name: 'Spooky Mansion',        description: 'Was that a ghost?!',                           scenes: ['escaperoom','antiqueshop','darkroom'],       chars: ['krystal','william','luke'] },
  { id: 'snowball_fight',        name: 'Snowball Fight',        description: 'Every snowflake for themselves!',              scenes: ['icepond','frozenfalls','icebergbay'],        chars: ['krystal','paul','luke','william'] },
  { id: 'wishing_well',          name: 'Wishing Well',          description: 'Toss a coin and make a wish.',                 scenes: ['starpool','moontemple','fairyring'],         chars: ['krystal','paul'] },
  { id: 'pet_shop_chaos',        name: 'Pet Shop Chaos',        description: 'Puppies everywhere!',                          scenes: ['petshop','catcafe','aviary'],                chars: ['krystal','luna','wade'] },
  { id: 'karaoke_night',         name: 'Karaoke Night',         description: 'Wade\u2019s solo steals the show.',             scenes: ['jazzclub','recordshop','carnival'],          chars: ['krystal','paul','luna','wade'] },
  { id: 'puddle_jumping',        name: 'Puddle Jumping',        description: 'Splash splash splash!',                        scenes: ['rainystreet','waterfall','river'],           chars: ['krystal','luke','william'] },
  { id: 'constellation_drawing', name: 'Constellation Drawing', description: 'Connecting the dots in the sky.',              scenes: ['observatory','planetarium','aurora'],        chars: ['krystal','paul'] },
  { id: 'lantern_release',       name: 'Lantern Release',       description: 'Wishes floating up to the sky.',               scenes: ['lanternfestival','nightmarket','harbornight'], chars: ['krystal','paul','luna','wade','luke','william'] },
  { id: 'board_game_night',      name: 'Board Game Night',      description: 'Fierce competition and sore losers.',          scenes: ['treehouse','snowycabin','igloo'],            chars: ['krystal','paul','wade','luke'] },
  { id: 'sunrise_yoga',          name: 'Sunrise Yoga',          description: 'Namaste at dawn.',                             scenes: ['beach','alpinemeadow','rooftoppool'],        chars: ['krystal','luna'] },
  { id: 'sandcastle_contest',    name: 'Sandcastle Contest',    description: 'Building kingdoms in the sand.',               scenes: ['beach','moonbeach','driftwoodbeach'],        chars: ['krystal','paul','wade','william'] },
  { id: 'candlelit_dinner',      name: 'Candlelit Dinner',      description: 'A romantic evening for two.',                  scenes: ['cafe','diner','winecellar'],                chars: ['krystal','paul'] },
  { id: 'fossil_discovery',      name: 'Fossil Discovery',      description: 'Ancient treasures in the rock.',               scenes: ['naturalhistory','canyon','cliffs'],          chars: ['krystal','luke','luna'] },
  { id: 'arcade_high_score',    name: 'Arcade High Score',     description: 'Mash buttons for glory! (interactive)',        scenes: ['arcade','candyfactory','bowling'],           chars: ['krystal','luke'] },
  { id: 'enchanted_gift',       name: 'Enchanted Gift',        description: 'The forest offers three gifts. (interactive)', scenes: ['enchantedforest','crystalgrotto','mushroomglade'], chars: ['krystal','william'] },
  { id: 'toy_shop_race',        name: 'Toy Shop Race',         description: 'Wind-up racers on your marks! (interactive)',  scenes: ['toyshop','candyshop','comicshop'],           chars: ['krystal','wade'] },
  // Generic cutscenes
  { id: 'gen_thinking_out_loud', name: 'Thinking Out Loud',     description: 'Krystal daydreaming about Paul.',              scenes: ['any'],  chars: ['krystal'] },
  { id: 'gen_friendly_wave',     name: 'Friendly Wave',         description: 'A friend stops by to say hi.',                 scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_found_something',   name: 'Found Something',       description: 'Krystal finds a little treasure.',             scenes: ['any'],  chars: ['krystal'] },
  { id: 'gen_missing_paul',      name: 'Missing Paul',          description: 'She misses him, but a memory helps.',          scenes: ['any'],  chars: ['krystal'] },
  { id: 'gen_dance_break',       name: 'Dance Break',           description: 'Spontaneous dance party!',                     scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_photo_moment',      name: 'Photo Moment',          description: 'Say cheese!',                                  scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_sharing_snack',     name: 'Sharing Snack',         description: 'A friend shares a treat.',                     scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_cloud_pointing',    name: 'Cloud Pointing',        description: 'That cloud looks like a cookie!',              scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_humming_tune',      name: 'Humming a Tune',        description: 'A song stuck in her head.',                    scenes: ['any'],  chars: ['krystal'] },
  { id: 'gen_stretching',        name: 'Stretching',            description: 'A big stretch before adventure.',              scenes: ['any'],  chars: ['krystal'] },
  { id: 'gen_high_five',         name: 'High Five',             description: 'Up top!',                                      scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_delivery',          name: 'Delivery',              description: 'A surprise package arrives.',                   scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_sneaking_up',       name: 'Sneaking Up',           description: 'BOO! Got you!',                                scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_nap_time',          name: 'Nap Time',              description: 'Sweet dreams and a cozy blanket.',             scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_trip_and_catch',    name: 'Trip and Catch',        description: 'Oops! Nice save though.',                      scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_group_hug',         name: 'Group Hug',            description: 'Everybody pile in!',                           scenes: ['any'],  chars: ['krystal','?','?'] },
  { id: 'gen_show_and_tell',     name: 'Show and Tell',        description: 'Check out this cool thing!',                   scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_racing',            name: 'Racing',               description: 'On your marks... GO!',                         scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_pushing_door',      name: 'Pushing a Door',       description: 'Push! Pull! Teamwork!',                        scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_looking_for',       name: 'Looking for Something',description: 'It has to be here somewhere...',               scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_secret_handshake', name: 'Secret Handshake',     description: 'An elaborate handshake... mostly.',             scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_piggyback_ride',   name: 'Piggyback Ride',       description: 'Giddyup!',                                     scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_gift_giving',      name: 'Gift Giving',          description: 'A surprise just for her.',                      scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_sitting_together', name: 'Sitting Together',     description: 'A peaceful moment side by side.',               scenes: ['any'],  chars: ['krystal','paul'] },
  { id: 'gen_running_late',     name: 'Running Late',         description: 'Almost didn\'t make it!',                       scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_compliment_chain', name: 'Compliment Chain',    description: 'Spreading kindness one compliment at a time.',  scenes: ['any'],  chars: ['krystal','?','?'] },
  { id: 'gen_doorway_scare',    name: 'Doorway Scare',       description: 'BOO from the doorway!',                         scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_arm_wrestling',    name: 'Arm Wrestling',       description: 'Krystal never loses!',                          scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_looking_up',       name: 'Looking Up',          description: 'What IS that up there?',                        scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'gen_sharing_umbrella', name: 'Sharing Umbrella',    description: 'Room for two under here.',                      scenes: ['any'],  chars: ['krystal','?'] },
  { id: 'dance_number',         name: 'The Big Dance Number', description: 'All six on stage — formations, solos, spotlight, confetti finale!', scenes: ['ballroom','balletstudio','jazzclub','carnival'], chars: ['krystal','paul','luna','wade','luke','william'] },
];

/* ============================================================================
   CUTSCENE: DANCE NUMBER  (triggers at ballroom, balletstudio, jazzclub, carnival)
   All 6 characters — elaborate choreographed dance with formations, spotlights,
   musical notes, and a confetti finale. ~25 seconds.
   ============================================================================ */
function csDanceNumber(){
  const charH = 100;
  const stageY = H * 0.82;
  const cx = W / 2;
  // Character positions for formations
  const chars = ['krystal','paul','luna','wade','luke','william'];
  const names = ['Krystal','Paul','Luna','Wade','Luke','William'];

  // Confetti particles
  const confetti = [];
  const confettiColors = ['#ef5350','#4fc3f7','#ffa726','#66bb6a','#ab47bc','#fff176'];

  // Musical notes floating up
  const notes = [];
  const noteChars = ['♪','♫','♬','🎵','🎶'];

  // Spotlight state
  let spotX = cx, spotR = 60;

  function drawStage(cs) {
    const t = cs.totalT;
    // Dark background with colored stage lights
    ctx.fillStyle = '#0a0812';
    ctx.fillRect(0, 0, W, H);

    // Stage floor — polished wood gradient
    const floor = ctx.createLinearGradient(0, H * 0.68, 0, H);
    floor.addColorStop(0, '#3a2a1a');
    floor.addColorStop(0.3, '#4a3a28');
    floor.addColorStop(1, '#2a1a10');
    ctx.fillStyle = floor;
    ctx.fillRect(0, H * 0.68, W, H * 0.32);

    // Stage edge line
    ctx.strokeStyle = '#6a5a4a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H * 0.68); ctx.lineTo(W, H * 0.68); ctx.stroke();

    // Colored stage lights on ceiling — rotating hues
    for (let i = 0; i < 5; i++) {
      const lx = W * (0.1 + i * 0.2);
      const hue = ((t * 30 + i * 72) % 360);
      const glow = ctx.createRadialGradient(lx, 0, 0, lx, H * 0.3, H * 0.4);
      glow.addColorStop(0, `hsla(${hue},70%,60%,.15)`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H * 0.7);
      // Light fixture
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(lx, 6, 6, 0, 7); ctx.fill();
      ctx.fillStyle = `hsl(${hue},70%,60%)`;
      ctx.beginPath(); ctx.arc(lx, 8, 3, 0, 7); ctx.fill();
    }

    // Main spotlight
    const spot = ctx.createRadialGradient(spotX, H * 0.5, 0, spotX, H * 0.5, spotR * 2);
    spot.addColorStop(0, 'rgba(255,250,220,.12)');
    spot.addColorStop(0.5, 'rgba(255,250,220,.04)');
    spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);

    // Floor reflection of spotlight
    ctx.fillStyle = 'rgba(255,250,220,.06)';
    ctx.beginPath(); ctx.ellipse(spotX, stageY + 10, spotR, 12, 0, 0, 7); ctx.fill();

    // Floating musical notes
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    for (const n of notes) {
      ctx.fillStyle = `rgba(255,255,200,${n.a})`;
      ctx.fillText(n.ch, n.x, n.y);
    }

    // Confetti
    for (const c of confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.col;
      ctx.fillRect(-3, -1.5, 6, 3);
      ctx.restore();
    }
  }

  function updateNotes(cs) {
    if (Math.random() < 0.15) {
      notes.push({
        ch: pick(noteChars),
        x: rand(30, W - 30),
        y: H * 0.7,
        vx: rand(-8, 8),
        vy: rand(-30, -50),
        a: 1
      });
    }
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      n.x += n.vx * 0.016;
      n.y += n.vy * 0.016;
      n.a -= 0.012;
      if (n.a <= 0) notes.splice(i, 1);
    }
  }

  function spawnConfetti() {
    for (let i = 0; i < 8; i++) {
      confetti.push({
        x: rand(0, W), y: rand(-20, -60),
        vx: rand(-30, 30), vy: rand(40, 100),
        rot: rand(0, 6.28), vr: rand(-3, 3),
        col: pick(confettiColors), a: 1
      });
    }
  }

  function updateConfetti() {
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx * 0.016; c.y += c.vy * 0.016;
      c.rot += c.vr * 0.016;
      c.vx += rand(-2, 2);
      if (c.y > H + 20) confetti.splice(i, 1);
    }
  }

  // Draw all characters at given positions with expressions
  function drawFormation(positions, expressions) {
    for (let i = 0; i < chars.length; i++) {
      const p = positions[i];
      if (!p) continue;
      const expr = expressions ? expressions[i] : null;
      if (expr) {
        csDrawExpression(chars[i], expr, p.x, p.y, charH);
      } else {
        csDrawChar(chars[i], p.x, p.y, p.dir || 'down', charH, p.frame || 0);
      }
    }
  }

  // Formation generators
  function lineFormation(y, spacing) {
    const startX = cx - (chars.length - 1) * spacing / 2;
    return chars.map((_, i) => ({ x: startX + i * spacing, y }));
  }

  function vFormation(tipX, tipY, spread, depth) {
    return [
      { x: tipX, y: tipY },                           // Krystal at front
      { x: tipX - spread, y: tipY + depth },           // Paul
      { x: tipX + spread, y: tipY + depth },           // Luna
      { x: tipX - spread * 1.8, y: tipY + depth * 2 }, // Wade
      { x: tipX + spread * 1.8, y: tipY + depth * 2 }, // Luke
      { x: tipX, y: tipY + depth * 2.5 },              // William
    ];
  }

  function circleFormation(centerX, centerY, radius, t) {
    return chars.map((_, i) => ({
      x: centerX + Math.cos(t + i * Math.PI * 2 / chars.length) * radius,
      y: centerY + Math.sin(t + i * Math.PI * 2 / chars.length) * radius * 0.4,
    }));
  }

  function pairsFormation(y) {
    return [
      { x: cx - 60, y }, { x: cx - 40, y },   // Krystal + Paul
      { x: cx + 20, y: y + 10 }, { x: cx + 40, y: y + 10 },  // Luna + Wade
      { x: cx - 20, y: y + 20 }, { x: cx + 60, y: y + 20 },  // Luke + William
    ];
  }

  return {
    id: 'dance_number',
    chars: chars,
    skipable: true,
    steps: [
      // Step 1: Curtain up — everyone walks in from the sides (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const p = Math.min(1, cs.stepT / 2);
        const positions = chars.map((_, i) => ({
          x: (i % 2 === 0 ? -40 : W + 40) + (i % 2 === 0 ? 1 : -1) * p * ((i % 2 === 0 ? -40 : W + 40) - (cx - 75 + (i * 30))),
          y: stageY,
        }));
        // Walking animation
        const frame = Math.floor(cs.totalT * 4) % 4;
        for (let i = 0; i < chars.length; i++) {
          const dir = i % 2 === 0 ? 'right' : 'left';
          csDrawChar(chars[i], positions[i].x, positions[i].y, dir, charH, frame);
        }
        spotX = cx; spotR = 100;
        csDrawBubble(cx, H * 0.25, null, '🎶 Places, everyone! 🎶');
      }},

      // Step 2: Line formation — synchronized wave (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const pos = lineFormation(stageY, 50);
        const expressions = chars.map((_, i) => {
          const waveTime = (cs.stepT * 3 - i * 0.3);
          return waveTime > 0 && waveTime < 1.5 ? 'wave' : 'cheer';
        });
        drawFormation(pos, expressions);
        spotX = cx + Math.sin(cs.totalT * 2) * 40;
        csDrawBubble(cx, H * 0.25, 'Krystal', 'Five, six, seven, eight!');
      }},

      // Step 3: V-formation — step forward (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const pos = vFormation(cx, stageY - 30, 45, 20);
        const expressions = ['cheer','point','cheer','wave','laugh','cheer'];
        drawFormation(pos, expressions);
        spotX = cx; spotR = 80;
        csDrawBubble(cx, H * 0.15, 'Paul', 'Follow her lead!');
      }},

      // Step 4: Circle formation — spinning around (4s)
      { dur: 4, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const pos = circleFormation(cx, stageY - 10, 70, cs.totalT * 1.5);
        const expressions = chars.map(() => 'cheer');
        drawFormation(pos, expressions);
        spotX = cx; spotR = 120;
      }},

      // Step 5: Pairs dance — twirling together (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const basePos = pairsFormation(stageY);
        // Add gentle swaying
        const pos = basePos.map((p, i) => ({
          x: p.x + Math.sin(cs.totalT * 3 + i) * 8,
          y: p.y + Math.cos(cs.totalT * 2.5 + i) * 4,
        }));
        const expressions = ['laugh','laugh','cheer','cheer','wave','wave'];
        drawFormation(pos, expressions);
        spotX = cx + Math.sin(cs.totalT * 1.5) * 60;
        csDrawBubble(cx - 50, H * 0.30, 'Luna', 'This is so fun!');
      }},

      // Step 6: Wade does a silly solo in the spotlight (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        // Others in a line in the back, watching
        const backLine = lineFormation(stageY + 10, 44);
        const backExpr = ['laugh','laugh','laugh',null,'laugh','laugh'];
        // Wade in front doing silly moves
        const wadeX = cx + Math.sin(cs.stepT * 4) * 50;
        const wadeExpr = cs.stepT % 1 < 0.3 ? 'trip' : cs.stepT % 1 < 0.6 ? 'cheer' : 'wave';
        for (let i = 0; i < chars.length; i++) {
          if (i === 3) continue; // skip Wade in back line
          csDrawExpression(chars[i], backExpr[i] || 'laugh', backLine[i].x, backLine[i].y, charH);
        }
        csDrawExpression('wade', wadeExpr, wadeX, stageY - 20, charH * 1.1);
        spotX = wadeX; spotR = 70;
        csDrawBubble(wadeX, stageY - charH * 1.1 - 10, 'Wade', 'Watch THIS!');
      }},

      // Step 7: Everyone joins back — big synchronized move (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        const pos = lineFormation(stageY, 48);
        // Synchronized expression changes
        const phase = Math.floor(cs.stepT * 3) % 4;
        const syncExpr = ['cheer','wave','highfive','point'][phase];
        const expressions = chars.map(() => syncExpr);
        drawFormation(pos, expressions);
        spotX = cx; spotR = 140;
        csDrawBubble(cx, H * 0.20, null, '🎵 And a ONE and a TWO! 🎵');
      }},

      // Step 8: Grand finale — V formation + confetti + hearts (3s)
      { dur: 3, draw(cs) {
        drawStage(cs); updateNotes(cs);
        spawnConfetti(); updateConfetti();
        const pos = vFormation(cx, stageY - 20, 50, 18);
        const expressions = chars.map(() => 'cheer');
        drawFormation(pos, expressions);
        spotX = cx; spotR = 160;
        // Hearts burst
        if (cs.stepT < 0.5) {
          csHearts(cs, cx, stageY - 60, 6);
        }
        csDrawBubble(cx, H * 0.12, null, '✨ AMAZING! ✨');
      }, onStart(cs) {
        csHearts(cs, cx, stageY - 60, 8);
      }},

      // Step 9: Bow — everyone bows (2.5s)
      { dur: 2.5, draw(cs) {
        drawStage(cs); updateConfetti();
        const pos = lineFormation(stageY, 48);
        // Bow animation: crouch down then back up
        const bowPhase = cs.stepT < 1.2 ? 'nod' : 'wave';
        const expressions = chars.map(() => bowPhase);
        drawFormation(pos, expressions);
        spotX = cx; spotR = 160;
        csDrawBubble(cx, H * 0.15, 'Krystal', 'Thank you, thank you! 🥰');
      }},
    ]
  };
}

/* ============================================================================
   CUTSCENE REGISTRY  —  map scene names to cutscene factory functions
   ============================================================================ */
const CUTSCENE_MAP = {
  campsite:          [csCampfireStory],
  starrymeadow:      [csStargazing],
  observatory:       [csStargazing, csConstellationDrawing],
  planetarium:       [csConstellationDrawing],
  aurora:            [csConstellationDrawing],
  beach:             [csBeachSunsetPicnic, csSunriseYoga, csSandcastleContest],
  moonbeach:         [csBeachSunsetPicnic, csSandcastleContest],
  bakery:            [csBakeryMishap],
  gingerbreadkitchen:[csBakeryMishap],
  library:           [csLibraryGhost],
  arcanelibrary:     [csLibraryGhost],
  aquarium:          [csAquariumWonder],
  aquariumtunnel:    [csAquariumWonder],
  rainystreet:       [csRainyDayChat, csPuddleJumping],
  waterfall:         [csPuddleJumping],
  florist:           [csFlowerCrown],
  cherryblossom:     [csFlowerCrown],
  lavender:          [csFlowerCrown, csCloudWatching],
  peonygarden:       [csFlowerCrown],
  snowycabin:        [csSnowAngelContest, csBoardGameNight],
  icepond:           [csSnowAngelContest, csSnowballFight],
  frozenfalls:       [csSnowAngelContest, csSnowballFight],
  icebergbay:        [csSnowballFight],
  musicroom:         [csMusicJam],
  recordshop:        [csMusicJam, csKaraokeNight],
  jazzclub:          [csMusicJam, csKaraokeNight, csDanceNumber],
  carnival:          [csKaraokeNight, csDanceNumber],
  artstudio:         [csPaintingTogether],
  pottery:           [csPaintingTogether],
  hedgemaze:         [csHideAndSeek],
  topiary:           [csHideAndSeek],
  backyard:          [csHideAndSeek],
  teahouse:          [csTeaParty],
  bambootearoom:     [csTeaParty],
  cafe:              [csTeaParty, csCandlelitDinner],
  balloonride:       [csSunsetBalloonRide],
  balloonfest:       [csSunsetBalloonRide],
  kitehill:          [csSunsetBalloonRide],
  diner:             [csCookingDisaster, csCandlelitDinner],
  dumplinghouse:     [csCookingDisaster],
  ramenshop:         [csCookingDisaster],
  tidepools:         [csTidePoolDiscovery],
  coralreef:         [csTidePoolDiscovery],
  treehouse:         [csPillowFort, csBoardGameNight],
  sunroom:           [csPillowFort],
  igloo:             [csPillowFort, csBoardGameNight],
  balletstudio:      [csDanceLesson, csDanceNumber],
  ballroom:          [csDanceLesson, csDanceNumber],
  fireflies:         [csFireflyCatching],
  fireflypier:       [csFireflyCatching],
  nightgarden:       [csFireflyCatching],
  magicshop:         [csMagicShow],
  tarotparlor:       [csMagicShow],
  wizardtower:       [csMagicShow],
  fishingdock:       [csSunsetFishing],
  marina:            [csSunsetFishing],
  river:             [csSunsetFishing, csPuddleJumping],
  butterflydome:     [csGardenButterflies],
  greenhouse:        [csGardenButterflies],
  sunflowers:        [csGardenButterflies],
  canyon:            [csTreasureHunt, csFossilDiscovery],
  sanddunes:         [csTreasureHunt],
  cornmaze:          [csTreasureHunt],
  alpinemeadow:      [csCloudWatching, csSunriseYoga],
  poppyfield:        [csCloudWatching],
  escaperoom:        [csSpookyMansion],
  antiqueshop:       [csSpookyMansion],
  darkroom:          [csSpookyMansion],
  starpool:          [csWishingWell],
  moontemple:        [csWishingWell],
  fairyring:         [csWishingWell],
  petshop:           [csPetShopChaos],
  catcafe:           [csPetShopChaos],
  aviary:            [csPetShopChaos],
  lanternfestival:   [csLanternRelease],
  nightmarket:       [csLanternRelease],
  harbornight:       [csLanternRelease],
  rooftoppool:       [csSunriseYoga],
  driftwoodbeach:    [csSandcastleContest],
  winecellar:        [csCandlelitDinner],
  naturalhistory:    [csFossilDiscovery],
  cliffs:            [csFossilDiscovery],
  arcade:            [csArcadeHighScore],
  candyfactory:      [csArcadeHighScore],
  bowling:           [csArcadeHighScore],
  enchantedforest:   [csEnchantedGift],
  crystalgrotto:     [csEnchantedGift],
  mushroomglade:     [csEnchantedGift],
  toyshop:           [csToyShopRace],
  candyshop:         [csToyShopRace],
  comicshop:         [csToyShopRace],
};

/* ============================================================================
   RANDOM TRIGGER SYSTEM
   ============================================================================ */
let csTriggerTimer = 180 + Math.random() * 120;
function resetCsTrigger(){ csTriggerTimer = 180 + Math.random() * 120; }

// Debug: force-trigger a cutscene for the current scene (press X cycles through them)
let csDebugIdx = 0;
function forceCutscene(){
  if (cutscene || birthday) return;
  const scene = SCENES[currentScene];
  const defs = CUTSCENE_MAP[scene];
  if (!defs || !defs.length) {
    // try a generic
    const factory = GENERIC_CUTSCENES[Math.floor(Math.random() * GENERIC_CUTSCENES.length)];
    startCutscene(factory());
    return;
  }
  const factory = defs[csDebugIdx % defs.length];
  csDebugIdx++;
  startCutscene(factory());
}

(function csTriggerSystem(){
  EXTRA_UPDATERS.push(function csRandomTrigger(dt){
    if (cutscene || birthday || DEBUG_MODE) return;
    csTriggerTimer -= dt;
    if (csTriggerTimer > 0) return;
    csTriggerTimer = 180 + Math.random() * 120;   // reset to 20-40 seconds

    // don't trigger if pet is busy
    if (pet.animLock > 0 || pet.resting || isCrying()) return;

    // check if current scene has cutscenes
    const scene = SCENES[currentScene];
    const defs = CUTSCENE_MAP[scene];

    let factory;
    if (defs && defs.length){
      // always trigger if scene has cutscenes
      factory = defs[Math.floor(Math.random() * defs.length)];
    } else {
      // fallback to a generic cutscene
      factory = GENERIC_CUTSCENES[Math.floor(Math.random() * GENERIC_CUTSCENES.length)];
    }
    startCutscene(factory());
  });
})();

/* ============================================================================
   CUTSCENE JOURNAL / CHECKLIST UI
   ============================================================================ */
/* Build a map from cutscene ID to its factory for replay */
const CS_FACTORY_BY_ID = {};
// scene-specific
for (const scene in CUTSCENE_MAP){
  for (const factory of CUTSCENE_MAP[scene]){
    const test = factory();
    if (test.id && !CS_FACTORY_BY_ID[test.id]) CS_FACTORY_BY_ID[test.id] = factory;
  }
}
// generic
for (const factory of GENERIC_CUTSCENES){
  const test = factory();
  if (test.id) CS_FACTORY_BY_ID[test.id] = factory;
}

function buildCutsceneList(){
  const list = document.getElementById('csJournalList');
  if (!list) return;
  list.innerHTML = '';
  const total = CUTSCENE_CATALOG.length;
  let seen = 0;
  for (const entry of CUTSCENE_CATALOG){
    if (seenCutscenes[entry.id]) seen++;
  }
  // progress
  const prog = document.getElementById('csJournalProgress');
  if (prog) prog.innerHTML = '<span>' + seen + ' / ' + total + ' discovered</span>' +
    '<div class="pbar"><i style="width:' + (seen / total * 100).toFixed(1) + '%"></i></div>';

  for (const entry of CUTSCENE_CATALOG){
    const isSeen = !!seenCutscenes[entry.id];
    const row = document.createElement('div');
    row.className = 'csRow' + (isSeen ? '' : ' locked');

    if (isSeen){
      const isGeneric = entry.scenes.length === 1 && entry.scenes[0] === 'any';
      const charList = entry.chars.map(c => c === '?' ? 'Random' : c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
      row.innerHTML =
        '<div class="csName">' + entry.name + '</div>' +
        '<div class="csDesc">' + entry.description + '</div>' +
        '<div class="csMeta">' +
          (isGeneric ? '<span class="csTag">Any scene</span>' : '<span class="csTag">' + entry.scenes.slice(0, 3).join(', ') + '</span>') +
          '<span class="csChars">' + charList + '</span>' +
        '</div>' +
        '<button class="csReplay">\u25b6 Replay</button>';
      row.querySelector('.csReplay').addEventListener('click', function(){
        const factory = CS_FACTORY_BY_ID[entry.id];
        if (factory){
          closeCsJournal();
          setTimeout(function(){ startCutscene(factory()); }, 200);
        }
      });
    } else {
      row.innerHTML =
        '<div class="csName">???</div>' +
        '<div class="csDesc">Not yet discovered</div>';
    }
    list.appendChild(row);
  }
}

function openCsJournal(){ buildCutsceneList(); document.getElementById('csJournalPanel').classList.remove('hide'); }
function closeCsJournal(){ document.getElementById('csJournalPanel').classList.add('hide'); }
function toggleCsJournal(){ document.getElementById('csJournalPanel').classList.contains('hide') ? openCsJournal() : closeCsJournal(); }

// Wire up journal button
document.getElementById('csJournalBtn').addEventListener('click', openCsJournal);
document.getElementById('csJournalClose').addEventListener('click', closeCsJournal);

/* ============================================================================
   HOOK INTO EXISTING LOOP  (via EXTRA_* arrays — no core edits needed)
   ============================================================================ */
// The cutscene takeover is handled by direct checks in loop.js, birthday.js,
// and pet.js. These are added below after the cutscene engine is defined.

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
  // pre-load sprites we'll need
  if (def.chars) def.chars.forEach(n => csLoadSprite(n));
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
      // Step 2: Luna responds.
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(luna.x, luna.feetY - charH * 0.9 - 4, 'Luna', 'Yes! Tell us!');
      }},
      // Step 3: Paul narrates.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', 'Once upon a time... in a dark forest...');
      }},
      // Step 4: Krystal on the edge of her seat.
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', 'Then what happened?!');
      }},
      // Step 5: BOO! Screen flash.
      { dur: 1.5, draw(cs){
          drawBg(cs); drawChars();
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
          drawBg(cs); drawChars();
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', 'You got me! \ud83d\ude02');
          // draw hearts
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
      // Step 2: Krystal speaks.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
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
      // Step 4: The star brightens. Krystal reacts.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
          csDrawBubble(krystalX, blanketY - charH * 0.85 - 6, 'Krystal', 'Really? \ud83e\udd70');
      }},
      // Step 5: Paul's line.
      { dur: 2.0, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
          csDrawBubble(paulX, blanketY - charH * 0.85 - 6, 'Paul', 'The brightest one. Always.');
      }},
      // Step 6: Hearts float up. Both smile.
      { dur: 2.5, draw(cs){
          drawBg(cs); drawBlanketAndChars(cs);
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
      // Step 1: Quiet scene — golden hour, everyone on the blanket
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(krystal.x, krystal.feetY - charH - 4, 'Krystal', "This sunset is so pretty...");
      }},
      // Step 2: Wade breaks the peace
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(wade.x, wade.feetY - charH * 0.95 - 4, 'Wade', 'Know what else is pretty? This sandwich.');
      }},
      // Step 3: Everyone laughs
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars();
          csDrawBubble(paul.x, paul.feetY - charH - 4, 'Paul', 'Wade, you are unbelievable 😂');
      }},
      // Step 4: Krystal leans on Paul — cozy moment
      { dur: 2.0, draw(cs){
          drawBg(cs);
          // draw Krystal slightly closer to Paul to suggest leaning
          csDrawChar('paul',    paul.x,          paul.feetY,    'right', charH, 0);
          csDrawChar('krystal', krystal.x - 18,  krystal.feetY, 'left',  charH, 0);
          csDrawChar('wade',    wade.x,          wade.feetY,    'left',  charH * 0.95, 0);
          csDrawBubble(krystal.x - 18, krystal.feetY - charH - 4, 'Krystal', "I could stay here forever 🥰");
      }, onStart(cs){
          csHearts(cs, paul.x, paul.feetY - charH * 0.7, 4);
          csHearts(cs, krystal.x - 18, krystal.feetY - charH * 0.7, 5);
      }},
      // Step 5: Warm closing — hearts float, sun dips lower
      { dur: 2.0, draw(cs){
          drawBg(cs);
          csDrawChar('paul',    paul.x,          paul.feetY,    'right', charH, 0);
          csDrawChar('krystal', krystal.x - 18,  krystal.feetY, 'left',  charH, 0);
          csDrawChar('wade',    wade.x,          wade.feetY,    'left',  charH * 0.95, 0);
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

  function drawChars(covered){
    csDrawChar('krystal', krystalX, counterY + charH * 0.15, 'right', charH, 0);
    csDrawChar('luna',    lunaX,    counterY + charH * 0.15, 'left',  charH * 0.9, 0);
    // if covered in flour, overlay a translucent white layer on the characters
    if (covered){
      ctx.fillStyle = 'rgba(255,250,240,.28)';
      ctx.fillRect(krystalX - 22, counterY + charH * 0.15 - charH, 44, charH);
      ctx.fillRect(lunaX - 20, counterY + charH * 0.15 - charH * 0.9, 40, charH * 0.9);
    }
  }

  return {
    chars: ['krystal', 'luna'],
    skipable: true,
    steps: [
      // Step 1: Setting the scene — mixing batter
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(false);
          csDrawBubble(krystalX, counterY + charH * 0.15 - charH - 4, 'Krystal', "Okay, just a little more flour...");
      }},
      // Step 2: Luna goes for it
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false);
          csDrawBubble(lunaX, counterY + charH * 0.15 - charH * 0.9 - 4, 'Luna', "I got it! Stand back!");
      }},
      // Step 3: BOOM — flour explosion!
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true); drawFlour(cs, 0);
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
      // Step 4: Aftermath — both covered, laughing
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true); drawFlour(cs, 0);
          csDrawBubble(lunaX, counterY + charH * 0.15 - charH * 0.9 - 4, 'Luna', "Nailed it!");
      }, update(cs, dt){
          drawFlour(cs, dt);
      }},
      // Step 5: Krystal's reaction — hearts
      { dur: 2.5, draw(cs){
          drawBg(cs); drawChars(true); drawFlour(cs, 0);
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

  function drawChars(williamHiding){
    if (williamHiding){
      // William behind Krystal — draw him slightly behind and peeking
      csDrawChar('william', krystalX + 16, fY + 2, 'left', charH * 0.85, 0);
      csDrawChar('krystal', krystalX, fY, 'up', charH, 0);
    } else {
      csDrawChar('krystal', krystalX, fY, 'right', charH, 0);
      csDrawChar('william', williamX, fY, 'left',  charH * 0.95, 0);
    }
  }

  return {
    chars: ['krystal', 'william'],
    skipable: true,
    steps: [
      // Step 1: Quiet library — peaceful moment
      { dur: 2.0, draw(cs){
          drawBg(cs); drawChars(false);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's so quiet in here...");
      }},
      // Step 2: A book falls off the shelf!
      { dur: 2.0, draw(cs){
          drawBg(cs); drawFallingBook(cs); drawChars(false);
          if (cs.stepT > 0.5){
            csDrawBubble(williamX, fY - charH * 0.95 - 4, 'William', "What was THAT?!");
          }
      }, onStart(cs){
          fallingBook = { x: W - 36, startY: H * 0.20, dur: 0.5, start: cs.totalT };
          try{ sfx('tap'); }catch(e){}
      }},
      // Step 3: Krystal reacts
      { dur: 2.0, draw(cs){
          drawBg(cs); drawFallingBook(cs); drawChars(false);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "Did you see that?!");
      }},
      // Step 4: Ghost orb drifts across — William hides behind Krystal
      { dur: 2.5, draw(cs){
          drawBg(cs); drawGhostOrb(cs); drawFallingBook(cs); drawChars(true);
          if (cs.stepT > 0.8){
            csDrawBubble(krystalX + 16, fY - charH * 0.85 - 4, 'William', "I'm not scared... you're scared!");
          }
      }, onStart(cs){
          ghostOrb = { start: cs.totalT, dur: 2.2 };
      }},
      // Step 5: Krystal laughs it off
      { dur: 2.5, draw(cs){
          drawBg(cs); drawGhostOrb(cs); drawFallingBook(cs); drawChars(true);
          csDrawBubble(krystalX, fY - charH - 4, 'Krystal', "It's just the wind... right? \ud83d\udc40");
      }, onStart(cs){
          csHearts(cs, krystalX, fY - charH * 0.7, 3);
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
  observatory:       [csStargazing],
  beach:             [csBeachSunsetPicnic],
  moonbeach:         [csBeachSunsetPicnic],
  bakery:            [csBakeryMishap],
  gingerbreadkitchen:[csBakeryMishap],
  library:           [csLibraryGhost],
  arcanelibrary:     [csLibraryGhost],
};

/* ============================================================================
   RANDOM TRIGGER SYSTEM
   ============================================================================ */
(function csTriggerSystem(){
  let triggerTimer = 30 + Math.random() * 30;

  EXTRA_UPDATERS.push(function csRandomTrigger(dt){
    if (cutscene || birthday) return;
    triggerTimer -= dt;
    if (triggerTimer > 0) return;
    triggerTimer = 30 + Math.random() * 30;   // reset to 30-60 seconds

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

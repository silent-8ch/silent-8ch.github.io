/* scenes 1/4  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

// The three base scenes register here (their draw functions are hoisted within this file),
// keeping them at indices 0,1,2 as before. All other scenes self-register after each definition.
registerScene('beach', drawBeach);
registerScene('backyard', drawBackyard, true);   // depth-sorts Krystal itself
registerScene('river', drawRiver);

// Beach umbrella: tap to toggle open (frame 3) / closed (frame 0)
let beachUmbrellaFrame = 0;
const UMBRELLA_X = 0.60, UMBRELLA_Y = 0.74, UMBRELLA_HIT = 35;
EXTRA_TAPS.push(function(px, py){
  if (SCENES[currentScene] !== 'beach') return false;
  if (Math.abs(px - W * UMBRELLA_X) < UMBRELLA_HIT && Math.abs(py - H * UMBRELLA_Y + 20) < UMBRELLA_HIT) {
    beachUmbrellaFrame = beachUmbrellaFrame === 0 ? 3 : 0;
    if (typeof sfx === 'function') sfx('tap');
    return true;
  }
  return false;
});

function drawBeach(){
  const t = sceneTime;

  // Sky (skyDay sprite)
  SpriteRenderer.preload('skyDay');
  const skyTex = SpriteRenderer.getSprite('skyDay');
  if (skyTex && skyTex.ready) {
    ctx.drawImage(skyTex.image, 0, 0, skyTex.fw, skyTex.fh, 0, 0, W, H * 0.45);
  } else {
    ctx.fillStyle = '#4a90d9'; ctx.fillRect(0, 0, W, H * 0.45);
  }

  // (sun is now the global clock-driven one — see drawCelestial in birthday.js)

  // Clouds
  drawSpriteCloud(W * 0.15 + Math.sin(t * 0.15) * 8, H * 0.08, 0.9);
  drawSpriteCloud(W * 0.55 + Math.sin(t * 0.1 + 2) * 10, H * 0.14, 0.7);
  drawSpriteCloud(W * 0.85 + Math.sin(t * 0.12 + 4) * 6, H * 0.06, 0.5);

  // Ocean (oceanWater + deepWater textures, parallax-tiled with perspective scaling)
  const oceanTop = H * 0.38;
  const oceanBot = H * 0.62;
  SpriteRenderer.preload('deepWater');
  SpriteRenderer.preload('oceanWater');
  const deepTex = SpriteRenderer.getSprite('deepWater');
  const oceanTex = SpriteRenderer.getSprite('oceanWater');
  const ts = 64;
  if ((deepTex && deepTex.ready) || (oceanTex && oceanTex.ready)) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, oceanTop, W, oceanBot - oceanTop); ctx.clip();
    const oceanH = oceanBot - oceanTop;
    const LAYERS = 6;
    const rowH = Math.ceil(oceanH / LAYERS) + 1;
    const useTex = oceanTex && oceanTex.ready ? oceanTex : deepTex;
    if (useTex && useTex.ready) {
      for (let layer = 0; layer < LAYERS; layer++) {
        const p = layer / (LAYERS - 1);              // 0=horizon, 1=shore (evenly spread)
        const rowY = oceanTop + (oceanH * layer) / LAYERS;
        // Perspective: uniform scale, gentle curve so layers stay consistent
        const scale = 0.25 + p * 2.25;               // 0.25× at back → 2.5× at front
        const tileS = ts * scale;
        // Parallax scroll: far layers drift slower
        const drift = Math.sin(sceneTime * (0.12 + p * 0.25) + layer * 1.3) * (1.5 + p * 3);
        const offset = ((drift % tileS) + tileS) % tileS;  // always positive modulo
        // Depth: darker/more transparent at horizon, full at shore
        ctx.globalAlpha = 0.65 + p * 0.35;
        for (let ty = rowY; ty < rowY + rowH; ty += tileS)
          for (let tx = -tileS + offset; tx < W + tileS; tx += tileS)
            ctx.drawImage(useTex.image, 0, 0, useTex.fw, useTex.fh, tx, ty, tileS, tileS);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    const ocean = ctx.createLinearGradient(0, oceanTop, 0, oceanBot);
    ocean.addColorStop(0, '#2e8bc0'); ocean.addColorStop(0.4, '#1a6fa0'); ocean.addColorStop(1, '#3aa5c8');
    ctx.fillStyle = ocean; ctx.fillRect(0, oceanTop, W, oceanBot - oceanTop);
  }

  // Open ocean swells (far out, gentle)
  drawSwell(oceanTop + 4, t, 1.4, 6, 0.025, '#2080a8');
  drawSwell(oceanTop + 12, t, 1.0, 4, 0.035, '#2590b8');

  // Sand (beachSand texture tiled for wet strip + dry sand)
  SpriteRenderer.preload('beachSand');
  const sandTex = SpriteRenderer.getSprite('beachSand');
  if (sandTex && sandTex.ready) {
    for (let ty = oceanBot - 4; ty < H; ty += ts)
      for (let tx = 0; tx < W; tx += ts) {
        const dw = Math.min(ts, W - tx);
        const dh = Math.min(ts, H - ty);
        ctx.drawImage(sandTex.image, 0, 0, sandTex.fw * (dw / ts), sandTex.fh * (dh / ts), tx, ty, dw, dh);
      }
  } else {
    ctx.fillStyle = '#a8905a'; ctx.fillRect(0, oceanBot - 4, W, 16);
    ctx.fillStyle = '#dcc08a'; ctx.fillRect(0, oceanBot + 8, W, H - oceanBot - 8);
  }

  // Breaking waves drawn ON TOP of sand so wash laps over it
  for (const wave of waves) drawBreakingWave(wave, oceanTop, oceanBot);

  // Beach towel (picnicBlanket texture clipped to towel shape)
  SpriteRenderer.preload('picnicBlanket');
  const towelTex = SpriteRenderer.getSprite('picnicBlanket');
  ctx.save();
  ctx.translate(W * 0.75, H * 0.78);
  ctx.rotate(-0.15);
  ctx.beginPath(); roundRect(-30, -12, 60, 24, 3);
  ctx.clip();
  if (towelTex && towelTex.ready) {
    ctx.drawImage(towelTex.image, 0, 0, towelTex.fw, towelTex.fh, -30, -12, 60, 24);
  } else {
    ctx.fillStyle = 'rgba(224,122,139,0.4)'; ctx.fillRect(-30, -12, 60, 24);
  }
  ctx.restore();

  // Cookie plate on the sand
  SpriteRenderer.submit({sprite:'cookingPot',phase:'ground',x:W*0.20,y:H*0.82,anchorY:1,width:36,height:36,frame:0});
  // Sand castle (boulder with sand tint + pennant flag on top)
  SpriteRenderer.submit({sprite:'rockBoulder',phase:'ground',x:W*0.88,y:H*0.88,anchorY:1,width:40,height:40,frame:0,tint:'#d4b06a',tintAmount:0.6});
  SpriteRenderer.submit({sprite:'pennantFlags',phase:'ground',x:W*0.88,y:H*0.76,anchorY:1,width:28,height:28,frame:Math.floor(t*4)%4});

  // sprite birds gliding over the water
  SpriteRenderer.submit({sprite:'bird',phase:'background',x:W*0.3+Math.sin(t*0.4)*30,y:H*0.26+Math.sin(t*0.6)*6,width:16,height:16,anchorY:0.5,frame:Math.floor(t*6)%4});
  SpriteRenderer.submit({sprite:'bird',phase:'background',x:W*0.6+Math.sin(t*0.3+2)*24,y:H*0.22+Math.sin(t*0.5+1)*5,width:14,height:14,anchorY:0.5,frame:Math.floor(t*6+2)%4,flipX:true});
  // umbrella stuck in the sand (tap to open/close)
  SpriteRenderer.submit({sprite:'umbrella',phase:'ground',x:W*0.60,y:H*0.74,anchorY:1,frame:beachUmbrellaFrame});
  // crab scuttling on the sand
  SpriteRenderer.submit({sprite:'crab',phase:'actors',x:W*0.42+Math.sin(t*1.2)*18,y:H*0.88,anchorY:1,frame:Math.floor(t*7)%4});
}

function drawCloud(cx, cy, scale) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(cx, cy, 16 * scale, 0, 7);
  ctx.arc(cx + 14 * scale, cy - 6 * scale, 12 * scale, 0, 7);
  ctx.arc(cx + 24 * scale, cy, 14 * scale, 0, 7);
  ctx.arc(cx - 12 * scale, cy + 2 * scale, 10 * scale, 0, 7);
  ctx.fill();
}

/* ── Helpers for sprite tiling inside a clip path ── */
function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

function crestProfile(wave, xn){
  const env = Math.pow(Math.sin(clamp01(xn) * Math.PI), 0.7);
  const s = wave.seed;
  const bumps = 0.50
    + 0.26 * Math.sin(xn * Math.PI * 3 + s * 1.7)
    + 0.16 * Math.sin(xn * Math.PI * 5 + s * 2.3)
    + 0.10 * Math.sin(xn * Math.PI * 8 + s * 0.9);
  return env * Math.max(0, bumps);
}

function phaseField(wave, xn){
  const s = wave.seed;
  return 0.55 * Math.sin(xn * Math.PI * 2 + s)
       + 0.30 * Math.sin(xn * Math.PI * 3.7 + s * 2.1)
       + 0.15 * Math.sin(xn * Math.PI * 6.3 + s * 0.6);
}

function crashRate(wave, xn){
  return 1.1 + 0.35 * Math.sin(xn * Math.PI * 4 + wave.seed * 1.3);
}

// Tile a sprite texture into a pre-clipped region (call inside ctx.save/clip/restore)
function tileSprite(sprite, x0, y0, x1, y1, tileSize) {
  if (!sprite || !sprite.ready) return false;
  for (let ty = y0; ty < y1; ty += tileSize)
    for (let tx = x0; tx < x1; tx += tileSize) {
      const dw = Math.min(tileSize, x1 - tx);
      const dh = Math.min(tileSize, y1 - ty);
      ctx.drawImage(sprite.image, 0, 0, sprite.fw * (dw / tileSize), sprite.fh * (dh / tileSize), tx, ty, dw, dh);
    }
  return true;
}

/* ── Swell: sprite-filled sine curves ── */
function drawSwell(baseY, t, speed, amp, freq, _color) {
  SpriteRenderer.preload('deepWater');
  const swellTex = SpriteRenderer.getSprite('deepWater');
  const heave = Math.sin(t * speed) * amp;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, baseY + amp + 6);
  for (let x = 0; x <= W; x += 3) {
    const shape = Math.sin(x * freq) * amp * 0.4
      + Math.sin(x * freq * 2.1 + 1.5) * amp * 0.2;
    ctx.lineTo(x, baseY + heave + shape);
  }
  ctx.lineTo(W, baseY + amp + 6);
  ctx.closePath();
  ctx.clip();
  if (!tileSprite(swellTex, 0, baseY - amp, W, baseY + amp + 6, 48)) {
    ctx.fillStyle = '#2080a8'; ctx.fill();
  }
  ctx.restore();
}

/* ── Breaking wave system ──
   Each wave goes through a lifecycle with curved clip paths filled by sprites.
*/
const waves = [];
const WAVE_COUNT = 5;
const WAVE_CYCLE = 9;

for (let i = 0; i < WAVE_COUNT; i++) {
  waves.push({
    phase: (i / WAVE_COUNT) * WAVE_CYCLE,
    seed: Math.random() * 100,
    amplitude: 0.8 + Math.random() * 0.4,
  });
}

function updateWaves(dt) {
  for (const w of waves) {
    w.phase = (w.phase + dt) % WAVE_CYCLE;
  }
}

function drawBreakingWave(wave, oceanTop, oceanBot) {
  const p = wave.phase / WAVE_CYCLE;
  const amp = wave.amplitude;
  const seed = wave.seed;
  const shoreY = oceanBot;
  const t = sceneTime;

  SpriteRenderer.preload('oceanWater');
  SpriteRenderer.preload('snowGround');
  const waveTex = SpriteRenderer.getSprite('oceanWater');
  const foamTex = SpriteRenderer.getSprite('snowGround');

  if (p < 0.35) {
    // ── APPROACH & CREST ──
    const approachP = p / 0.35;
    const waveY = oceanTop + (shoreY - oceanTop) * (0.3 + approachP * 0.65);
    const height = (6 + approachP * 16) * amp;

    // Wave body — sine-profiled clip filled with oceanWater
    ctx.save();
    ctx.globalAlpha = 0.2 + approachP * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, waveY + 4);
    for (let x = 0; x <= W; x += 3) {
      const xn = x / W;
      const prof = crestProfile(wave, xn);
      const localA = clamp01(approachP + phaseField(wave, xn) * 0.12);
      const localH = height * (0.5 + 0.5 * localA);
      const ripple = Math.sin(x * 0.08 + seed * 3) * 2 * approachP;
      ctx.lineTo(x, waveY - prof * localH + ripple);
    }
    ctx.lineTo(W, waveY + 4);
    ctx.closePath();
    ctx.clip();
    if (!tileSprite(waveTex, 0, waveY - height * 1.2, W, waveY + 4, 48)) {
      ctx.fillStyle = '#1e6490'; ctx.fill();
    }
    ctx.restore();

    // Crest foam — sine-profiled clip filled with shallowWater tinted white
    if (approachP > 0.4) {
      ctx.save();
      ctx.globalAlpha = (approachP - 0.4) / 0.6 * 0.7;
      ctx.beginPath();
      let hasPath = false;
      for (let x = 0; x <= W; x += 3) {
        const xn = x / W;
        const prof = crestProfile(wave, xn);
        const localA = clamp01(approachP + phaseField(wave, xn) * 0.12);
        if (localA > 0.55 && prof > 0.45) {
          const fy = waveY - prof * height * (0.5 + 0.5 * localA) - 1;
          const r = 3 * ((localA - 0.55) / 0.45) * amp;
          ctx.moveTo(x + r, fy);
          ctx.arc(x, fy, r, 0, Math.PI * 2);
          hasPath = true;
        }
      }
      if (hasPath) {
        ctx.clip();
        if (!tileSprite(foamTex, 0, waveY - height * 1.3, W, waveY, 40)) {
          ctx.fillStyle = '#ffffff'; ctx.fill();
        }
      }
      ctx.restore();
    }

    // Curling lip — quadratic curves clipped with shallowWater
    if (approachP > 0.78) {
      ctx.save();
      ctx.globalAlpha = ((approachP - 0.78) / 0.22) * 0.6;
      ctx.beginPath();
      for (let x = W * 0.05; x <= W * 0.95; x += 4) {
        const xn = x / W;
        const prof = crestProfile(wave, xn);
        const localA = clamp01(approachP + phaseField(wave, xn) * 0.12);
        if (localA > 0.78 && prof > 0.5) {
          const curlP = (localA - 0.78) / 0.22;
          const fy = waveY - prof * height * (0.5 + 0.5 * localA);
          ctx.moveTo(x, fy);
          ctx.quadraticCurveTo(x + 4 * curlP, fy + 6 * curlP * amp, x + 2, fy + 10 * curlP * amp);
          ctx.lineTo(x + 4, fy + 10 * curlP * amp);
          ctx.lineTo(x + 4, fy);
        }
      }
      ctx.clip();
      if (!tileSprite(foamTex, 0, waveY - height * 1.3, W, waveY + 10, 36)) {
        ctx.fillStyle = '#c8ebff'; ctx.fill();
      }
      ctx.restore();
    }

  } else if (p < 0.45) {
    // ── BREAK / CRASH ──
    const breakP = (p - 0.35) / 0.1;
    const crashY = shoreY - 6;

    // Splash bursts — arc clips filled with shallowWater
    ctx.save();
    ctx.globalAlpha = 1.0 - breakP * 0.15;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 5) {
      const xn = x / W;
      const env = crestProfile(wave, xn);
      if (env <= 0.15) continue;
      const lbp = clamp01(breakP * crashRate(wave, xn) + phaseField(wave, xn) * 0.18);
      const splashAmt = Math.sin(lbp * Math.PI);
      const spread = (8 + splashAmt * 34) * amp * (0.4 + env);
      ctx.moveTo(x + 3 + spread * 0.16, crashY - spread * 0.35);
      ctx.arc(x, crashY - spread * 0.35, 3 + spread * 0.16, 0, Math.PI * 2);
    }
    ctx.clip();
    if (!tileSprite(foamTex, 0, crashY - 50, W, crashY + 4, 36)) {
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.restore();

    // Spray droplets
    ctx.save();
    ctx.globalAlpha = 0.85 - breakP * 0.25;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const xn = 0.5 + Math.sin(seed * (i + 1) * 7.3) * 0.4;
      const lbp = clamp01(breakP * crashRate(wave, xn) + phaseField(wave, xn) * 0.18);
      const peak = Math.sin(lbp * Math.PI);
      const dx = xn * W;
      const dy = crashY - 10 - peak * 26 - Math.abs(Math.sin(seed * i * 3.1)) * 12;
      const r = (1 + Math.sin(seed * i) * 0.5) * peak;
      if (r > 0.2) { ctx.moveTo(dx + r, dy); ctx.arc(dx, dy, r, 0, Math.PI * 2); }
    }
    ctx.clip();
    if (!tileSprite(foamTex, 0, crashY - 60, W, crashY, 32)) {
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.restore();

    // Turbulent foam band — sine-edge clip at water level
    ctx.save();
    ctx.globalAlpha = 0.9 - breakP * 0.15;
    ctx.beginPath();
    ctx.moveTo(0, crashY + 8);
    for (let x = 0; x <= W; x += 3) {
      const turb = (Math.sin(x * 0.12 + seed) * 4 + Math.sin(x * 0.31 + seed * 2) * 2.5) * (1 - breakP * 0.3);
      ctx.lineTo(x, crashY + turb);
    }
    ctx.lineTo(W, crashY + 8);
    ctx.closePath();
    ctx.clip();
    if (!tileSprite(foamTex, 0, crashY - 6, W, crashY + 8, 36)) {
      ctx.fillStyle = '#dceeff'; ctx.fill();
    }
    ctx.restore();

  } else if (p < 0.7) {
    // ── WASH (swash) ──
    const washP = (p - 0.45) / 0.25;
    const startY = shoreY - 2;
    const maxReach = H * 0.18 * amp;
    const reachY = startY + maxReach * washP;
    const alpha = 0.8 - washP * 0.3;

    // Build the wavy leading edge path (reused for film + foam)
    function washEdgePath() {
      ctx.beginPath();
      ctx.moveTo(0, startY);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(x, reachY + Math.sin(x * 0.06 + seed) * 5);
      }
      ctx.lineTo(W, startY);
      ctx.closePath();
    }

    // Thin water film over sand — oceanWater clipped to wavy edge
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    washEdgePath();
    ctx.clip();
    if (!tileSprite(waveTex, 0, startY, W, reachY + 6, 48)) {
      ctx.fillStyle = '#50aad2'; ctx.fill();
    }
    ctx.restore();

    // Thick foam band at leading edge — shallowWater clipped to wavy strip
    const foamWidth = 8 + (1 - washP) * 10;
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.beginPath();
    ctx.moveTo(0, reachY - foamWidth);
    for (let x = 0; x <= W; x += 3) {
      ctx.lineTo(x, reachY + Math.sin(x * 0.06 + seed) * 5);
    }
    ctx.lineTo(W, reachY - foamWidth);
    ctx.closePath();
    ctx.clip();
    if (!tileSprite(foamTex, 0, reachY - foamWidth, W, reachY + 6, 36)) {
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.restore();

    // Foam bubble circles in the band — clipped circles filled with shallowWater
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    for (let i = 0; i < 25; i++) {
      const bx = (Math.sin(seed * (i + 1) * 5.7) * 0.5 + 0.5) * W;
      const by = reachY - foamWidth * (Math.sin(seed * i * 2.3) * 0.5 + 0.5);
      const br = 1.2 + Math.sin(seed * i * 3.1) * 1.0;
      ctx.moveTo(bx + br, by);
      ctx.arc(bx, by, br, 0, Math.PI * 2);
    }
    ctx.clip();
    if (!tileSprite(foamTex, 0, reachY - foamWidth, W, reachY, 32)) {
      ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.restore();

    // Splash particles ahead of the foam
    if (washP < 0.7) {
      ctx.save();
      ctx.globalAlpha = (0.7 - washP) * 0.8;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const sx = (Math.sin(seed * (i + 3) * 7.1) * 0.5 + 0.5) * W;
        const ahead = reachY + 4 + Math.abs(Math.sin(seed * i * 4.7)) * 14;
        const sy = ahead - Math.abs(Math.sin(seed * i * 2.9 + washP * 4)) * 10;
        const sr = 0.8 + Math.sin(seed * i) * 0.5;
        ctx.moveTo(sx + sr, sy);
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      }
      ctx.clip();
      if (!tileSprite(foamTex, 0, reachY - 4, W, reachY + 20, 28)) {
        ctx.fillStyle = '#ffffff'; ctx.fill();
      }
      ctx.restore();
    }

  } else {
    // ── RECEDE (backwash) ──
    const recedeP = (p - 0.7) / 0.3;
    const maxReachY = shoreY + H * 0.18 * amp;
    const currentEdge = maxReachY - (maxReachY - shoreY + 4) * recedeP;
    const alpha = 0.3 * (1 - recedeP);

    if (alpha > 0.01) {
      // Receding film — wavy edge clip filled with oceanWater
      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, shoreY - 4);
      for (let x = 0; x <= W; x += 4) {
        ctx.lineTo(x, currentEdge + Math.sin(x * 0.05 + seed) * 2 * (1 - recedeP));
      }
      ctx.lineTo(W, shoreY - 4);
      ctx.closePath();
      ctx.clip();
      if (!tileSprite(waveTex, 0, shoreY - 4, W, currentEdge + 4, 48)) {
        ctx.fillStyle = '#a0d2e6'; ctx.fill();
      }
      ctx.restore();

      // Scattered remaining foam circles
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const bx = (Math.sin(seed * (i + 1) * 4.1) * 0.5 + 0.5) * W;
        const by = shoreY + (currentEdge - shoreY) * Math.abs(Math.sin(seed * i * 1.7));
        if (by < currentEdge) {
          const r = 1 + (1 - recedeP);
          ctx.moveTo(bx + r, by);
          ctx.arc(bx, by, r, 0, Math.PI * 2);
        }
      }
      ctx.clip();
      if (!tileSprite(foamTex, 0, shoreY, W, currentEdge, 28)) {
        ctx.fillStyle = '#ffffff'; ctx.fill();
      }
      ctx.restore();
    }
  }
}

/* ══════════════════════ BACKYARD SCENE ══════════════════════ */

// Backyard critters — birds and squirrels visit the feeders
const critters = [];
let critterTimer = 0;
function updateCritters(dt) {
  critterTimer -= dt;
  if (critterTimer <= 0 && critters.length < 6) {
    critterTimer = rand(1.5, 4);
    const type = Math.random() < 0.7 ? 'bird' : 'squirrel';
    const isLeft = Math.random() < 0.5;
    const feederX = isLeft ? W * 0.28 : W * 0.72;
    const feederY = isLeft ? H * 0.55 : H * 0.52;
    critters.push({
      type,
      x: type === 'bird' ? rand(-20, W + 20) : (Math.random() < 0.5 ? -20 : W + 20),
      y: type === 'bird' ? rand(H * 0.15, H * 0.3) : H * 0.86,
      tx: feederX + rand(-10, 10),
      ty: type === 'bird' ? feederY - 6 + rand(-3, 3) : feederY + 6,
      poleBaseX: feederX,
      poleBaseY: feederY + H * 0.3,
      feederTopY: feederY - 4,
      phase: type === 'squirrel' ? 'approach' : null,
      atFeeder: false,
      feedTime: 0,
      maxFeed: rand(3, 7),
      leaving: false,
      leaveX: Math.random() < 0.5 ? -30 : W + 30,
      leaveY: type === 'bird' ? rand(H * 0.1, H * 0.25) : H * 0.86,
      bob: rand(0, 6),
      color: type === 'bird' ? pick(['#e04040','#4080e0','#e0a020','#40b040','#8040c0']) : '#8B6914',
    });
  }
  for (let i = critters.length - 1; i >= 0; i--) {
    const c = critters[i];
    c.bob += dt;

    if (c.type === 'bird') {
      const speed = 80;
      if (!c.atFeeder && !c.leaving) {
        const dx = c.tx - c.x, dy = c.ty - c.y;
        const d = Math.hypot(dx, dy);
        if (d > 2) { c.x += dx/d * speed * dt; c.y += dy/d * speed * dt; }
        else { c.atFeeder = true; }
      } else if (c.atFeeder) {
        c.feedTime += dt;
        if (c.feedTime >= c.maxFeed) { c.leaving = true; c.atFeeder = false; }
      } else {
        const dx = c.leaveX - c.x, dy = c.leaveY - c.y;
        const d = Math.hypot(dx, dy);
        if (d > 2) { c.x += dx/d * speed * 1.3 * dt; c.y += dy/d * speed * 1.3 * dt; }
        else { critters.splice(i, 1); }
      }
    } else {
      // Squirrel: approach pole → climb up → eat → climb down → scamper away
      const runSpeed = 60;
      const climbSpeed = 45;
      if (c.phase === 'approach') {
        // Run along ground to pole base
        const dx = c.poleBaseX - c.x;
        if (Math.abs(dx) > 3) { c.x += Math.sign(dx) * runSpeed * dt; }
        else { c.x = c.poleBaseX; c.phase = 'climb'; }
      } else if (c.phase === 'climb') {
        // Climb straight up the pole
        if (c.y > c.feederTopY + 3) { c.y -= climbSpeed * dt; }
        else { c.y = c.feederTopY; c.phase = 'eat'; c.atFeeder = true; }
      } else if (c.phase === 'eat') {
        c.feedTime += dt;
        if (c.feedTime >= c.maxFeed) { c.phase = 'descend'; c.atFeeder = false; }
      } else if (c.phase === 'descend') {
        // Climb back down
        if (c.y < c.poleBaseY - 3) { c.y += climbSpeed * dt; }
        else { c.y = H * 0.86; c.phase = 'leave'; }
      } else if (c.phase === 'leave') {
        const dx = c.leaveX - c.x;
        if (Math.abs(dx) > 3) { c.x += Math.sign(dx) * runSpeed * 1.3 * dt; }
        else { critters.splice(i, 1); }
      }
    }
  }
}

function drawBackyard() {
  const t = sceneTime;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#6aafe6');
  sky.addColorStop(1, '#b8ddf5');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.5);

  // Clouds
  drawSpriteCloud(W * 0.2 + Math.sin(t * 0.1) * 6, H * 0.08, 0.8);
  drawSpriteCloud(W * 0.65 + Math.sin(t * 0.07 + 3) * 8, H * 0.12, 0.6);

  // Houses behind fence — wide, half hidden by fence, cropped off screen edges
  // Left house (extends off left edge)
  const lhx = -30, lhy = H * 0.14;
  ctx.fillStyle = '#c4a882'; ctx.fillRect(lhx, lhy, 160, 100);
  ctx.fillStyle = '#a0522d'; // roof
  ctx.beginPath(); ctx.moveTo(lhx - 8, lhy); ctx.lineTo(lhx + 80, lhy - 50);
  ctx.lineTo(lhx + 168, lhy); ctx.closePath(); ctx.fill();
  // second story windows
  ctx.fillStyle = '#6a9fd8';
  ctx.fillRect(lhx + 20, lhy + 12, 22, 20); ctx.fillRect(lhx + 60, lhy + 12, 22, 20);
  ctx.fillRect(lhx + 100, lhy + 12, 22, 20);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  ctx.strokeRect(lhx + 20, lhy + 12, 22, 20); ctx.strokeRect(lhx + 60, lhy + 12, 22, 20);
  ctx.strokeRect(lhx + 100, lhy + 12, 22, 20);
  // window cross frames
  for (const wx of [lhx + 31, lhx + 71, lhx + 111]) {
    ctx.beginPath(); ctx.moveTo(wx, lhy + 12); ctx.lineTo(wx, lhy + 32); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx - 11, lhy + 22); ctx.lineTo(wx + 11, lhy + 22); ctx.stroke();
  }

  // Right house (extends off right edge)
  const rhx = W * 0.55, rhy = H * 0.11;
  ctx.fillStyle = '#d4c4a8'; ctx.fillRect(rhx, rhy, 180, 110);
  ctx.fillStyle = '#7a4a3a'; // roof
  ctx.beginPath(); ctx.moveTo(rhx - 8, rhy); ctx.lineTo(rhx + 90, rhy - 55);
  ctx.lineTo(rhx + 188, rhy); ctx.closePath(); ctx.fill();
  // second story windows
  ctx.fillStyle = '#6a9fd8';
  ctx.fillRect(rhx + 20, rhy + 14, 24, 22); ctx.fillRect(rhx + 70, rhy + 14, 24, 22);
  ctx.fillRect(rhx + 120, rhy + 14, 24, 22);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
  ctx.strokeRect(rhx + 20, rhy + 14, 24, 22); ctx.strokeRect(rhx + 70, rhy + 14, 24, 22);
  ctx.strokeRect(rhx + 120, rhy + 14, 24, 22);
  for (const wx of [rhx + 32, rhx + 82, rhx + 132]) {
    ctx.beginPath(); ctx.moveTo(wx, rhy + 14); ctx.lineTo(wx, rhy + 36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx - 12, rhy + 25); ctx.lineTo(wx + 12, rhy + 25); ctx.stroke();
  }

  // Tall trees behind fence — thick trunks, canopies off the top of the screen
  function drawTallTree(tx, trunkW) {
    // Trunk from fence line up and off screen
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(tx - trunkW / 2, -20, trunkW, H * 0.36 + 20 + 50); // extends to fence
    // Bark texture
    ctx.strokeStyle = '#4a2a15'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const ly = i * 25 + 10;
      ctx.beginPath(); ctx.moveTo(tx - trunkW / 2 + 2, ly); ctx.lineTo(tx + trunkW / 2 - 2, ly + 8); ctx.stroke();
    }
    // Canopy — big, mostly off screen top, just the bottom edge visible
    ctx.fillStyle = '#2d7a2d';
    ctx.beginPath(); ctx.arc(tx - 10, -10, 50, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a9a3a';
    ctx.beginPath(); ctx.arc(tx + 15, -20, 45, 0, 7); ctx.fill();
    ctx.fillStyle = '#258a25';
    ctx.beginPath(); ctx.arc(tx, 10, 40, 0, 7); ctx.fill();
  }
  drawTallTree(W * 0.42, 14);
  drawTallTree(W * 0.15, 10);
  drawTallTree(W * 0.88, 12);

  // White picket fence — tall, solid
  const fenceY = H * 0.36;
  const fenceH = 50;
  // solid white fence body
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, fenceY, W, fenceH);
  // horizontal rails (subtle lines for board detail)
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, fenceY + 12, W, 2);
  ctx.fillRect(0, fenceY + fenceH - 12, W, 2);
  // vertical board lines
  ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, fenceY); ctx.lineTo(x, fenceY + fenceH); ctx.stroke();
  }
  // pointed tops
  ctx.fillStyle = '#fff';
  for (let x = 0; x < W; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, fenceY); ctx.lineTo(x + 9, fenceY - 8); ctx.lineTo(x + 18, fenceY); ctx.fill();
  }
  // shadow under fence
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, fenceY + fenceH, W, 4);

  // Grass
  const grass = ctx.createLinearGradient(0, fenceY + fenceH, 0, H);
  grass.addColorStop(0, '#5a9e3a');
  grass.addColorStop(0.4, '#4a8e2e');
  grass.addColorStop(1, '#3a7a22');
  ctx.fillStyle = grass; ctx.fillRect(0, fenceY + fenceH, W, H - fenceY - fenceH);

  // Grass texture
  ctx.strokeStyle = 'rgba(30,80,15,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    const gx = (i * 67 + 13) % W;
    const gy = fenceY + fenceH + 6 + ((i * 43 + 7) % (H * 0.35));
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + rand(-3, 3), gy - rand(4, 8)); ctx.stroke();
  }

  // Bird feeders
  function drawFeeder(fx, fy) {
    // pole
    ctx.fillStyle = '#6a5a4a'; ctx.fillRect(fx - 2, fy, 4, H * 0.3);
    // platform
    ctx.fillStyle = '#8B7355'; roundRect(fx - 18, fy - 4, 36, 6, 2); ctx.fill();
    // roof
    ctx.fillStyle = '#a0522d';
    ctx.beginPath(); ctx.moveTo(fx - 22, fy - 4); ctx.lineTo(fx, fy - 20); ctx.lineTo(fx + 22, fy - 4); ctx.closePath(); ctx.fill();
    // seed
    ctx.fillStyle = '#d4b06a';
    ctx.beginPath(); ctx.ellipse(fx, fy - 1, 12, 3, 0, 0, 7); ctx.fill();
  }
  // --- depth-sorted ground objects (painter's algorithm) ---
  // An object's depth is its ground-contact point: the further DOWN the screen
  // its base sits (the larger its y), the closer it is to the viewer, so it is
  // drawn later (in front). Krystal is sorted in by her feet (pet.y), so she
  // walks BEHIND a feeder whenever her feet are further up the yard than that
  // feeder's base — and in front of it only when she comes right up to it.
  function drawCookiePlate(px, py){
    ctx.fillStyle = '#e9e2d6'; ctx.beginPath(); ctx.ellipse(px, py, 26, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c98a4b'; ctx.beginPath(); ctx.arc(px - 6, py - 3, 7, 0, 7); ctx.arc(px + 7, py - 2, 7, 0, 7); ctx.fill();
  }
  const groundItems = [
    { y: H*0.55 + H*0.3, draw: () => drawFeeder(W*0.28, H*0.55) },  // left feeder (pole base)
    { y: H*0.52 + H*0.3, draw: () => drawFeeder(W*0.72, H*0.52) },  // right feeder (pole base)
    { y: H*0.85,         draw: () => drawCookiePlate(W*0.50, H*0.85) },
    { y: pet.y,          draw: () => drawPet() },                   // Krystal, by her feet
  ];
  groundItems.sort((a, b) => a.y - b.y);        // farther back (smaller y) drawn first
  for (const it of groundItems) it.draw();

  // Draw critters
  updateCritters(1/60);
  for (const c of critters) {
    if (c.type === 'bird') {
      const wingFlap = c.atFeeder ? 0 : Math.sin(c.bob * 12) * 0.4;
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 7, 5, 0, 0, 7); ctx.fill(); // body
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(c.x + 5, c.y - 2, 3, 0, 7); ctx.fill(); // head
      ctx.fillStyle = '#fa0'; // beak
      ctx.beginPath(); ctx.moveTo(c.x + 8, c.y - 2); ctx.lineTo(c.x + 12, c.y - 1); ctx.lineTo(c.x + 8, c.y); ctx.fill();
      // wings
      ctx.fillStyle = c.color;
      ctx.save(); ctx.translate(c.x - 2, c.y - 3);
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, -0.3 + wingFlap, 0, Math.PI); ctx.fill();
      ctx.restore();
      // tail
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.moveTo(c.x - 7, c.y); ctx.lineTo(c.x - 13, c.y - 3); ctx.lineTo(c.x - 12, c.y + 2); ctx.fill();
      // eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x + 6, c.y - 3, 1.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(c.x + 6.5, c.y - 3, 0.7, 0, 7); ctx.fill();
      // pecking animation
      if (c.atFeeder && Math.sin(c.bob * 6) > 0.3) {
        ctx.fillStyle = '#d4b06a'; ctx.beginPath(); ctx.arc(c.x + 10, c.y + 2, 1.5, 0, 7); ctx.fill();
      }
    } else {
      // Squirrel
      const bob = c.atFeeder ? Math.sin(c.bob * 4) * 1.5 : 0;
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(c.x, c.y + bob, 8, 6, 0, 0, 7); ctx.fill(); // body
      ctx.beginPath(); ctx.arc(c.x + 6, c.y - 4 + bob, 5, 0, 7); ctx.fill(); // head
      // fluffy tail
      ctx.fillStyle = '#a07a20';
      ctx.beginPath(); ctx.ellipse(c.x - 10, c.y - 6 + bob, 5, 10, -0.4, 0, 7); ctx.fill();
      // ears
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.arc(c.x + 4, c.y - 8 + bob, 2, 0, 7); ctx.arc(c.x + 8, c.y - 8 + bob, 2, 0, 7); ctx.fill();
      // eye
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(c.x + 8, c.y - 4 + bob, 1, 0, 7); ctx.fill();
      // eating
      if (c.atFeeder && Math.sin(c.bob * 5) > 0) {
        ctx.fillStyle = '#d4b06a'; ctx.beginPath(); ctx.arc(c.x + 10, c.y - 2 + bob, 1.5, 0, 7); ctx.fill();
      }
    }
  }

  // sprite birds perched on the fence
  SpriteRenderer.submit({sprite:'bird',phase:'ground',x:W*0.30,y:H*0.36-8,anchorY:1,frame:Math.floor(t*6)%4});
  SpriteRenderer.submit({sprite:'bird',phase:'ground',x:W*0.72,y:H*0.36-8,anchorY:1,frame:Math.floor(t*6+2)%4,flipX:true});
  // a puppy on the grass
  SpriteRenderer.submit({sprite:'puppy',phase:'actors',x:W*0.60,y:H*0.82,anchorY:1,frame:Math.floor(t*7)%4});
  // butterfly near the grass
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.48+Math.sin(t*1.4)*16,y:H*0.72+Math.cos(t*1.8)*10,anchorY:0.5,frame:Math.floor(t*8)%4});
  // parrot perched on the fence
  SpriteRenderer.submit({sprite:'parrot',phase:'ground',x:W*0.52,y:H*0.36-8,anchorY:1,frame:Math.floor(t*7)%4});
  // bunny nibbling on the grass
  SpriteRenderer.submit({sprite:'bunny',phase:'actors',x:W*0.38+Math.sin(t*0.6)*6,y:H*0.90,anchorY:1,frame:Math.floor(t*7)%4});
  // mailbox at the edge of the yard
  SpriteRenderer.submit({sprite:'mailbox',x:W*0.92,y:H*0.92,frame:Math.floor(sceneTime*2)%4});
  // flowering bush by the fence
  SpriteRenderer.submit({sprite:'floweringBush',x:W*0.08,y:H*0.58,frame:Math.floor(sceneTime*2.5)%4});
  SpriteRenderer.submit({sprite:'grassDirtEdge',x:W*0.50,y:H*0.88,frame:0});
}

/* ══════════════════════ RIVER SCENE ══════════════════════ */

const floaters = [];
let floaterTimer = 0;
function updateFloaters(dt) {
  floaterTimer -= dt;
  if (floaterTimer <= 0 && floaters.length < 3) {
    floaterTimer = rand(4, 9);
    floaters.push({
      type: Math.random() < 0.5 ? 'kayak' : 'tube',
      x: W + 40,
      y: H * 0.46 + rand(-8, 8),
      speed: rand(18, 35),
      bob: rand(0, 6),
      color: pick(['#e04040','#4080e0','#e0a020','#40b040','#e07a8b','#8040c0']),
      personColor: pick(['#ffe0c2','#d4a574','#8d6e4c','#f5d0b0']),
    });
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.x -= f.speed * dt;
    f.bob += dt;
    if (f.x < -50) floaters.splice(i, 1);
  }
}

function drawRiver() {
  const t = sceneTime;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.35);
  sky.addColorStop(0, '#5a9ed6');
  sky.addColorStop(1, '#a8d4f0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.35);

  // Clouds
  drawSpriteCloud(W * 0.25 + Math.sin(t * 0.08) * 10, H * 0.07, 0.7);
  drawSpriteCloud(W * 0.7 + Math.sin(t * 0.06 + 2) * 8, H * 0.11, 0.9);

  // Far tree line
  ctx.fillStyle = '#2a6a2a';
  for (let x = 0; x < W; x += 18) {
    const h = 25 + Math.sin(x * 0.07 + 1) * 10 + Math.sin(x * 0.13) * 6;
    ctx.beginPath(); ctx.arc(x, H * 0.35, h, Math.PI, 0); ctx.fill();
  }

  // River bank (far side)
  ctx.fillStyle = '#6a9a40';
  ctx.fillRect(0, H * 0.33, W, H * 0.07);
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, H * 0.38, W, 4);

  // River water
  const riverTop = H * 0.39;
  const riverBot = H * 0.58;
  const river = ctx.createLinearGradient(0, riverTop, 0, riverBot);
  river.addColorStop(0, '#2878a8');
  river.addColorStop(0.5, '#1a6898');
  river.addColorStop(1, '#2080a8');
  ctx.fillStyle = river;
  ctx.fillRect(0, riverTop, W, riverBot - riverTop);

  // River current ripples
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
  for (let row = 0; row < 4; row++) {
    const ry = riverTop + 5 + row * (riverBot - riverTop) / 4;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = ry + Math.sin(x * 0.04 + t * 0.8 + row * 2) * 2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Sun sparkles on water
  ctx.fillStyle = 'rgba(255,255,200,0.4)';
  for (let i = 0; i < 8; i++) {
    const sx = ((i * 97 + t * 15) % (W + 40)) - 20;
    const sy = riverTop + ((i * 53 + 11) % (riverBot - riverTop - 4));
    if (Math.sin(t * 3 + i * 1.7) > 0.6) {
      ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, 7); ctx.fill();
    }
  }

  // Draw floaters (kayakers and tubers)
  updateFloaters(1/60);
  for (const f of floaters) {
    const bobY = Math.sin(f.bob * 2.5) * 3;
    const fy = f.y + bobY;

    if (f.type === 'kayak') {
      // Kayak hull
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(f.x - 20, fy); ctx.quadraticCurveTo(f.x - 24, fy + 6, f.x - 16, fy + 6);
      ctx.lineTo(f.x + 16, fy + 6); ctx.quadraticCurveTo(f.x + 24, fy + 6, f.x + 20, fy);
      ctx.closePath(); ctx.fill();
      // Person
      ctx.fillStyle = f.personColor;
      ctx.beginPath(); ctx.arc(f.x, fy - 5, 4, 0, 7); ctx.fill(); // head
      ctx.fillStyle = pick(['#e04040','#4080e0','#e0a020']);
      ctx.fillRect(f.x - 3, fy - 1, 6, 5); // torso/pfd
      // Paddle
      const paddleAngle = Math.sin(f.bob * 3) * 0.6;
      ctx.save(); ctx.translate(f.x, fy);
      ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(14, 4 + paddleAngle * 8); ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.fillRect(-16, -6, 5, 4); ctx.fillRect(12, 2 + paddleAngle * 8, 5, 4);
      ctx.restore();
      // Wake
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(f.x + 22, fy + 3);
      ctx.quadraticCurveTo(f.x + 35, fy + 6, f.x + 50, fy + 2); ctx.stroke();
    } else {
      // Inner tube
      ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.ellipse(f.x, fy + 2, 14, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.ellipse(f.x, fy + 2, 8, 5, 0, 0, 7); ctx.fill(); // hole
      // Person lounging
      ctx.fillStyle = f.personColor;
      ctx.beginPath(); ctx.arc(f.x - 4, fy - 6, 4, 0, 7); ctx.fill(); // head
      ctx.fillRect(f.x - 6, fy - 2, 8, 4); // body reclined
      // Legs dangling in water
      ctx.fillStyle = f.personColor;
      ctx.fillRect(f.x + 4, fy + 2, 3, 8);
      ctx.fillRect(f.x + 9, fy + 3, 3, 7);
      // Sunglasses
      ctx.fillStyle = '#222';
      ctx.fillRect(f.x - 6, fy - 7, 5, 2);
    }
  }

  // Near river bank
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, riverBot - 2, W, 4);
  ctx.fillStyle = '#6a9a40';
  ctx.fillRect(0, riverBot + 1, W, 6);

  // Grassy ground
  const ground = ctx.createLinearGradient(0, riverBot + 4, 0, H);
  ground.addColorStop(0, '#5a9e3a');
  ground.addColorStop(0.5, '#4a8e2e');
  ground.addColorStop(1, '#3a7a22');
  ctx.fillStyle = ground; ctx.fillRect(0, riverBot + 4, W, H - riverBot - 4);

  // Grass blades
  ctx.strokeStyle = 'rgba(30,80,15,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const gx = (i * 73 + 11) % W;
    const gy = riverBot + 10 + ((i * 47 + 9) % (H * 0.3));
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + rand(-3, 3), gy - rand(4, 8)); ctx.stroke();
  }

  // Rocks by the river
  ctx.fillStyle = '#8a8070';
  ctx.beginPath(); ctx.ellipse(W * 0.15, riverBot + 6, 12, 7, 0.2, 0, 7); ctx.fill();
  ctx.fillStyle = '#9a9080';
  ctx.beginPath(); ctx.ellipse(W * 0.85, riverBot + 8, 10, 6, -0.1, 0, 7); ctx.fill();
  ctx.fillStyle = '#7a7060';
  ctx.beginPath(); ctx.ellipse(W * 0.82, riverBot + 5, 6, 4, 0.3, 0, 7); ctx.fill();

  // Cookie plate on the grass
  const px = W * 0.50, py = H * 0.82;
  ctx.fillStyle = '#e9e2d6'; ctx.beginPath(); ctx.ellipse(px, py, 26, 9, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#c98a4b'; ctx.beginPath(); ctx.arc(px - 6, py - 3, 7, 0, 7); ctx.arc(px + 7, py - 2, 7, 0, 7); ctx.fill();

  // Wildflowers
  const flowers = ['#e07a8b','#e0a020','#9060c0','#fff'];
  for (let i = 0; i < 12; i++) {
    const fx = (i * 83 + 23) % W;
    const fy = riverBot + 16 + ((i * 59 + 17) % (H * 0.28));
    ctx.fillStyle = flowers[i % flowers.length];
    ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a7a22'; ctx.fillRect(fx - 0.5, fy, 1, 5);
  }

  // sprite birds over the far tree line
  SpriteRenderer.submit({sprite:'bird',phase:'background',x:W*0.4+Math.sin(t*0.35)*28,y:H*0.18+Math.sin(t*0.5)*5,width:14,height:14,anchorY:0.5,frame:Math.floor(t*6)%4}); /* small — distant */
  // butterfly near the wildflowers
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.65+Math.sin(t*1.3)*18,y:H*0.72+Math.cos(t*1.6)*8,anchorY:0.5,frame:Math.floor(t*8)%4});
  // bush along the near bank
  SpriteRenderer.submit({sprite:'bush',phase:'ground',x:W*0.10,y:riverBot+10,anchorY:1,frame:0});
  // grass tuft near the bank
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.82,y:riverBot+18,frame:Math.floor(sceneTime*3)%4});
  // water ripple on the river
  SpriteRenderer.submit({sprite:'waterRipple',x:W*0.50,y:H*0.50,frame:Math.floor(sceneTime*5)%4});
  SpriteRenderer.submit({sprite:'riverbankEdge',x:W*0.50,y:H*0.60,frame:0});
}

/* ══════════════════════ ADDITIONAL SCENES ══════════════════════
   Each scene is a self-contained draw function animated off `sceneTime`,
   registered with registerScene(). Indoor scenes get a theme/purpose. */

/* ── ART STUDIO (indoor · painting) ── */
function drawArtStudio(){
  const t = sceneTime, floorY = H*0.62;

  // warm wall + wood floor
  const wall = ctx.createLinearGradient(0,0,0,floorY);
  wall.addColorStop(0,'#efe4d6'); wall.addColorStop(1,'#e3d3bf');
  ctx.fillStyle = wall; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(0,floorY-3,W,3);
  const floor = ctx.createLinearGradient(0,floorY,0,H);
  floor.addColorStop(0,'#b98a5a'); floor.addColorStop(1,'#a9784a');
  ctx.fillStyle = floor; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle = 'rgba(90,60,30,.22)'; ctx.lineWidth = 1;
  for (let i=1;i<7;i++){ const y=floorY+(i/7)*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // big window with daylight
  const wx=W*0.06, wy=H*0.10, ww=W*0.30, wh=H*0.34;
  ctx.save(); roundRect(wx,wy,ww,wh,6); ctx.clip();
  const sky = ctx.createLinearGradient(0,wy,0,wy+wh);
  sky.addColorStop(0,'#9ed0f0'); sky.addColorStop(1,'#dff0fb');
  ctx.fillStyle = sky; ctx.fillRect(wx,wy,ww,wh);
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(wx+ww*0.62,wy+wh*0.32,10,0,7); ctx.arc(wx+ww*0.74,wy+wh*0.34,8,0,7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='#fff'; ctx.lineWidth=6; roundRect(wx,wy,ww,wh,6); ctx.stroke();
  ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke();

  // sunbeam + dust motes
  ctx.fillStyle='rgba(255,245,200,.13)';
  ctx.beginPath(); ctx.moveTo(wx+6,wy+wh); ctx.lineTo(wx+ww,wy+wh); ctx.lineTo(wx+ww+70,H); ctx.lineTo(wx-20,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#fff8dc';
  for (let i=0;i<16;i++){
    const bx = wx + 10 + ((i*61.7) % (ww+70)) + Math.sin(t*0.6+i)*4;
    const by = (wy+wh) + (((i*53.3) + t*12) % (H-(wy+wh)));
    ctx.globalAlpha = 0.35 + 0.35*Math.sin(t+i);
    ctx.beginPath(); ctx.arc(bx,by,1,0,7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // framed paintings on the wall
  function painting(px,py,pw,ph,fn){
    ctx.fillStyle='#8a5a3a'; roundRect(px-3,py-3,pw+6,ph+6,2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(px,py,pw,ph); ctx.clip(); fn(px,py,pw,ph); ctx.restore();
  }
  painting(W*0.55,H*0.12,44,34,(x,y,w,h)=>{ const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#ffd27f'); g.addColorStop(1,'#ff8a5a'); ctx.fillStyle=g; ctx.fillRect(x,y,w,h); ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(x+w*0.5,y+h*0.55,7,0,7); ctx.fill(); });
  painting(W*0.73,H*0.10,40,30,(x,y,w,h)=>{ ctx.fillStyle='#2e7d32'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#8bc34a'; for(let i=0;i<5;i++) ctx.fillRect(x+i*8,y+h-8-i*2,6,8+i*2); });
  painting(W*0.89,H*0.16,28,40,(x,y,w,h)=>{ ctx.fillStyle='#e0f0ff'; ctx.fillRect(x,y,w,h); ctx.strokeStyle='#4a90d9'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+4,y+h-6); ctx.lineTo(x+w*0.5,y+8); ctx.lineTo(x+w-4,y+h-6); ctx.stroke(); });

  // easel with a canvas (painting in progress)
  const ex=W*0.70, ey=H*0.42, legH=H*0.32;
  ctx.strokeStyle='#7a5230'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(ex-24,ey+legH); ctx.moveTo(ex,ey); ctx.lineTo(ex+24,ey+legH); ctx.moveTo(ex,ey+12); ctx.lineTo(ex,ey+legH*0.9); ctx.stroke();
  const cw=64, ch=52, cxp=ex-cw/2, cyp=ey+6;
  ctx.fillStyle='#7a5230'; ctx.fillRect(cxp-4,cyp-4,cw+8,ch+8);
  ctx.fillStyle='#fffdf5'; ctx.fillRect(cxp,cyp,cw,ch);
  ctx.save(); ctx.beginPath(); ctx.rect(cxp,cyp,cw,ch); ctx.clip();
  const cg=ctx.createLinearGradient(0,cyp,0,cyp+ch); cg.addColorStop(0,'#bfe3ff'); cg.addColorStop(1,'#eaf7ff'); ctx.fillStyle=cg; ctx.fillRect(cxp,cyp,cw,ch);
  ctx.fillStyle='#7cc36a'; ctx.beginPath(); ctx.moveTo(cxp,cyp+ch); ctx.lineTo(cxp+cw*0.4,cyp+ch*0.6); ctx.lineTo(cxp+cw*0.85,cyp+ch); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f6c945'; ctx.beginPath(); ctx.arc(cxp+cw*0.75,cyp+ch*0.3,6,0,7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=1; ctx.strokeRect(cxp,cyp,cw,ch);

  // table with brush jar + palette
  const tx=W*0.16, ty=floorY+16;
  ctx.fillStyle='#9a6b3f'; roundRect(tx-26,ty,52,8,2); ctx.fill();
  ctx.fillRect(tx-22,ty+8,4,26); ctx.fillRect(tx+18,ty+8,4,26);
  ctx.fillStyle='rgba(180,210,230,.85)'; roundRect(tx-17,ty-16,13,16,2); ctx.fill();
  const bc=['#c0392b','#2980b9','#27ae60','#f1c40f'];
  for(let i=0;i<4;i++){ ctx.strokeStyle=bc[i]; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(tx-14+i*3,ty-16); ctx.lineTo(tx-15+i*3,ty-27-i*2); ctx.stroke(); }
  ctx.fillStyle='#caa472'; ctx.beginPath(); ctx.ellipse(tx+8,ty-3,12,7,0,0,7); ctx.fill();
  const pc=['#c0392b','#2980b9','#27ae60','#f1c40f','#8e44ad'];
  for(let i=0;i<5;i++){ ctx.fillStyle=pc[i]; ctx.beginPath(); ctx.arc(tx+2+i*4,ty-5+(i%2)*3,1.6,0,7); ctx.fill(); }

  // potted plant in the corner
  const plx=W*0.94, ply=floorY+12;
  ctx.fillStyle='#b5651d'; roundRect(plx-10,ply,20,18,2); ctx.fill();
  ctx.fillStyle='#3a9a3a';
  for(let i=0;i<5;i++){ const a=-1.4+i*0.55; ctx.save(); ctx.translate(plx,ply); ctx.rotate(a+Math.sin(t*0.8+i)*0.05); ctx.beginPath(); ctx.ellipse(0,-16,4,16,0,0,7); ctx.fill(); ctx.restore(); }

  // cat napping near the easel
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.26,y:floorY+14,anchorY:1,frame:Math.floor(t*7)%4});
}
registerScene('artstudio', drawArtStudio);

/* ── STARRY CAMPSITE (outdoor · night) ── */
function drawPine(px, baseY, h){
  ctx.beginPath(); ctx.moveTo(px, baseY-h); ctx.lineTo(px-h*0.4, baseY); ctx.lineTo(px+h*0.4, baseY); ctx.closePath(); ctx.fill();
}
function drawCampsite(){
  const t = sceneTime, groundY = H*0.62;

  // night sky
  const sky = ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#0e1230'); sky.addColorStop(0.6,'#1c2350'); sky.addColorStop(1,'#39325e');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,groundY);

  // stars (twinkling)
  for (let i=0;i<70;i++){
    const sx=(i*97+13)%W, sy=(i*57+7)%(groundY-16);
    const tw=0.5+0.5*Math.sin(t*2+i);
    ctx.fillStyle=`rgba(255,255,255,${0.25+0.6*tw})`;
    ctx.fillRect(sx,sy,1.4,1.4);
  }
  // shooting star occasionally
  const ssT=(t%9)/9;
  if (ssT<0.12){ const sp=ssT/0.12; const sx=W*0.2+sp*W*0.5, sy=H*0.1+sp*H*0.08; ctx.strokeStyle=`rgba(255,255,255,${1-sp})`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx-14,sy-6); ctx.stroke(); }

  // moon + glow
  ctx.fillStyle='rgba(245,243,208,.15)'; ctx.beginPath(); ctx.arc(W*0.8,H*0.14,32,0,7); ctx.fill();
  ctx.fillStyle='#f5f3d0'; ctx.beginPath(); ctx.arc(W*0.8,H*0.14,20,0,7); ctx.fill();
  ctx.fillStyle='rgba(200,198,170,.5)'; ctx.beginPath(); ctx.arc(W*0.78,H*0.12,4,0,7); ctx.arc(W*0.85,H*0.16,3,0,7); ctx.fill();

  // pine silhouettes on the horizon
  ctx.fillStyle='#12200f';
  for (let i=0;i<8;i++){ drawPine(i*W/7-8, groundY+4, 30+((i*37)%22)); }

  // ground
  const gr=ctx.createLinearGradient(0,groundY,0,H);
  gr.addColorStop(0,'#2c3a20'); gr.addColorStop(1,'#20301a');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle='rgba(20,40,15,.5)'; ctx.lineWidth=1;
  for (let i=0;i<40;i++){ const gx=(i*67+13)%W, gy=groundY+8+((i*43+7)%(H-groundY-10)); ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.sin(i)*2,gy-4-Math.abs(Math.cos(i))*3); ctx.stroke(); }

  // tent (left)
  const tX=W*0.20, tTop=groundY+8, tBase=groundY+72, tW=94;
  ctx.fillStyle='#c0603a'; ctx.beginPath(); ctx.moveTo(tX,tTop); ctx.lineTo(tX-tW/2,tBase); ctx.lineTo(tX+tW/2,tBase); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#9c4a29'; ctx.beginPath(); ctx.moveTo(tX,tTop); ctx.lineTo(tX+tW/2,tBase); ctx.lineTo(tX+tW*0.18,tBase); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a1e14'; ctx.beginPath(); ctx.moveTo(tX,tTop+10); ctx.lineTo(tX-14,tBase); ctx.lineTo(tX+14,tBase); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#e8c8a0'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(tX,tTop+10); ctx.lineTo(tX-2,tBase); ctx.stroke();

  // campfire (right)
  const fX=W*0.72, fY=groundY+66;
  const glow=ctx.createRadialGradient(fX,fY-10,2,fX,fY-10,54);
  glow.addColorStop(0,'rgba(255,170,60,.5)'); glow.addColorStop(1,'rgba(255,170,60,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(fX,fY-10,54,0,7); ctx.fill();
  ctx.fillStyle='#555'; for(let i=0;i<6;i++){ const a=i/6*6.28; ctx.beginPath(); ctx.arc(fX+Math.cos(a)*20,fY+2+Math.sin(a)*5,3,0,7); ctx.fill(); }
  ctx.strokeStyle='#5a3a20'; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(fX-16,fY); ctx.lineTo(fX+16,fY-6); ctx.moveTo(fX-16,fY-6); ctx.lineTo(fX+16,fY); ctx.stroke(); ctx.lineCap='butt';
  const flameCols=['#ff5a00','#ff9a1f','#ffd21f'];
  for (let i=0;i<3;i++){
    const fl=0.7+0.3*Math.sin(t*8+i*2), h=(22-i*4)*fl, sway=Math.sin(t*10+i)*3;
    ctx.fillStyle=flameCols[i];
    ctx.beginPath(); ctx.moveTo(fX-7+i*3, fY-4);
    ctx.quadraticCurveTo(fX-7+i*3+sway, fY-4-h*0.6, fX+sway, fY-4-h);
    ctx.quadraticCurveTo(fX+7-i*3+sway, fY-4-h*0.6, fX+7-i*3, fY-4);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle='#ffcf5a';
  for (let i=0;i<8;i++){ const life=(t*30+i*20)%80; const sy=fY-10-life, sx=fX+Math.sin(t*3+i)*8; ctx.globalAlpha=Math.max(0,1-life/80); ctx.fillRect(sx,sy,1.4,1.4); }
  ctx.globalAlpha=1;

  // lantern near the tent entrance
  SpriteRenderer.submit({sprite:'lantern',phase:'ground',x:W*0.34,y:groundY+60,anchorY:1,frame:Math.floor(t*3)%4});
  // fireflies drifting above the campsite
  SpriteRenderer.submit({sprite:'fireflies',phase:'actors',x:W*0.60+Math.sin(t*0.6)*18,y:groundY+20+Math.sin(t*0.9)*12,anchorY:0.5,frame:Math.floor(t*5)%4});
  // tree at the edge of the campsite
  SpriteRenderer.submit({sprite:'tree',x:W*0.92,y:groundY+48,frame:Math.floor(sceneTime*2)%4});
  // grass tuft near the fire
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.52,y:groundY+78,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'dirtPath',x:W*0.50,y:groundY+50,frame:0});
  SpriteRenderer.submit({sprite:'grassDirtEdge',x:W*0.50,y:groundY+90,frame:1});
}
registerScene('campsite', drawCampsite);

/* ── BAKERY (indoor · baking) ── */
function drawBakery(){
  const t = sceneTime, floorY = H*0.62, fh = H-floorY;

  // wall + subtle stripes
  ctx.fillStyle='#f6e7d3'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(211,170,120,.15)';
  for (let x=0;x<W;x+=26) ctx.fillRect(x,0,13,floorY);

  // checker-tiled floor
  ctx.fillStyle='#e2ccac'; ctx.fillRect(0,floorY,W,fh);
  for (let r=0;r<6;r++) for (let c=0;c<12;c++) if ((r+c)%2){ ctx.fillStyle='rgba(120,90,60,.15)'; ctx.fillRect(c*W/12, floorY+r/6*fh, W/12, fh/6); }
  ctx.fillStyle='rgba(0,0,0,.05)'; ctx.fillRect(0,floorY-2,W,2);

  // pendant lamps
  for (const lx of [W*0.30,W*0.70]){
    ctx.strokeStyle='#5a4632'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,H*0.09); ctx.stroke();
    ctx.fillStyle='rgba(255,225,150,.20)'; ctx.beginPath(); ctx.arc(lx,H*0.13,18,0,7); ctx.fill();
    ctx.fillStyle='#e8b84b'; ctx.beginPath(); ctx.moveTo(lx-10,H*0.09+9); ctx.lineTo(lx+10,H*0.09+9); ctx.lineTo(lx+6,H*0.09); ctx.lineTo(lx-6,H*0.09); ctx.closePath(); ctx.fill();
  }

  // chalkboard menu
  ctx.fillStyle='#33352f'; roundRect(W*0.40,H*0.05,W*0.20,H*0.12,4); ctx.fill();
  ctx.strokeStyle='#c9a06a'; ctx.lineWidth=3; roundRect(W*0.40,H*0.05,W*0.20,H*0.12,4); ctx.stroke();
  ctx.textAlign='center'; ctx.fillStyle='#f5ede0'; ctx.font='bold 10px Segoe UI, sans-serif';
  ctx.fillText('~ Bakery ~', W*0.5, H*0.085);
  ctx.font='8px Segoe UI, sans-serif'; ctx.fillStyle='#e7d9c4';
  ctx.fillText('cookies · cakes', W*0.5, H*0.115); ctx.fillText('fresh daily', W*0.5, H*0.14);
  ctx.textAlign='left';

  // bread shelf on the wall (right)
  const shX=W*0.62, shY=H*0.30, shW=W*0.34;
  ctx.fillStyle='#9a6b3f'; ctx.fillRect(shX,shY,shW,5); ctx.fillRect(shX,shY+26,shW,5);
  const loaf=(x,y,c)=>{ ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x,y,9,6,0,0,7); ctx.fill(); ctx.strokeStyle='rgba(90,50,20,.5)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-4,y-3); ctx.lineTo(x-2,y+1); ctx.moveTo(x+2,y-4); ctx.lineTo(x+4,y); ctx.stroke(); };
  for (let i=0;i<5;i++) loaf(shX+16+i*22, shY-2, i%2?'#d99a52':'#c98a4b');
  for (let i=0;i<5;i++) loaf(shX+16+i*22, shY+24, i%2?'#c98a4b':'#d99a52');

  // oven on the floor (right) with a warm glowing window
  const ovX=W*0.74, ovW=W*0.22, ovTop=floorY-60;
  ctx.fillStyle='#6f7178'; roundRect(ovX,ovTop,ovW,60,4); ctx.fill();
  ctx.fillStyle='#4a4c52'; roundRect(ovX+6,ovTop+9,ovW-12,34,4); ctx.fill();
  const og=ctx.createLinearGradient(0,ovTop+10,0,ovTop+42); og.addColorStop(0,'#ffb347'); og.addColorStop(1,'#ff7a1f');
  ctx.fillStyle=og; roundRect(ovX+10,ovTop+13,ovW-20,26,3); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(ovX+ovW/2-1,ovTop+13,2,26);
  ctx.fillStyle='#2f3136'; ctx.fillRect(ovX+9,ovTop+47,ovW-18,4);

  // glass display case on the floor (left) full of pastries
  const dcX=W*0.05, dcW=W*0.44, dcTop=floorY-54, dcGlassH=44;
  ctx.fillStyle='rgba(200,225,235,.30)'; ctx.fillRect(dcX,dcTop,dcW,dcGlassH);
  ctx.strokeStyle='#cfe0e8'; ctx.lineWidth=2; ctx.strokeRect(dcX,dcTop,dcW,dcGlassH);
  ctx.fillStyle='#a06a3c'; ctx.fillRect(dcX,dcTop+dcGlassH,dcW,floorY-(dcTop+dcGlassH));
  ctx.fillStyle='rgba(255,255,255,.45)'; ctx.fillRect(dcX+3,dcTop+dcGlassH/2,dcW-6,2);   // middle shelf
  // pastries
  const cookie=(x,y)=>{ ctx.fillStyle='#c98a4b'; ctx.beginPath(); ctx.arc(x,y,5,0,7); ctx.fill(); ctx.fillStyle='#5a3b22'; ctx.fillRect(x-2,y-1,1.4,1.4); ctx.fillRect(x+1,y+1,1.4,1.4); ctx.fillRect(x-1,y+2,1.4,1.4); };
  const cupcake=(x,y,fc)=>{ ctx.fillStyle='#d9a066'; ctx.beginPath(); ctx.moveTo(x-5,y); ctx.lineTo(x+5,y); ctx.lineTo(x+3,y+8); ctx.lineTo(x-3,y+8); ctx.closePath(); ctx.fill(); ctx.fillStyle=fc; ctx.beginPath(); ctx.arc(x,y-1,5,Math.PI,0); ctx.fill(); ctx.fillStyle='#c0392b'; ctx.fillRect(x-0.7,y-6,1.4,1.4); };
  const croissant=(x,y)=>{ ctx.fillStyle='#e0a94f'; ctx.beginPath(); ctx.arc(x,y+2,6,Math.PI*1.1,Math.PI*1.9); ctx.arc(x,y+2,3,Math.PI*1.9,Math.PI*1.1,true); ctx.closePath(); ctx.fill(); };
  const shelfTopY=dcTop+dcGlassH/2-3, shelfMidY=dcTop+dcGlassH-6;
  for (let i=0;i<5;i++) cookie(dcX+16+i*30, shelfTopY);
  const fcs=['#f2a6b3','#f7d9e3','#b5e0c0','#f7d9e3','#f2a6b3'];
  for (let i=0;i<5;i++) (i%2 ? cupcake(dcX+16+i*30, shelfMidY-6, fcs[i]) : croissant(dcX+16+i*30, shelfMidY));

  // steam rising from the oven and case
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2;
  for (const [sxx,syy] of [[ovX+ovW*0.5,ovTop],[dcX+dcW*0.5,dcTop]]){
    ctx.beginPath();
    for (let k=0;k<=10;k++){ const yy=syy-k*4; const xx=sxx+Math.sin(t*3+k*0.7)*4*(k/10); if(k===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy); }
    ctx.stroke();
  }

  // kittens napping near the oven
  SpriteRenderer.submit({sprite:'kittens',phase:'actors',x:W*0.68,y:floorY+20,anchorY:1,frame:Math.floor(t*6)%4});
  // doorway at the back
  SpriteRenderer.submit({sprite:'doorway',x:W*0.88,y:floorY,frame:Math.floor(sceneTime*2)%4});
  SpriteRenderer.submit({sprite:'terracottaTile',x:W*0.50,y:floorY+40,frame:0});
}
registerScene('bakery', drawBakery);

/* ── COZY LIBRARY (indoor · reading) ── */
function drawLibrary(){
  const t = sceneTime, floorY = H*0.62;

  // dark wood wall + plank floor
  ctx.fillStyle='#3a2b22'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#7a5230'); fl.addColorStop(1,'#5f3f24');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
  for (let i=1;i<6;i++){ const y=floorY+i/6*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // bookshelf (left) full of colourful spines
  const bsX=W*0.03, bsY=H*0.06, bsW=W*0.58, bsH=floorY-bsY-6, shelves=5, shelfH=bsH/shelves;
  ctx.fillStyle='#4a3524'; ctx.fillRect(bsX-4,bsY-4,bsW+8,bsH+8);
  const spineCols=['#8c3b3b','#3b6e8c','#3b8c5a','#b58a2e','#6e3b8c','#a0522d','#2e6e6e','#8c6e3b'];
  for (let s=0;s<shelves;s++){
    const sy=bsY+s*shelfH;
    ctx.fillStyle='#241a10'; ctx.fillRect(bsX,sy,bsW,shelfH);
    let x=bsX+3, bi=s*7;
    while (x<bsX+bsW-6){
      const bw=5+(bi*37%5), bh=shelfH-6-(bi*13%6);
      ctx.fillStyle=spineCols[bi%spineCols.length];
      ctx.fillRect(x, sy+shelfH-4-bh, bw, bh);
      x+=bw+2; bi++;
    }
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(bsX,sy+shelfH-4,bsW,4);
  }

  // fireplace (right) with animated fire
  const fpX=W*0.70, fpW=W*0.26, fpTop=H*0.30, fpBot=floorY;
  ctx.fillStyle='#6e4a3a'; ctx.fillRect(fpX-6,fpTop-8,fpW+12,fpBot-fpTop+8);
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1;
  for (let by=fpTop-8;by<fpBot;by+=8){ ctx.beginPath(); ctx.moveTo(fpX-6,by); ctx.lineTo(fpX+fpW+6,by); ctx.stroke(); }
  const fbX=fpX+8, fbY=fpTop+10, fbW=fpW-16, fbH=fpBot-fbY;
  ctx.fillStyle='#1a1008'; ctx.fillRect(fbX,fbY,fbW,fbH);
  const glow=ctx.createRadialGradient(fbX+fbW/2,fbY+fbH*0.7,4,fbX+fbW/2,fbY+fbH*0.7,fbW);
  glow.addColorStop(0,'rgba(255,150,50,.6)'); glow.addColorStop(1,'rgba(255,150,50,0)');
  ctx.fillStyle=glow; ctx.fillRect(fbX-12,fbY,fbW+24,fbH+12);
  ctx.strokeStyle='#5a3a20'; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(fbX+6,fbY+fbH-6); ctx.lineTo(fbX+fbW-6,fbY+fbH-10); ctx.stroke(); ctx.lineCap='butt';
  const fcx=fbX+fbW/2, fbaseY=fbY+fbH-8, fcol=['#ff5a00','#ff8a1f','#ffc21f','#ffe07a'];
  for (let i=0;i<4;i++){ const a=0.7+0.3*Math.sin(t*7+i*1.7), h=fbH*0.55*a*(1-i*0.12), off=(i-1.5)*7; ctx.fillStyle=fcol[i]; ctx.beginPath(); ctx.moveTo(fcx+off-6,fbaseY); ctx.quadraticCurveTo(fcx+off+Math.sin(t*9+i)*4,fbaseY-h*0.6,fcx+off,fbaseY-h); ctx.quadraticCurveTo(fcx+off+6,fbaseY-h*0.6,fcx+off+6,fbaseY); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='#4a3524'; ctx.fillRect(fpX-10,fpTop-14,fpW+20,8);

  // armchair on the floor
  const acX=W*0.32, acY=floorY-4;
  ctx.fillStyle='#7a3b4a'; roundRect(acX-26,acY-48,52,48,8); ctx.fill();
  ctx.fillStyle='#8c4a5a'; roundRect(acX-30,acY-40,11,40,5); ctx.fill(); roundRect(acX+19,acY-40,11,40,5); ctx.fill();
  ctx.fillStyle='#9a5a68'; roundRect(acX-20,acY-24,40,14,5); ctx.fill();

  // floor reading lamp
  const lpX=W*0.13, lpY=floorY;
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(lpX,lpY); ctx.lineTo(lpX,lpY-92); ctx.stroke();
  ctx.fillStyle='rgba(255,225,150,.18)'; ctx.beginPath(); ctx.arc(lpX,lpY-92,26,0,7); ctx.fill();
  ctx.fillStyle='#e8c96a'; ctx.beginPath(); ctx.moveTo(lpX-14,lpY-92); ctx.lineTo(lpX+14,lpY-92); ctx.lineTo(lpX+9,lpY-110); ctx.lineTo(lpX-9,lpY-110); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a1e14'; ctx.beginPath(); ctx.ellipse(lpX,lpY,10,3,0,0,7); ctx.fill();

  // rug
  ctx.fillStyle='rgba(140,60,74,.28)'; ctx.beginPath(); ctx.ellipse(W*0.4,H*0.83,W*0.34,H*0.08,0,0,7); ctx.fill();

  // book left open on the armchair
  SpriteRenderer.submit({sprite:'book',phase:'ground',x:W*0.32,y:floorY-28,anchorY:1,frame:0});
  // cat napping by the fireplace
  SpriteRenderer.submit({sprite:'cat',phase:'ground',x:W*0.62,y:floorY,width:55,height:55,anchorY:1,frame:Math.floor(t*7)%4}); /* large — prominent */
  SpriteRenderer.submit({sprite:'woodFloor',x:W*0.50,y:floorY+40,frame:0});
}
registerScene('library', drawLibrary);

/* ── CHERRY BLOSSOM PARK (outdoor · spring) ── */
function drawCherryBlossom(){
  const t = sceneTime, groundY = H*0.66;

  // soft sky
  const sky=ctx.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#bfe3f5'); sky.addColorStop(1,'#fce4ec');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);

  // distant hill
  ctx.fillStyle='#cde6c0'; ctx.beginPath(); ctx.moveTo(0,groundY);
  ctx.quadraticCurveTo(W*0.3,groundY-40,W*0.6,groundY-12); ctx.quadraticCurveTo(W*0.85,groundY-32,W,groundY-8);
  ctx.lineTo(W,groundY); ctx.closePath(); ctx.fill();

  // grass + path
  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#8bc34a'); g.addColorStop(1,'#6fae35');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#d9c29a'; ctx.beginPath(); ctx.moveTo(W*0.36,H); ctx.lineTo(W*0.46,groundY); ctx.lineTo(W*0.54,groundY); ctx.lineTo(W*0.68,H); ctx.closePath(); ctx.fill();

  // cherry trees
  function tree(cx,baseY,scale){
    ctx.strokeStyle='#6a4a32'; ctx.lineWidth=8*scale; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(cx,baseY); ctx.lineTo(cx,baseY-60*scale);
    ctx.moveTo(cx,baseY-40*scale); ctx.lineTo(cx-20*scale,baseY-64*scale);
    ctx.moveTo(cx,baseY-46*scale); ctx.lineTo(cx+20*scale,baseY-70*scale);
    ctx.stroke(); ctx.lineCap='butt';
    const cols=['#f7b8d0','#f9c9dd','#ffd7e6','#f6a5c4'];
    for (let i=0;i<14;i++){ const a=i/14*6.28, r=28*scale, bx=cx+Math.cos(a)*r*(0.6+((i*13)%5)/8), by=baseY-70*scale+Math.sin(a)*r*0.7; ctx.fillStyle=cols[i%4]; ctx.beginPath(); ctx.arc(bx,by,12*scale,0,7); ctx.fill(); }
    ctx.fillStyle='#f9c9dd'; ctx.beginPath(); ctx.arc(cx,baseY-74*scale,20*scale,0,7); ctx.fill();
  }
  tree(W*0.17,groundY+12,1.1);
  tree(W*0.85,groundY+6,0.95);

  // park bench
  const bX=W*0.5, bY=groundY+42;
  ctx.fillStyle='#8a5a3a';
  ctx.fillRect(bX-26,bY-10,52,5); ctx.fillRect(bX-26,bY-22,52,4);
  ctx.fillRect(bX-22,bY-5,4,14); ctx.fillRect(bX+18,bY-5,4,14);
  ctx.fillRect(bX-24,bY-22,4,12); ctx.fillRect(bX+20,bY-22,4,12);

  // drifting petals
  ctx.fillStyle='#f8bcd4';
  for (let i=0;i<26;i++){
    const seed=i*53.7;
    const px=((seed*1.7 + Math.sin(t*0.8+i)*30) % W + W) % W;
    const py=((seed*2.3 + t*22) % (H+20)) - 10;
    ctx.save(); ctx.translate(px,py); ctx.rotate(t*2+i);
    ctx.beginPath(); ctx.ellipse(0,0,3,1.6,0,0,7); ctx.fill(); ctx.restore();
  }

  // sprite butterflies fluttering among the blossoms
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.35+Math.sin(t*1.2)*20,y:groundY-20+Math.cos(t*1.5)*12,anchorY:0.5,frame:Math.floor(t*8)%4});
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.7+Math.sin(t*0.9+2)*24,y:groundY-30+Math.cos(t*1.3+1)*10,anchorY:0.5,frame:Math.floor(t*8+2)%4,flipX:true});
  // a bird on the park bench
  SpriteRenderer.submit({sprite:'bird',phase:'actors',x:W*0.46,y:groundY+30,anchorY:1,frame:Math.floor(t*6)%4});
  // park bench along the path
  SpriteRenderer.submit({sprite:'parkBench',x:W*0.56,y:groundY+62,frame:Math.floor(sceneTime*2.5)%4});
  // flowering bush by the tree
  SpriteRenderer.submit({sprite:'floweringBush',x:W*0.10,y:groundY+20,frame:Math.floor(sceneTime*2.5)%4});
  SpriteRenderer.submit({sprite:'pathBorder',x:W*0.50,y:groundY+40,frame:0});
}
registerScene('cherryblossom', drawCherryBlossom);

/* ── AQUARIUM HALL (indoor · marine life) ── */
function drawAquarium(){
  const t = sceneTime, floorY = H*0.66;

  // dim hall wall
  ctx.fillStyle='#1e2630'; ctx.fillRect(0,0,W,floorY);

  // big tank
  const tX=W*0.08, tY=H*0.08, tW=W*0.84, tH=floorY-tY-18;
  const wa=ctx.createLinearGradient(0,tY,0,tY+tH); wa.addColorStop(0,'#1a6ea0'); wa.addColorStop(1,'#0e4a72');
  ctx.fillStyle=wa; ctx.fillRect(tX,tY,tW,tH);

  ctx.save(); ctx.beginPath(); ctx.rect(tX,tY,tW,tH); ctx.clip();
  // caustic light bands
  ctx.globalAlpha=0.10; ctx.fillStyle='#bff0ff';
  for (let i=0;i<6;i++){ const x=tX+((i*tW/5 + t*12)%(tW+40))-20; ctx.beginPath(); ctx.moveTo(x,tY); ctx.lineTo(x+30,tY); ctx.lineTo(x+10,tY+tH); ctx.lineTo(x-20,tY+tH); ctx.closePath(); ctx.fill(); }
  ctx.globalAlpha=1;
  // sandy bottom + rocks + seaweed
  ctx.fillStyle='#d9c48a'; ctx.beginPath(); ctx.moveTo(tX,tY+tH); ctx.quadraticCurveTo(tX+tW*0.3,tY+tH-14,tX+tW*0.6,tY+tH-6); ctx.quadraticCurveTo(tX+tW*0.85,tY+tH-16,tX+tW,tY+tH-8); ctx.lineTo(tX+tW,tY+tH); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#3a4650'; ctx.beginPath(); ctx.ellipse(tX+tW*0.5,tY+tH-8,26,12,0,0,7); ctx.fill();
  ctx.strokeStyle='#2e8b57'; ctx.lineWidth=4; ctx.lineCap='round';
  for (const sx of [tX+tW*0.2,tX+tW*0.75,tX+tW*0.85]){ ctx.beginPath(); ctx.moveTo(sx,tY+tH-6); for (let k=1;k<=5;k++){ const yy=tY+tH-6-k*10, xx=sx+Math.sin(t*2+k+sx*0.1)*5; ctx.lineTo(xx,yy);} ctx.stroke(); }
  ctx.lineCap='butt';
  // fish
  const fishCols=['#ff8a3d','#ffd24d','#6ad0ff','#ff6a8d','#a0e060'];
  for (let i=0;i<7;i++){
    const speed=(i%2?1:-1)*(14+i*3);
    const fx=tX+(((i*tW/6 + t*speed)%tW)+tW)%tW;
    const fy=tY+22+i*tH*0.10+Math.sin(t*1.5+i)*8;
    const dir=speed>0?1:-1;
    ctx.save(); ctx.translate(fx,fy); ctx.scale(dir,1);
    ctx.fillStyle=fishCols[i%5];
    ctx.beginPath(); ctx.ellipse(0,0,8,5,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8,0); ctx.lineTo(-14,-5); ctx.lineTo(-14,5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(5,-1,1.4,0,7); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(5.4,-1,0.7,0,7); ctx.fill();
    ctx.restore();
  }
  // bubbles
  ctx.fillStyle='rgba(255,255,255,.4)';
  for (let i=0;i<12;i++){ const bx=tX+tW*0.2+(i*37%tW), by=tY+tH-((t*20+i*25)%tH); ctx.beginPath(); ctx.arc(bx,by,1.5+(i%3),0,7); ctx.fill(); }
  ctx.restore();

  // tank frame + glass sheen
  ctx.strokeStyle='#0c1a24'; ctx.lineWidth=8; ctx.strokeRect(tX,tY,tW,tH);
  ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(tX+4,tY+4,tW-8,10);

  // jellyfish drifting in the tank
  SpriteRenderer.submit({sprite:'jellyfish',phase:'actors',x:tX+tW*0.65+Math.sin(t*0.5)*12,y:tY+tH*0.35+Math.sin(t*0.7)*10,anchorY:0.5,frame:Math.floor(t*5)%4});
  // whale shark gliding through the tank
  SpriteRenderer.submit({sprite:'whaleShark',phase:'actors',x:tX+((t*18)%(tW+60))-30,y:tY+tH*0.25+Math.sin(t*0.4)*8,anchorY:0.5,frame:Math.floor(t*5)%4});

  // blue-lit floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#24303a'); fl.addColorStop(1,'#1a242c');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.fillStyle='rgba(90,180,230,.10)'; ctx.beginPath(); ctx.ellipse(W*0.5,floorY+10,W*0.42,22,0,0,7); ctx.fill();
}
registerScene('aquarium', drawAquarium);

/* ── GREENHOUSE CONSERVATORY (indoor · plants) ── */
function drawPotPlant(x,baseY,s,type){
  ctx.fillStyle='#c56a3a'; ctx.beginPath(); ctx.moveTo(x-14*s,baseY-2); ctx.lineTo(x+14*s,baseY-2); ctx.lineTo(x+10*s,baseY+18*s); ctx.lineTo(x-10*s,baseY+18*s); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#a85830'; ctx.fillRect(x-15*s,baseY-6,30*s,6);
  const top=baseY-4;
  if (type==='palm'){
    ctx.strokeStyle='#2e8b3a'; ctx.lineWidth=4*s; ctx.lineCap='round';
    for (let k=0;k<6;k++){ const a=-1.5+k*0.6; ctx.beginPath(); ctx.moveTo(x,top); ctx.quadraticCurveTo(x+Math.cos(a)*30*s,top-42*s,x+Math.cos(a)*46*s,top-30*s); ctx.stroke(); }
    ctx.lineCap='butt';
  } else if (type==='flower'){
    for (let k=-1;k<=1;k++){ ctx.strokeStyle='#3a9a3a'; ctx.lineWidth=3*s; ctx.beginPath(); ctx.moveTo(x,top); ctx.lineTo(x+k*10*s,top-34*s); ctx.stroke(); ctx.fillStyle=['#e8628c','#f2c14e','#c05fd0'][k+1]; ctx.beginPath(); ctx.arc(x+k*10*s,top-37*s,7*s,0,7); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+k*10*s,top-37*s,2.5*s,0,7); ctx.fill(); }
  } else {
    ctx.fillStyle='#3a9a3a'; ctx.beginPath(); ctx.arc(x,top-20*s,20*s,0,7); ctx.fill();
    ctx.fillStyle='#48b048'; ctx.beginPath(); ctx.arc(x-8*s,top-16*s,12*s,0,7); ctx.arc(x+9*s,top-22*s,12*s,0,7); ctx.fill();
  }
}
function drawGreenhouse(){
  const t = sceneTime, floorY = H*0.66;

  // daylight through glass
  const sky=ctx.createLinearGradient(0,0,0,floorY); sky.addColorStop(0,'#cdefe0'); sky.addColorStop(1,'#eaf7ef');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,floorY);
  // glass frame grid
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=3;
  for (let x=0;x<=W+1;x+=W/6){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,floorY); ctx.stroke(); }
  for (let y=0;y<floorY;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // sun ray
  ctx.fillStyle='rgba(255,250,210,.16)';
  ctx.beginPath(); ctx.moveTo(W*0.7,0); ctx.lineTo(W*0.92,0); ctx.lineTo(W*0.55,floorY); ctx.lineTo(W*0.32,floorY); ctx.closePath(); ctx.fill();

  // tiled floor
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#c9b79a'); fl.addColorStop(1,'#b7a486');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  for (let i=1;i<6;i++){ const y=floorY+i/6*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // hanging trailing plants
  for (const hx of [W*0.16,W*0.5,W*0.84]){
    ctx.fillStyle='#8a5a3a'; ctx.fillRect(hx-9,0,18,8);
    ctx.strokeStyle='#3a9a3a'; ctx.lineWidth=2;
    for (let k=0;k<6;k++){ const a=-1.2+k*0.5; ctx.beginPath(); ctx.moveTo(hx,8); ctx.quadraticCurveTo(hx+Math.cos(a)*14,26,hx+Math.cos(a)*20,38+Math.sin(t+k)*2); ctx.stroke(); }
  }

  // potted plants on the floor
  drawPotPlant(W*0.14,floorY,1.2,'palm');
  drawPotPlant(W*0.36,floorY,0.85,'flower');
  drawPotPlant(W*0.63,floorY,0.95,'bush');
  drawPotPlant(W*0.86,floorY,0.85,'flower');

  // potting table with a watering can (center)
  const tX=W*0.50, tY=floorY+8;
  ctx.fillStyle='#9a6b3f'; ctx.fillRect(tX-30,tY,60,7); ctx.fillRect(tX-26,tY+7,4,22); ctx.fillRect(tX+22,tY+7,4,22);
  ctx.fillStyle='#7fb0c9'; ctx.beginPath(); ctx.ellipse(tX-6,tY-6,12,8,0,0,7); ctx.fill();
  ctx.fillRect(tX-6,tY-18,10,8);
  ctx.strokeStyle='#7fb0c9'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(tX+5,tY-8); ctx.lineTo(tX+16,tY-14); ctx.stroke();

  // a butterfly drifting inside the conservatory
  SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:W*0.55+Math.sin(t*1.1)*22,y:H*0.40+Math.cos(t*1.4)*14,anchorY:0.5,frame:Math.floor(t*8)%4});
  // potted plant on the floor
  SpriteRenderer.submit({sprite:'pottedPlant',phase:'ground',x:W*0.75,y:floorY+24,anchorY:1,frame:0});
}
registerScene('greenhouse', drawGreenhouse);

/* ── PLANETARIUM (indoor · stargazing) ── */
function drawPlanetarium(){
  const t = sceneTime, floorY = H*0.66;

  // dark dome
  ctx.fillStyle='#0a0e1a'; ctx.fillRect(0,0,W,H);
  const dome=ctx.createRadialGradient(W/2,floorY,20,W/2,floorY,W*0.75);
  dome.addColorStop(0,'#141a2e'); dome.addColorStop(1,'#0a0e1a');
  ctx.fillStyle=dome; ctx.beginPath(); ctx.arc(W/2,floorY,W*0.62,Math.PI,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(120,140,200,.18)'; ctx.lineWidth=1;
  for (let r=0.62;r>0.14;r-=0.12){ ctx.beginPath(); ctx.arc(W/2,floorY,W*r,Math.PI,0); ctx.stroke(); }

  // projected starfield (clipped to the dome)
  ctx.save(); ctx.beginPath(); ctx.arc(W/2,floorY,W*0.62,Math.PI,0); ctx.closePath(); ctx.clip();
  for (let i=0;i<90;i++){ const sx=(i*79+11)%W, sy=(i*47+7)%floorY, tw=0.5+0.5*Math.sin(t*2+i); ctx.fillStyle=`rgba(255,255,255,${0.3+0.6*tw})`; ctx.fillRect(sx,sy,1.3,1.3); }
  const con=[[W*0.30,H*0.18],[W*0.38,H*0.28],[W*0.50,H*0.24],[W*0.60,H*0.34],[W*0.68,H*0.22]];
  ctx.strokeStyle='rgba(150,190,255,.5)'; ctx.lineWidth=1; ctx.beginPath(); con.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
  ctx.fillStyle='#cfe0ff'; con.forEach(p=>{ ctx.beginPath(); ctx.arc(p[0],p[1],2,0,7); ctx.fill(); });
  ctx.fillStyle='#c9b58a'; ctx.beginPath(); ctx.arc(W*0.80,H*0.14,9,0,7); ctx.fill();
  ctx.restore();

  // floor
  ctx.fillStyle='#12151f'; ctx.fillRect(0,floorY,W,H-floorY);

  // star projector on a stand (centre)
  const px=W*0.5, py=floorY;
  ctx.fillStyle='rgba(150,190,255,.05)'; ctx.beginPath(); ctx.moveTo(px,py-38); ctx.lineTo(W*0.12,0); ctx.lineTo(W*0.88,0); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#2a2f3d'; ctx.fillRect(px-4,py-30,8,30);
  ctx.fillStyle='#3a4152'; ctx.beginPath(); ctx.arc(px,py-38,10,0,7); ctx.fill();
  ctx.fillStyle='rgba(150,190,255,.7)'; for (let k=0;k<8;k++){ const a=k/8*6.28; ctx.fillRect(px+Math.cos(a)*10-0.7,py-38+Math.sin(a)*10-0.7,1.6,1.6); }

  // reclined seat silhouettes in the foreground
  ctx.fillStyle='#1a1f2b';
  for (const sx of [W*0.16,W*0.84]){ ctx.beginPath(); ctx.moveTo(sx-16,H); ctx.lineTo(sx-10,py+6); ctx.lineTo(sx+10,py+6); ctx.lineTo(sx+16,H); ctx.closePath(); ctx.fill(); }

  // cat sitting among the seats
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.38,y:H*0.92,anchorY:1,frame:Math.floor(t*7)%4});
}
registerScene('planetarium', drawPlanetarium);

/* ── AUTUMN FOREST (outdoor · fall) ── */
function drawAutumnTree(cx,baseY,s,col,alpha){
  ctx.globalAlpha=alpha;
  ctx.strokeStyle='#5a3a22'; ctx.lineWidth=8*s; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx,baseY); ctx.lineTo(cx,baseY-60*s); ctx.moveTo(cx,baseY-40*s); ctx.lineTo(cx-16*s,baseY-58*s); ctx.moveTo(cx,baseY-46*s); ctx.lineTo(cx+16*s,baseY-62*s); ctx.stroke(); ctx.lineCap='butt';
  ctx.fillStyle=col;
  for (let i=0;i<9;i++){ const a=i/9*6.28, r=26*s; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r*0.6, baseY-66*s+Math.sin(a)*r*0.6, 14*s,0,7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(cx,baseY-70*s,20*s,0,7); ctx.fill();
  ctx.globalAlpha=1;
}
function drawAutumnForest(){
  const t = sceneTime, groundY = H*0.66;
  const lc=['#c0562e','#d98324','#e0b020','#a84a2a'];

  // hazy autumn sky
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#f3d9a8'); sky.addColorStop(1,'#f7ead0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);

  // far tree line (muted)
  for (let i=0;i<6;i++) drawAutumnTree(i*W/5-20, groundY+6, 0.6, lc[(i+2)%4], 0.55);

  // leaf-strewn ground
  const g=ctx.createLinearGradient(0,groundY,0,H); g.addColorStop(0,'#8a6a3a'); g.addColorStop(1,'#6e5228');
  ctx.fillStyle=g; ctx.fillRect(0,groundY,W,H-groundY);
  for (let i=0;i<40;i++){ const lx=(i*61+13)%W, ly=groundY+8+((i*37+5)%(H-groundY-8)); ctx.fillStyle=lc[i%4]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(i); ctx.beginPath(); ctx.ellipse(0,0,3,1.5,0,0,7); ctx.fill(); ctx.restore(); }

  // foreground trees
  drawAutumnTree(W*0.16, groundY+14, 1.15, lc[0], 1);
  drawAutumnTree(W*0.84, groundY+10, 1.0, lc[1], 1);

  // falling leaves
  for (let i=0;i<24;i++){
    const seed=i*47.3;
    const lx=(((seed*1.9 + Math.sin(t*0.9+i)*26)%W)+W)%W;
    const ly=((seed*2.1 + t*20)%(H+20))-10;
    ctx.fillStyle=lc[i%4]; ctx.save(); ctx.translate(lx,ly); ctx.rotate(t*2.5+i);
    ctx.beginPath(); ctx.ellipse(0,0,3.5,1.8,0,0,7); ctx.fill(); ctx.restore();
  }

  // a bird perched on a branch
  SpriteRenderer.submit({sprite:'bird',phase:'actors',x:W*0.50,y:groundY+20,anchorY:1,frame:Math.floor(t*6)%4});
  // grass tuft among the fallen leaves
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.40,y:H*0.86,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'grassTuft',x:W*0.68,y:H*0.92,frame:Math.floor(sceneTime*3+1)%4});
  SpriteRenderer.submit({sprite:'forestGrass',x:W*0.30,y:groundY+30,frame:0});
  SpriteRenderer.submit({sprite:'dirtPath',x:W*0.70,y:groundY+50,frame:2});
}
registerScene('autumnforest', drawAutumnForest);

/* ── MUSIC ROOM (indoor · music) ── */
function drawMusicRoom(){
  const t = sceneTime, floorY = H*0.62;

  // moody wall + wood floor
  const wall=ctx.createLinearGradient(0,0,0,floorY); wall.addColorStop(0,'#4a3a52'); wall.addColorStop(1,'#3a2e44');
  ctx.fillStyle=wall; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#7a5230'); fl.addColorStop(1,'#5f3f24');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1;
  for (let i=1;i<6;i++){ const y=floorY+i/6*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // framed vinyl records on the wall
  for (const rx of [W*0.14,W*0.31]){
    ctx.fillStyle='#2a2230'; roundRect(rx-16,H*0.12,32,32,3); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(rx,H*0.12+16,12,0,7); ctx.fill();
    ctx.fillStyle='#c9944a'; ctx.beginPath(); ctx.arc(rx,H*0.12+16,4,0,7); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(rx,H*0.12+16,1.4,0,7); ctx.fill();
  }
  ctx.fillStyle='rgba(255,210,140,.06)'; ctx.beginPath(); ctx.ellipse(W*0.5,floorY+10,W*0.45,26,0,0,7); ctx.fill();

  // upright piano
  const pX=W*0.62, pW=W*0.30, pTop=floorY-70;
  ctx.fillStyle='#2b2029'; roundRect(pX-pW/2,pTop,pW,58,4); ctx.fill();
  ctx.fillStyle='#1e1620'; ctx.fillRect(pX-pW/2+4,pTop+6,pW-8,16);
  const kX=pX-pW/2+6, kY=pTop+34, kW=pW-12;
  ctx.fillStyle='#f3efe4'; ctx.fillRect(kX,kY,kW,12);
  ctx.fillStyle='#111'; const keys=Math.floor(kW/7);
  for (let i=0;i<keys;i++){ if (i%7!==2 && i%7!==6) ctx.fillRect(kX+i*7+4,kY,4,7); }
  ctx.fillStyle='#3a2c36'; ctx.fillRect(pX-pW/2,pTop+58,pW,10);
  ctx.fillRect(pX-pW/2+6,pTop+68,6,Math.max(0,floorY-(pTop+68))); ctx.fillRect(pX+pW/2-12,pTop+68,6,Math.max(0,floorY-(pTop+68)));
  ctx.fillStyle='#5a3a22'; ctx.fillRect(pX-18,floorY-14,36,6); ctx.fillRect(pX-16,floorY-8,4,8); ctx.fillRect(pX+12,floorY-8,4,8);

  // cello on a stand
  const cX=W*0.17, cBase=floorY-6;
  ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cX,cBase); ctx.lineTo(cX,cBase-70); ctx.stroke();
  ctx.fillStyle='#7a3b1e'; ctx.beginPath(); ctx.ellipse(cX,cBase-30,16,26,0,0,7); ctx.fill();
  ctx.fillStyle='#5a2a12'; ctx.beginPath(); ctx.ellipse(cX,cBase-30,9,17,0,0,7); ctx.fill();
  ctx.strokeStyle='#e8d9b0'; ctx.lineWidth=1; for (let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(cX+i*2,cBase-58); ctx.lineTo(cX+i*2,cBase-8); ctx.stroke(); }
  ctx.fillStyle='#5a2a12'; ctx.beginPath(); ctx.arc(cX,cBase-64,4,0,7); ctx.fill();

  // music stand with sheet
  const mX=W*0.40, mB=floorY;
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(mX,mB); ctx.lineTo(mX,mB-50); ctx.stroke();
  ctx.save(); ctx.translate(mX,mB-58); ctx.rotate(-0.15); ctx.fillStyle='#f3efe4'; ctx.fillRect(-14,-8,28,20); ctx.strokeStyle='#bbb'; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-11,-4+i*4); ctx.lineTo(11,-4+i*4); ctx.stroke(); } ctx.restore();

  // floating notes
  ctx.fillStyle='rgba(255,230,180,.85)'; ctx.font='14px serif'; ctx.textAlign='center';
  const span=floorY*0.7;
  for (let i=0;i<8;i++){ const life=(t*18+i*30)%span, nx=(i*61+20)%W, ny=floorY-20-life; ctx.globalAlpha=Math.max(0,1-life/span); ctx.fillText(i%2?'♪':'♫', nx+Math.sin(t+i)*6, ny); }
  ctx.globalAlpha=1; ctx.textAlign='left';

  // cat curled up on the floor near the cello
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.22,y:floorY+16,anchorY:1,frame:Math.floor(t*7)%4});
  SpriteRenderer.submit({sprite:'woodFloor',x:W*0.50,y:floorY+40,frame:1});
}
registerScene('musicroom', drawMusicRoom);

/* ── AURORA TUNDRA (outdoor · night) ── */
function drawSnowPine(px,baseY,h){
  ctx.fillStyle='#16351f'; ctx.beginPath(); ctx.moveTo(px,baseY-h); ctx.lineTo(px-h*0.4,baseY); ctx.lineTo(px+h*0.4,baseY); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(px,baseY-h); ctx.lineTo(px-h*0.18,baseY-h*0.5); ctx.lineTo(px+h*0.18,baseY-h*0.5); ctx.closePath(); ctx.fill();
}
function drawAurora(){
  const t = sceneTime, groundY = H*0.66;

  // night sky + stars
  const sky=ctx.createLinearGradient(0,0,0,groundY); sky.addColorStop(0,'#050a1a'); sky.addColorStop(1,'#0e1830');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,groundY);
  for (let i=0;i<60;i++){ const sx=(i*89+7)%W, sy=(i*53+3)%(groundY*0.7), tw=0.5+0.5*Math.sin(t*2+i); ctx.fillStyle=`rgba(255,255,255,${0.3+0.5*tw})`; ctx.fillRect(sx,sy,1.2,1.2); }

  // aurora ribbons
  const cols=['rgba(80,230,160,','rgba(120,200,255,','rgba(180,120,230,'];
  for (let b=0;b<3;b++){
    const baseY=groundY*0.28 + b*24, col=cols[b];
    ctx.beginPath();
    for (let x=0;x<=W;x+=6){ const y=baseY + Math.sin(x*0.02 + t*0.8 + b)*18 + Math.sin(x*0.05 - t*0.5)*8; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    for (let x=W;x>=0;x-=6){ const y=baseY+38 + Math.sin(x*0.02 + t*0.8 + b)*18; ctx.lineTo(x,y); }
    ctx.closePath();
    const grad=ctx.createLinearGradient(0,baseY-10,0,baseY+44); grad.addColorStop(0,col+'0)'); grad.addColorStop(0.5,col+'0.35)'); grad.addColorStop(1,col+'0)');
    ctx.fillStyle=grad; ctx.fill();
  }

  // snowy ground + mounds
  const gr=ctx.createLinearGradient(0,groundY,0,H); gr.addColorStop(0,'#dfe9f5'); gr.addColorStop(1,'#c2d2e6');
  ctx.fillStyle=gr; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle='#eaf2fb'; ctx.beginPath(); ctx.moveTo(0,groundY+10); ctx.quadraticCurveTo(W*0.25,groundY-6,W*0.5,groundY+8); ctx.quadraticCurveTo(W*0.75,groundY-4,W,groundY+10); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();

  // snowy pines
  for (let i=0;i<7;i++) drawSnowPine(i*W/6-6, groundY+8, 26+((i*29)%16));

  // falling snow
  ctx.fillStyle='rgba(255,255,255,.85)';
  for (let i=0;i<30;i++){ const seed=i*41.7, sx=(((seed*1.6 + Math.sin(t+i)*10)%W)+W)%W, sy=(seed*2.2 + t*14)%H; ctx.beginPath(); ctx.arc(sx,sy,1.2,0,7); ctx.fill(); }
}
registerScene('aurora', drawAurora);

/* ── POTTERY STUDIO (indoor · ceramics) ── */
function drawVessel(x,baseY,col,type){
  ctx.fillStyle=col;
  if (type===0){ ctx.beginPath(); ctx.moveTo(x-9,baseY-2); ctx.quadraticCurveTo(x,baseY+10,x+9,baseY-2); ctx.closePath(); ctx.fill(); }
  else if (type===1){ ctx.beginPath(); ctx.moveTo(x-5,baseY-2); ctx.quadraticCurveTo(x-10,baseY-14,x-4,baseY-22); ctx.lineTo(x+4,baseY-22); ctx.quadraticCurveTo(x+10,baseY-14,x+5,baseY-2); ctx.closePath(); ctx.fill(); }
  else { ctx.fillRect(x-6,baseY-16,12,16); ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x+8,baseY-8,4,-1.2,1.2); ctx.stroke(); }
}
function drawPottery(){
  const t = sceneTime, floorY = H*0.62;

  // clay-tone wall + concrete floor
  ctx.fillStyle='#cdbfae'; ctx.fillRect(0,0,W,floorY);
  const fl=ctx.createLinearGradient(0,floorY,0,H); fl.addColorStop(0,'#9a9086'); fl.addColorStop(1,'#847a70');
  ctx.fillStyle=fl; ctx.fillRect(0,floorY,W,H-floorY);
  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1;
  for (let i=1;i<5;i++){ const y=floorY+i/5*(H-floorY); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // shelves of finished ceramics
  const shX=W*0.04, shW=W*0.40, glazes=['#5a7a6a','#9a5a3a','#3a5a7a','#7a6a4a','#8a4a5a'];
  for (let s=0;s<3;s++){ const sy=H*0.12+s*H*0.13; ctx.fillStyle='#8a6b4a'; ctx.fillRect(shX,sy+22,shW,5); for (let i=0;i<5;i++) drawVessel(shX+12+i*((shW-20)/5), sy+22, glazes[(i+s)%5], i%3); }

  // kiln (right) with a warm glow
  const kX=W*0.82, kTop=floorY-56;
  ctx.fillStyle='#7a4a3a'; roundRect(kX-24,kTop,48,56,4); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.15)'; for (let by=kTop;by<floorY;by+=8){ ctx.beginPath(); ctx.moveTo(kX-24,by); ctx.lineTo(kX+24,by); ctx.stroke(); }
  ctx.fillStyle='#2a1810'; roundRect(kX-14,kTop+16,28,26,3); ctx.fill();
  const kg=ctx.createRadialGradient(kX,kTop+30,2,kX,kTop+30,20); kg.addColorStop(0,`rgba(255,140,40,${0.5+0.2*Math.sin(t*4)})`); kg.addColorStop(1,'rgba(255,140,40,0)');
  ctx.fillStyle=kg; ctx.fillRect(kX-16,kTop+16,32,28);

  // apron on a wall hook
  ctx.fillStyle='#6a7a5a'; ctx.beginPath(); ctx.moveTo(W*0.62,H*0.14); ctx.lineTo(W*0.66,H*0.14); ctx.lineTo(W*0.68,H*0.30); ctx.lineTo(W*0.60,H*0.30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#4a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W*0.62,H*0.14); ctx.lineTo(W*0.585,H*0.16); ctx.moveTo(W*0.66,H*0.14); ctx.lineTo(W*0.70,H*0.16); ctx.stroke();

  // potter's wheel with a pot forming
  const wX=W*0.42, wY=floorY+26;
  ctx.fillStyle='#4a4038'; ctx.fillRect(wX-8,wY+8,16,H-(wY+8));
  ctx.fillStyle='#5a5048'; ctx.beginPath(); ctx.ellipse(wX,wY,34,12,0,0,7); ctx.fill();
  ctx.fillStyle='#6a605a'; ctx.beginPath(); ctx.ellipse(wX,wY-2,30,10,0,0,7); ctx.fill();
  const spin=Math.sin(t*10)*1.5;
  ctx.fillStyle='#a86a44'; ctx.beginPath(); ctx.moveTo(wX-12,wY-4); ctx.quadraticCurveTo(wX-16+spin,wY-24,wX-8,wY-34); ctx.lineTo(wX+8,wY-34); ctx.quadraticCurveTo(wX+16+spin,wY-24,wX+12,wY-4); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#c98a5a'; ctx.beginPath(); ctx.ellipse(wX,wY-34,8,3,0,0,7); ctx.fill();
  // stool
  ctx.fillStyle='#5a3a22'; ctx.fillRect(wX-54,wY+2,20,4); ctx.fillRect(wX-52,wY+6,3,16); ctx.fillRect(wX-38,wY+6,3,16);

  // cat warming itself near the kiln
  SpriteRenderer.submit({sprite:'cat',phase:'actors',x:W*0.72,y:floorY+14,anchorY:1,frame:Math.floor(t*7)%4});
}
registerScene('pottery', drawPottery);

/* ── LAVENDER FIELD (outdoor · summer) ── */
function drawLavender(){
  const t = sceneTime, horizon = H*0.42;

  // sky (sun is the global clock-driven one — see drawCelestial in birthday.js)
  const sky=ctx.createLinearGradient(0,0,0,horizon); sky.addColorStop(0,'#8fc0e8'); sky.addColorStop(1,'#f2e4c0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,horizon);

  // distant hills + lone tree
  ctx.fillStyle='#b8c9a0'; ctx.beginPath(); ctx.moveTo(0,horizon); ctx.quadraticCurveTo(W*0.4,horizon-24,W*0.7,horizon-6); ctx.quadraticCurveTo(W*0.9,horizon-18,W,horizon-4); ctx.lineTo(W,horizon); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#5a3a22'; ctx.fillRect(W*0.8-2,horizon-24,4,20);
  ctx.fillStyle='#4a7a3a'; ctx.beginPath(); ctx.arc(W*0.8,horizon-26,10,0,7); ctx.fill();

  // field
  const field=ctx.createLinearGradient(0,horizon,0,H); field.addColorStop(0,'#9a8fb5'); field.addColorStop(1,'#6a5a8a');
  ctx.fillStyle=field; ctx.fillRect(0,horizon,W,H-horizon);

  // rows of lavender receding in perspective
  for (let r=0;r<12;r++){
    const p=r/11, y=horizon + Math.pow(p,1.6)*(H-horizon), size=3+p*11, spacing=6+p*8;
    for (let x=0;x<=W;x+=spacing){
      ctx.strokeStyle=`rgb(${110+p*20},${100+p*10},${150+p*20})`; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-size); ctx.stroke();
      ctx.fillStyle=`rgb(${140-p*20},90,${180-p*10})`; ctx.fillRect(x-1.5,y-size-3,3,4);
    }
  }

  // sprite butterflies over the lavender
  for (let i=0;i<3;i++){
    const bx=(((W*0.2 + i*W*0.25 + Math.sin(t*0.8+i)*40 + t*10*(i%2?1:-1))%W)+W)%W;
    const by=horizon+24 + Math.sin(t*1.5+i)*18 + i*12;
    SpriteRenderer.submit({sprite:'butterfly',phase:'actors',x:bx,y:by,anchorY:0.5,frame:Math.floor(t*8+i*2)%4,flipX:!!(i%2)});
  }

  // clouds above the hills
  drawSpriteCloud(W*0.2+Math.sin(t*0.1)*8,H*0.08,0.6);
  drawSpriteCloud(W*0.7+Math.sin(t*0.08+2)*6,H*0.14,0.5);
  // wildflowers at the edge of the field
  SpriteRenderer.submit({sprite:'wildflowers',x:W*0.08,y:horizon+28,frame:Math.floor(sceneTime*3)%4});
  SpriteRenderer.submit({sprite:'wildflowers',x:W*0.92,y:horizon+34,frame:Math.floor(sceneTime*3+2)%4});
  SpriteRenderer.submit({sprite:'meadowGrass',x:W*0.50,y:horizon+50,frame:0});
}
registerScene('lavender', drawLavender);

/* ── ARCADE (indoor · games) ── */
function drawArcade(){
  const t = sceneTime, floorY = H*0.66;

  // dark neon room
  ctx.fillStyle='#160f22'; ctx.fillRect(0,0,W,floorY);
  ctx.fillStyle='rgba(255,60,180,.05)'; ctx.fillRect(0,0,W,floorY);
  ctx.font='bold 20px Segoe UI, sans-serif'; ctx.textAlign='center';
  ctx.fillStyle=`rgba(255,80,200,${0.7+0.3*Math.sin(t*3)})`; ctx.fillText('★ ARCADE ★', W*0.5, H*0.11);
  ctx.textAlign='left';

  // carpet with neon flecks
  ctx.fillStyle='#1a1030'; ctx.fillRect(0,floorY,W,H-floorY);
  for (let i=0;i<40;i++){ const cx=(i*53+11)%W, cy=floorY+((i*37+7)%(H-floorY)); ctx.fillStyle=['#ff3ca0','#3cf0ff','#f0ff3c'][i%3]; ctx.globalAlpha=0.4; ctx.fillRect(cx,cy,2,2); }
  ctx.globalAlpha=1;

  // arcade cabinets
  function cabinet(x,col,scr){
    const cw=42, top=floorY-96;
    ctx.fillStyle=scr; ctx.globalAlpha=0.10; ctx.fillRect(x-cw/2-4,top+16,cw+8,30); ctx.globalAlpha=1;
    ctx.fillStyle=col; roundRect(x-cw/2,top,cw,96,4); ctx.fill();
    ctx.fillStyle='#fff'; ctx.globalAlpha=0.8; ctx.fillRect(x-cw/2+4,top+4,cw-8,10); ctx.globalAlpha=1;
    ctx.fillStyle='#0a0a16'; ctx.fillRect(x-cw/2+5,top+18,cw-10,26);
    ctx.fillStyle=scr; for (let k=0;k<6;k++){ if ((Math.floor(t*4)+k)%3===0) ctx.fillRect(x-cw/2+8+k*5, top+22+((k*7)%18), 3,3); }
    ctx.fillStyle='#222'; ctx.fillRect(x-cw/2+4,top+48,cw-8,14);
    ctx.fillStyle='#ff3c3c'; ctx.beginPath(); ctx.arc(x-6,top+55,2.5,0,7); ctx.fill();
    ctx.fillStyle='#3cff6a'; ctx.beginPath(); ctx.arc(x+4,top+55,2.5,0,7); ctx.fill();
  }
  cabinet(W*0.18,'#7a2ea0','#3cf0ff');
  cabinet(W*0.40,'#c02e6a','#f0ff3c');
  cabinet(W*0.86,'#2e6ac0','#ff6adc');

  // pinball machine
  const pX=W*0.66, pTop=floorY-42;
  ctx.fillStyle='#333'; ctx.fillRect(pX-24,pTop+36,4,floorY-(pTop+36)); ctx.fillRect(pX+20,pTop+36,4,floorY-(pTop+36));
  ctx.fillStyle='#d0402e'; ctx.beginPath(); ctx.moveTo(pX-30,pTop+40); ctx.lineTo(pX+30,pTop+40); ctx.lineTo(pX+22,pTop); ctx.lineTo(pX-22,pTop); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#1a1a2a'; ctx.beginPath(); ctx.moveTo(pX-24,pTop+36); ctx.lineTo(pX+24,pTop+36); ctx.lineTo(pX+18,pTop+4); ctx.lineTo(pX-18,pTop+4); ctx.closePath(); ctx.fill();
  ctx.fillStyle=`rgba(255,220,80,${0.6+0.4*Math.sin(t*6)})`; for (let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(pX-14+i*7,pTop+12+((i%2)*10),2.5,0,7); ctx.fill(); }
  ctx.fillStyle='#e04a2e'; ctx.fillRect(pX-26,pTop-24,52,24);
  ctx.fillStyle=`rgba(80,220,255,${0.6+0.4*Math.sin(t*4+1)})`; ctx.fillRect(pX-20,pTop-18,40,12);

  // kid playing at a cabinet
  SpriteRenderer.submit({sprite:'npcChild',phase:'actors',x:W*0.40,y:H*0.92,anchorY:1,frame:Math.floor(t*8)%4});
}
registerScene('arcade', drawArcade);

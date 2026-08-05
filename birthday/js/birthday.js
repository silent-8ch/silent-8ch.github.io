/* birthday scene + day/night, vignette, shooting star, render()  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ============================================================================
   BIRTHDAY SONG SCENE
   ----------------------------------------------------------------------------
   Secret trigger: click the "o" in her name (top bar). The whole gang gathers
   to sing Happy Birthday around a cake; blow into the microphone to blow the
   candles out. Mic needs https or localhost — if it's blocked, tap the candles.
   ============================================================================ */
const BIRTHDAY = {
  // Candle count grows with age: 43 on Aug 3, 2026, +1 every Aug 3 thereafter.
  baseYear: 2026, baseMonth: 8, baseDay: 3, baseCount: 43,
  blowThreshold: 0.07,     // mic loudness (0..1) that counts as "blowing" (lower = easier)
  candleCost: 0.05,        // blow-energy needed to put out one candle (lower = easier)
};

// How many candles today: baseCount, plus one for every Aug 3 that has passed
// since the base date (she turns a year older on each birthday).
function candleCountForToday(){
  const now = new Date();
  let years = now.getFullYear() - BIRTHDAY.baseYear;
  const m = now.getMonth() + 1, d = now.getDate();           // getMonth() is 0-based
  const beforeBirthday = (m < BIRTHDAY.baseMonth) || (m === BIRTHDAY.baseMonth && d < BIRTHDAY.baseDay);
  if (beforeBirthday) years -= 1;                            // this year's birthday hasn't happened yet
  return Math.max(1, BIRTHDAY.baseCount + years);
}
let birthday = null;                                   // active scene, or null
let audioCtx = null, micAnalyser = null, micData = null, micStream = null;

/* ---- post-candle applause sprites (loaded lazily when the easter egg opens) ---- */
const BIRTHDAY_CLAPPERS = [
  { name:'paul',    src:'sprites/clapping/paul-clap-processed.png' },
  { name:'luna',    src:'sprites/clapping/luna-clap-processed.png' },
  { name:'luke',    src:'sprites/clapping/luke-clap-processed.png' },
  { name:'william', src:'sprites/clapping/william-clap-processed.png' },
  { name:'wade',    src:'sprites/clapping/wade-clap-processed.png' },
  { name:'krystal', src:'sprites/clapping/krystal-clap-processed.png' },
];
const birthdayClapSheets = {};
function loadBirthdayClappers(){
  for (const spec of BIRTHDAY_CLAPPERS){
    if (birthdayClapSheets[spec.name]) continue;
    const img = new Image();
    const rec = { img, ready:false };
    birthdayClapSheets[spec.name] = rec;
    img.onload = ()=>{ rec.ready = true; };
    img.src = spec.src;
  }
}
function birthdayClappersReady(){
  return BIRTHDAY_CLAPPERS.every(spec=>birthdayClapSheets[spec.name]?.ready);
}

function ensureAudio(){
  if (!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function startBirthday(){
  if (birthday) return;
  ensureAudio();                                       // must happen on the click gesture
  loadBirthdayClappers();                              // ready by the time the candles go out
  const n = candleCountForToday();   // 43 on Aug 3, 2026; +1 each Aug 3 after
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));   // roughly square grid, fixed cake
  const candles = [];
  for (let k=0;k<n;k++){
    candles.push({ col:k%cols, row:Math.floor(k/cols), lit:true, flick:rand(0,6.28), smoke:0, sx:0, sy:0 });
  }
  birthday = { t:0, candles, cols, energy:0, blow:0, done:false, doneT:0, confetti:[] };
  hugRunners = [];
  hugGroup = [...HUG_POOL];                             // everyone gathers around Krystal
  playHappyBirthday();
  initMic();
}

function endBirthday(){
  birthday = null;
  if (micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream = null; }
  micAnalyser = null; micData = null;
}

/* ---- Happy Birthday melody (public domain) via oscillator ---- */
function playHappyBirthday(){
  if (!audioCtx) return;
  const F = { G4:392, A4:440, B4:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99 };
  const song = [
    ['G4',1],['G4',1],['A4',2],['G4',2],['C5',2],['B4',3],
    ['G4',1],['G4',1],['A4',2],['G4',2],['D5',2],['C5',3],
    ['G4',1],['G4',1],['G5',2],['E5',2],['C5',2],['B4',2],['A4',3],
    ['F5',1],['F5',1],['E5',2],['C5',2],['D5',2],['C5',4],
  ];
  const beat = 0.34; let t = audioCtx.currentTime + 0.15;
  for (const [note,d] of song){
    const len = d*beat, osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.value = F[note];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t+0.03);
    g.gain.setValueAtTime(0.16, t+len*0.75);
    g.gain.linearRampToValueAtTime(0, t+len);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t); osc.stop(t+len+0.02);
    t += len;
  }
}

/* ---- microphone loudness ---- */
async function initMic(){
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    if (!birthday){ stream.getTracks().forEach(t=>t.stop()); return; } // scene closed already
    micStream = stream;
    ensureAudio();
    const src = audioCtx.createMediaStreamSource(stream);
    micAnalyser = audioCtx.createAnalyser();
    micAnalyser.fftSize = 512;
    micData = new Uint8Array(micAnalyser.fftSize);
    src.connect(micAnalyser);                          // NOT to destination (avoids feedback)
  }catch(e){ /* denied/unavailable — tap-to-blow still works */ }
}
function micLevel(){
  if (!micAnalyser) return 0;
  micAnalyser.getByteTimeDomainData(micData);
  let sum = 0;
  for (let i=0;i<micData.length;i++){ const v = (micData[i]-128)/128; sum += v*v; }
  return Math.sqrt(sum/micData.length);
}

/* ---- extinguish a candle (mic energy or a tap) ---- */
function blowOutOne(px, py){
  const b = birthday; if (!b) return;
  const lit = b.candles.filter(c=>c.lit); if (!lit.length) return;
  let target = lit[0];
  if (px != null){                                     // nearest lit candle to a tap
    let best = 1e9;
    for (const c of lit){ const d = (c.sx-px)**2 + (c.sy-py)**2; if (d < best){ best = d; target = c; } }
  }
  target.lit = false; target.smoke = 1;
  if (b.candles.every(c=>!c.lit) && !b.done){ b.done = true; b.doneT = 0; spawnConfetti(); }
}

function updateBirthday(dt){
  const b = birthday; b.t += dt; pet.bob += dt;        // reuse bob for the group's gentle sway
  b.blow = micLevel();
  if (!b.done){
    if (b.blow > BIRTHDAY.blowThreshold) b.energy += (b.blow - BIRTHDAY.blowThreshold) * dt * 8;
    const targetOut = Math.floor(b.energy / BIRTHDAY.candleCost);
    while (b.candles.filter(c=>!c.lit).length < targetOut && b.candles.some(c=>c.lit)) blowOutOne();
  } else {
    b.doneT += dt;
  }
  for (const c of b.candles) if (c.smoke>0) c.smoke = Math.max(0, c.smoke - dt*0.5);
  updateConfetti(dt);
}

/* ---- confetti ---- */
function spawnConfetti(){
  const cols = ['#e07a8b','#f2c14e','#7fd0ff','#9ad57f','#c79be0','#ffffff'];
  for (let i=0;i<90;i++) birthday.confetti.push({
    x:rand(0,W), y:rand(-H,0), vx:rand(-16,16), vy:rand(35,95),
    s:rand(3,6), c:pick(cols), rot:rand(0,6.28), vr:rand(-5,5) });
}
function updateConfetti(dt){
  if (!birthday) return;
  for (const p of birthday.confetti){
    p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vr*dt;
    if (p.y > H+12){ p.y = rand(-40,-10); p.x = rand(0,W); }
  }
}

/* ---- render the whole scene ---- */
function drawBirthdayScene(){
  const b = birthday;
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#3a2b4a'); g.addColorStop(0.6,'#4a3550'); g.addColorStop(1,'#2c2030');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  drawBunting();

  // Sing gathered together; when the final candle goes out, everyone applauds.
  pet.x = W/2; pet.y = H*0.56;
  if (b.done && birthdayClappersReady()) drawBirthdayClappers(b);
  else if (sheets.hugs1 && sheets.hugs1.ready) drawHugGroup();
  else { ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='13px Segoe UI'; ctx.fillText('loading…', W/2, H*0.5); }

  drawCake(b);
  drawBirthdayText(b);
  drawConfetti();
}

/* All six sheets use four exact 543x724 cells. Applause follows a shared tempo
   pulse, while small rate differences keep the group from clapping in lockstep. */
function birthdayClapFrame(t, rate, delay){
  const localT = Math.max(0, t - delay);
  const pulseSpeed = 2.05;                              // one swell about every 3 seconds
  const pulseDepth = 0.34;                              // gently faster, then slower
  // Integral of rate * (1 + pulseDepth*sin(pulseSpeed*t)); always moves forward.
  const cycles = rate * (localT + pulseDepth * (1-Math.cos(pulseSpeed*localT)) / pulseSpeed);
  return Math.floor(cycles * 4) % 4;                    // apart -> near -> clap -> near
}
function drawBirthdayClappers(b){
  const sw = 543, sh = 724;
  const feetY = H * 0.565;
  const sideH = 108;
  const sideW = sideH * sw / sh;
  const positions = [
    { name:'paul',    x:34,  rate:1.34, delay:0.00 },
    { name:'luna',    x:92,  rate:1.48, delay:0.12 },
    { name:'luke',    x:148, rate:1.26, delay:0.20 },
    { name:'william', x:238, rate:1.55, delay:0.07 },
    { name:'wade',    x:300, rate:1.39, delay:0.16 },
  ];

  // The five family members form the back row around Krystal.
  for (const p of positions){
    const rec = birthdayClapSheets[p.name];
    const frame = birthdayClapFrame(b.doneT, p.rate, p.delay);
    ctx.drawImage(rec.img, frame*sw, 0, sw, sh,
      p.x-sideW/2, feetY-sideH, sideW, sideH);
  }

  // Krystal stays at the visual center and is a touch taller in front.
  const krystal = birthdayClapSheets.krystal;
  const mainH = 120, mainW = mainH * sw / sh;
  const krystalFrame = birthdayClapFrame(b.doneT, 1.43, 0.04);
  ctx.drawImage(krystal.img, krystalFrame*sw, 0, sw, sh,
    W/2-mainW/2, feetY-mainH+5, mainW, mainH);
}

function drawBunting(){
  const cols = ['#e07a8b','#f2c14e','#7fd0ff','#9ad57f','#c79be0'];
  const n = 9, y = H*0.05;
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0,y);
  for (let i=0;i<=n;i++){ const x=(i/n)*W; ctx.quadraticCurveTo(x-W/n/2, y+8, x, y); } ctx.stroke();
  for (let i=0;i<n;i++){
    const x=(i/n)*W + W/n/2;
    ctx.fillStyle = cols[i%cols.length];
    ctx.beginPath(); ctx.moveTo(x-7,y+2); ctx.lineTo(x+7,y+2); ctx.lineTo(x,y+16); ctx.closePath(); ctx.fill();
  }
}

function drawCake(b){
  const cx = W/2, cyTop = H*0.60;                         // centre of the cake's top surface
  const RX = W*0.30, RY = H*0.14, bh = H*0.13, margin = 12; // FIXED cake size (never grows)
  const COLS = b.cols, ROWS = Math.ceil(b.candles.length / COLS);
  const S = Math.max(1, ((COLS-1) + (ROWS-1)) / 2);        // grid half-span, in tiles
  const tw = (RX - margin) / S, th = (RY - margin) / S;    // tiles shrink as the grid grows
  const scale = Math.min(1, Math.max(0.12, tw / 13));      // candle size scales with spacing

  // plate
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(cx, cyTop+bh+RY*0.5+8, RX*1.15, RY*0.7, 0,0,7); ctx.fill();
  ctx.fillStyle = '#e9e2d6'; ctx.beginPath(); ctx.ellipse(cx, cyTop+bh+RY*0.5+5, RX*1.1, RY*0.62, 0,0,7); ctx.fill();
  // cake body (cylinder: side wall + rounded bottom)
  ctx.fillStyle = '#a4623d';
  ctx.fillRect(cx-RX, cyTop, RX*2, bh);
  ctx.beginPath(); ctx.ellipse(cx, cyTop+bh, RX, RY, 0, 0, Math.PI*2); ctx.fill();
  // frosting rim + top surface
  ctx.fillStyle = '#e6b8c8';
  const rimN = Math.round(RX/9);
  for (let i=0;i<rimN;i++){ const dx=cx-RX + (i+0.5)/rimN*RX*2; ctx.beginPath(); ctx.arc(dx, cyTop+6, 6,0,Math.PI); ctx.fill(); }
  ctx.fillStyle = '#f7d9e3'; ctx.beginPath(); ctx.ellipse(cx, cyTop, RX, RY, 0,0,7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.stroke();

  // place candles on the top surface, then draw back-to-front for depth
  for (const c of b.candles){
    const gi = c.col - (COLS-1)/2, gj = c.row - (ROWS-1)/2;
    c.sx = cx + (gi - gj) * tw;
    c.sy = cyTop + (gi + gj) * th;
  }
  const ordered = b.candles.slice().sort((p,q)=> p.sy - q.sy);
  for (const c of ordered) drawCandle(c, b, scale);
}

function drawCandle(c, b, s){
  const stickH = Math.max(2, 13*s), bx = c.sx, baseY = c.sy, topY = baseY - stickH;
  const sw = Math.max(1, 2.8*s);
  ctx.fillStyle = (c.col % 2) ? '#e37b8e' : '#7ec8e3';    // alternating stripes
  ctx.fillRect(bx-sw/2, topY, sw, stickH);
  if (c.lit){
    const shrink = 1 - Math.min(0.8, b.blow*2.2);         // flame shrinks as you blow
    const lean = (b.blow*34 + Math.sin(b.t*10 + c.flick)*1.2) * s;
    const fx = bx + lean, fy = topY - s;
    const fl = Math.max(0.6, s);                           // keep tiny flames visible as dots
    ctx.fillStyle = 'rgba(255,200,80,.28)';
    ctx.beginPath(); ctx.arc(fx, fy-3*shrink*fl, 6*shrink*fl, 0,7); ctx.fill();
    ctx.fillStyle = '#ffcf33';
    ctx.beginPath(); ctx.ellipse(fx, fy-4*shrink*fl, 2.6*shrink*fl, 5.5*shrink*fl, 0,0,7); ctx.fill();
    ctx.fillStyle = '#ff8a2a';
    ctx.beginPath(); ctx.ellipse(fx, fy-3*shrink*fl, 1.5*shrink*fl, 3.3*shrink*fl, 0,0,7); ctx.fill();
  } else if (c.smoke>0){
    ctx.fillStyle = `rgba(210,210,210,${c.smoke*0.5})`;
    ctx.beginPath(); ctx.arc(bx, topY-4-(1-c.smoke)*10, (1.6+(1-c.smoke)*2.5)*Math.max(0.5,s), 0,7); ctx.fill();
  }
}

function drawBirthdayText(b){
  ctx.textAlign = 'center';
  if (!b.done){
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Segoe UI, sans-serif';
    ctx.fillText('🎵 Happy Birthday ' + CONFIG.name + ' 🎵', W/2, H*0.15);
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillStyle = micAnalyser ? 'rgba(255,255,255,.85)' : 'rgba(255,220,120,.95)';
    ctx.fillText(micAnalyser ? 'Blow into the mic to blow out the candles' : 'Tap the candles to blow them out',
                 W/2, H*0.205);
    if (micAnalyser){                                          // blow strength meter
      const bw = W*0.42, bx = W/2-bw/2, by = H*0.225;
      ctx.fillStyle = 'rgba(255,255,255,.18)'; roundRect(bx,by,bw,6,3); ctx.fill();
      ctx.fillStyle = b.blow > BIRTHDAY.blowThreshold ? '#7fd0ff' : 'rgba(127,208,255,.5)';
      roundRect(bx,by,bw*Math.min(1,b.blow/0.4),6,3); ctx.fill();
    }
  } else {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Segoe UI, sans-serif';
    ctx.fillText('🎉 Make a wish! 🎉', W/2, H*0.15);
    ctx.font = '13px Segoe UI, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillText(b.doneT < 0.8 ? 'Everyone is cheering!' : 'Tap to return', W/2, H*0.21);
  }
}

function drawConfetti(){
  if (!birthday || !birthday.confetti.length) return;
  for (const p of birthday.confetti){
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*0.6); ctx.restore();
  }
}

/* ---- day / night lighting driven by the real clock ---- */
// scenes that stage their own dramatic / night lighting — skip the global wash
const SCENE_NO_DAYNIGHT = new Set(['aurora','meteorshower','fireworks','volcano','glowwormcave','biobay','observatory','planetarium','cinema','darkroom']);
// indoor scenes are lit by their own lamps — their brightness must NOT shift with the
// real clock, so they skip the day/night wash and the after-dark vignette entirely.
// (tagged "(indoor · …)" in each scene's header comment.)
const SCENE_INDOOR = new Set([
  'artstudio','bakery','library','aquarium','greenhouse','planetarium','musicroom','pottery','arcade',
  'teahouse','sciencelab','balletstudio','florist','recordshop','sewingstudio','toyshop','spa',
  'observatory','cafe','darkroom','winecellar','clockmaker','chocolateshop','diner','apothecary',
  'catcafe','antiqueshop','magicshop','butterflydome','perfumery','stainedglass','candleshop','forge',
  'cinema','puppettheater','icecreamparlor','bowling','trainroom','barbershop','glassblowing',
  'terrariumshop','bookbindery','letterpress','luthier','cheeseshop','comicshop','cobbler','weaving',
  'fencing','ballroom','chesshall','boxinggym','naturalhistory','cartographer','escaperoom',
  'recordingstudio','aviary','candyshop','millinery','optician','petshop','nursery','ramenshop',
  'orchidroom','jazzclub','hammam','skilodge','sushibar','potionkitchen','snowglobeshop','mochishop',
  'aquariumtunnel','giftwrapshop','gingerbreadkitchen','jellyfishtank','cavehotspring','candyfactory',
  'papercraftstudio','dumplinghouse','igloo','planetlab','wizardtower','fortuneteller','arcanelibrary',
  'alchemylab','witchcottage','enchantedmirrorhall','gelateria','trainstation','bonsaigarden',
  'harvestbarn','sugarshack','sunroom','cheesecave','quiltshop','winterchalet','herbshed',
  'bambootearoom','reindeerbarn','cidermill',
]);
let dayNightForce = null;   // debug/override: null = use real clock, else 0..24
// returns [r,g,b,a] overlay for the current time of day
function dayNightWash(){
  const d = new Date();
  const h = dayNightForce!=null ? dayNightForce : d.getHours() + d.getMinutes()/60;
  const mix=(c1,c2,t)=>c1.map((v,i)=>v+(c2[i]-v)*t);
  const night=[18,26,64,0.42], dawn=[255,168,120,0.20], day=[255,240,210,0.0], dusk=[255,132,70,0.22];
  if (h<5)  return night;
  if (h<7)  return mix(night,dawn,(h-5)/2);    // pre-dawn → dawn
  if (h<9)  return mix(dawn,day,(h-7)/2);      // dawn → morning
  if (h<16) return day;                        // daylight
  if (h<18) return mix(day,dusk,(h-16)/2);     // afternoon → golden hour
  if (h<20) return mix(dusk,night,(h-18)/2);   // dusk → night
  return night;                                // night
}
function currentHour(){ return dayNightForce!=null ? dayNightForce : (new Date().getHours() + new Date().getMinutes()/60); }
function isNight(){ const h = currentHour(); return h < 6 || h >= 20; }
function applyDayNight(scene){
  if (SCENE_NO_DAYNIGHT.has(scene) || SCENE_INDOOR.has(scene)) return;
  const c = dayNightWash();
  if (c[3] > 0.001){ ctx.fillStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${c[3]})`; ctx.fillRect(0,0,W,H); }
}
// how "night" it feels right now, 0..1 (with a soft dusk/dawn ramp)
function nightFactor(){
  const h = currentHour();
  if (h < 5 || h >= 21) return 1;
  if (h < 6)  return 1 - (h - 5);     // 5→6 dawn fade-out
  if (h >= 20) return (h - 20);       // 20→21 dusk fade-in
  return 0;
}
// a cozy radial darkening at the edges after dark — softens the frame like lamplight
function applyNightVignette(scene){
  // interiors keep a constant look — no after-dark vignette (unless they're a
  // deliberately-dim room like the cinema, which keeps its dramatic 0.6 below).
  if (SCENE_INDOOR.has(scene) && !SCENE_NO_DAYNIGHT.has(scene)) return;
  const f = SCENE_NO_DAYNIGHT.has(scene) ? 0.6 : nightFactor();
  if (f <= 0.001) return;
  const a = 0.34 * f;
  const g = ctx.createRadialGradient(W*0.5, H*0.44, H*0.22, W*0.5, H*0.5, H*0.72);
  g.addColorStop(0, 'rgba(8,10,26,0)');
  g.addColorStop(1, `rgba(8,10,26,${a.toFixed(3)})`);
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
}

/* ---- one clock-driven sky: the sun arcs east→overhead→west through the day,
   the moon takes over at night. Only drawn over scenes that show an open,
   general daytime sky (SCENE_SKY). Dark / self-lit / interior / nocturnal /
   fixed-golden-hour scenes are deliberately left out so their own art stands. */
// only true daytime-blue-sky scenes — anything painted at a fixed dawn / dusk /
// golden-hour (vineyard, savanna, marina, wheatfield, desert, sunflowers…) is left
// out on purpose so a midday sun never fights its own sky.
const SCENE_SKY = new Set([
  'beach','backyard','river','cherryblossom','autumnforest','lavender',
  'zengarden','tidepools','balloons','waterfall','pumpkinpatch','tulipfield','mountain',
  'waterlily','pasture','orchard','windmill','topiary','koipond','cliffs','coveredbridge',
  'canyon','alpinemeadow','frozenfalls','geyser','teaplantation','cranberrybog','icebergbay',
  'hedgemaze','cornmaze','farmersmarket','kitehill','flowermarket','sunflowermaze','poppyfield',
  'treehouse','hummingbirdgarden','lotuspond','birchgrove','balloonride',
  'peonygarden','duckpond','beekeepergarden','citrusgrove','watermill','cranberryharvest',
  'mapleforest','skygondola','driftwoodbeach',
]);
// where the sun / moon sits right now: a low→high→low arc that also travels
// side to side, so it genuinely rises on one edge and sets on the other.
function celestialArc(u){
  u = Math.max(0, Math.min(1, u));
  const horizon = H*0.44, peak = H*0.075;
  const alt = Math.sin(u*Math.PI);              // 0 at the horizon, 1 at its highest
  return { x: W*(0.13 + 0.74*u), y: horizon - alt*(horizon-peak), alt };
}
function celestialEdgeFade(u){ return Math.max(0, Math.min(1, Math.min(u, 1-u)*7)); }
function drawSun(x, y, alt, a){
  const cr = 255, cg = Math.round(150 + 90*alt), cb = Math.round(70 + 110*alt); // orange low → bright high
  const r = 22 + (1-alt)*7;                      // looks a touch larger near the horizon
  ctx.save();
  const g = ctx.createRadialGradient(x,y,0, x,y,r*3.3);
  g.addColorStop(0,    `rgba(${cr},${cg},${cb},${(0.5*a).toFixed(3)})`);
  g.addColorStop(0.42, `rgba(${cr},${cg},${cb},${(0.16*a).toFixed(3)})`);
  g.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r*3.3,0,7); ctx.fill();
  ctx.globalAlpha = a; ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
  ctx.restore();
}
function drawMoon(x, y, a){
  const r = 17;
  ctx.save();
  const g = ctx.createRadialGradient(x,y,0, x,y,r*3);
  g.addColorStop(0, `rgba(220,230,255,${(0.34*a).toFixed(3)})`);
  g.addColorStop(1, 'rgba(220,230,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r*3,0,7); ctx.fill();
  ctx.globalAlpha = a; ctx.fillStyle = '#eef2ff';
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
  ctx.fillStyle = 'rgba(198,208,238,0.7)';           // soft craters
  ctx.beginPath(); ctx.arc(x-5,y-4,3,0,7);   ctx.fill();
  ctx.beginPath(); ctx.arc(x+4,y+3,2.2,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(x-2,y+6,1.6,0,7); ctx.fill();
  ctx.restore();
}
function drawCelestial(scene){
  if (!SCENE_SKY.has(scene)) return;
  const h = currentHour();
  // SUN — up roughly 5:00 → 19:30, fading in/out at the horizon
  if (h >= 5 && h <= 19.5){
    const u = (h - 5) / 14.5, p = celestialArc(u), a = celestialEdgeFade(u);
    if (a > 0.01) drawSun(p.x, p.y, p.alt, a);
  }
  // MOON — up roughly 19:00 → 6:30 (wraps past midnight), crossing the same arc
  const mh = (h + 24 - 19) % 24;      // hours since 19:00
  if (mh <= 11.5){
    const u = mh / 11.5, p = celestialArc(u), a = celestialEdgeFade(u);
    if (a > 0.01) drawMoon(p.x, p.y, a);
  }
}

/* ---- ambient shooting star: a faint streak now and then at night ---- */
let shoot = null, shootTimer = 9 + Math.random()*14;
function updateShootingStar(dt){
  if (!isNight()){ shoot = null; return; }
  if (shoot){ shoot.t += dt; if (shoot.t >= shoot.dur) shoot = null; return; }
  shootTimer -= dt;
  if (shootTimer <= 0){
    shootTimer = 13 + Math.random()*17;
    const ang = 0.35 + Math.random()*0.28;   // heading down-and-right
    shoot = {
      x: W*(0.12 + Math.random()*0.5), y: H*(0.04 + Math.random()*0.13),
      dx: Math.cos(ang), dy: Math.sin(ang),
      dur: 0.75 + Math.random()*0.35, t: 0,
      len: 32 + Math.random()*22, speed: 190 + Math.random()*90
    };
  }
}
function drawShootingStar(){
  if (!shoot) return;
  const p = shoot.t / shoot.dur;
  const fade = Math.sin(Math.max(0,Math.min(1,p))*Math.PI);   // ease in then out
  const dist = shoot.speed * shoot.t;
  const hx = shoot.x + shoot.dx*dist, hy = shoot.y + shoot.dy*dist;
  const tx = hx - shoot.dx*shoot.len, ty = hy - shoot.dy*shoot.len;
  const g = ctx.createLinearGradient(tx,ty,hx,hy);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(1,`rgba(255,255,255,${(0.8*fade).toFixed(3)})`);
  ctx.save();
  ctx.strokeStyle=g; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(hx,hy); ctx.stroke();
  ctx.fillStyle=`rgba(255,255,240,${(0.9*fade).toFixed(3)})`;
  ctx.beginPath(); ctx.arc(hx,hy,1.8,0,7); ctx.fill();
  ctx.restore();
}

let placeTimer = null, lastLabeledScene = -1;
function showPlace(name){
  const el = document.getElementById('placeLabel'); if (!el) return;
  el.textContent = '📍 ' + name; el.className = ''; void el.offsetWidth; el.classList.add('show');
  clearTimeout(placeTimer); placeTimer = setTimeout(()=> el.classList.add('hide'), 2500);
}
function render(){
  ctx.clearRect(0,0,W,H);
  if (birthday){ drawBirthdayScene(); return; }
  if (cutscene){ drawCutscene(); return; }
  const scene = SCENES[currentScene];
  if (DEBUG_MODE) try { sessionStorage.setItem('bpet_debug_scene', scene); } catch(e){}
  if (started) markVisited(scene);
  if (started && currentScene !== lastLabeledScene){ lastLabeledScene = currentScene; showPlace(sceneLabel(scene)); }
  const draw = SCENE_RENDERERS[scene];
  if (draw){
    SpriteRenderer.beginFrame();
    draw();
    SpriteRenderer.drawPhase('background');
    SpriteRenderer.drawPhase('ground');
    if (!SCENE_SELF_PET.has(scene)){
      SpriteRenderer.submit({ phase:'actors', scene, x:pet.x, y:pet.y, draw:drawPet });
    }
    SpriteRenderer.drawPhase('actors');
    SpriteRenderer.drawPhase('foreground');
    applyDayNight(scene);                        // global time-of-day tint over scene + pet
    drawCelestial(scene);                        // the one sun/moon, arcing with the real clock
    applyNightVignette(scene);                   // cozy edge-darkening after dark
    drawShootingStar();                          // rare bright streak across the night sky
    for (const f of EXTRA_DRAWERS){ try{ f(); }catch(e){} }   // add-on overlays (js/extras.js)
    SpriteRenderer.drawPhase('overlay');
  }
  // sleep sequence: black wash over everything as she drifts off and wakes
  if (restFade > 0){ ctx.fillStyle = `rgba(0,0,0,${restFade})`; ctx.fillRect(0,0,W,H); }
}

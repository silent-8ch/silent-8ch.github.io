/* engine: canvas, state, save/load, helpers, mood, crying  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ==========================  ENGINE  (edit below with care)  ============== */

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const stagewrap = document.getElementById('stagewrap');

// Internal resolution the game logic uses; canvas scales to fit its box.
const W = 360, H = 420;

/* ---------- sprite loading ----------
   Load each sheet, colour-key its background if asked, and stash a ready-to-blit
   canvas + per-frame dimensions. `sheets[key]` mirrors SHEETS[key] plus runtime. */
const sheets = {};
function loadSheet(key, cfg){
  const rec = { cfg, ready:false, canvas:null, fw:0, fh:0 };
  sheets[key] = rec;
  const img = new Image();
  img.onload = ()=>{
    const fw = Math.floor(img.width  / cfg.cols);
    const fh = Math.floor(img.height / cfg.rows);
    rec.canvas = img; rec.fw = fw; rec.fh = fh; rec.ready = true;
  };
  img.src = cfg.src;
}
for (const key in SHEETS) loadSheet(key, SHEETS[key]);

/* ---------- game state ---------- */
const DEFAULT_STATE = {
  hunger: 70, fun: 70, love: 70, energy: 80,
  overfed: 0, overdraw: 0,
  feeds: 0, draws: 0, hugs: 0, rests: 0,
  favTreat: null,
  x: W/2, y: H*0.68,
  lastSeen: null,
};
let state = load();

// visual / animation runtime (not persisted)
const pet = {
  x: state.x, y: state.y,
  tx: state.x, ty: state.y,     // target position she walks toward
  dir: 'down',                  // 'down' | 'left' | 'right' | 'up'
  moving: false,
  action: null,                 // 'eat' | 'draw' | 'hug' while a scripted action plays
  animLock: 0,                  // seconds remaining that lock a scripted action
  frame: 0, frameTime: 0,
  wanderTimer: 1.5,
  bob: 0,
  resting: false, restTimer: 0, zzzTimer: 0,
  restPhase: null, restT: 0, restAngle: 0,   // sleep sequence: lie down → fade to black → stand up
  blush: 0,
};

/* ---------- extension hooks (for add-on features in js/extras.js) ----------
   Push functions here to run every frame or handle taps, without editing the
   core loop/render. EXTRA_UPDATERS: fn(dt) each frame. EXTRA_DRAWERS: fn() draws
   over the scene each frame. EXTRA_TAPS: fn(px,py) on a stage tap — return true
   to consume the tap (skip the default walk-to-spot). All are wrapped in try/catch. */
const EXTRA_UPDATERS = [], EXTRA_DRAWERS = [], EXTRA_TAPS = [];

/* ---------- cheat: ?pchkfa — full bars for 24h, no decay ---------- */
let cheatActive = false, cheatExpires = 0;
(function checkCheat(){
  const params = new URLSearchParams(window.location.search);
  if (params.has('pchkfa')) {
    cheatExpires = Date.now() + 24 * 60 * 60 * 1000;
    try { localStorage.setItem('bpet_cheat', String(cheatExpires)); } catch(e){}
    // redirect to clean URL
    const clean = window.location.pathname;
    window.history.replaceState(null, '', clean);
  }
  try {
    const stored = localStorage.getItem('bpet_cheat');
    if (stored && Date.now() < Number(stored)) { cheatActive = true; cheatExpires = Number(stored); }
  } catch(e){}
})();
const CHARACTER_TAPS = [];  // visible roaming characters get priority over Krystal's tap box

/* ---------- save / load ---------- */
function load(){
  if (CONFIG.save){
    try{
      const raw = localStorage.getItem('bpet');
      if (raw){
        const s = {...DEFAULT_STATE, ...JSON.parse(raw)};
        applyAwayDecay(s);
        return s;
      }
    }catch(e){}
  }
  return {...DEFAULT_STATE};
}
function save(){
  if (!CONFIG.save) return;
  state.x = pet.x; state.y = pet.y; state.lastSeen = Date.now();
  try{ localStorage.setItem('bpet', JSON.stringify(state)); }catch(e){}
}
// While the tab was closed, needs drift down (gently, capped).
function applyAwayDecay(s){
  if (!s.lastSeen) return;
  const secs = Math.min((Date.now()-s.lastSeen)/1000, 60*60*8); // cap at 8h
  s.hunger = clamp(s.hunger - CONFIG.decay.hunger*secs*0.4);
  s.fun    = clamp(s.fun    - CONFIG.decay.fun*secs*0.4);
  s.love   = clamp(s.love   - CONFIG.decay.love*secs*0.4);
  s.energy = clamp((s.energy ?? 80) - CONFIG.decay.energy*secs*0.4);
}

/* ---------- helpers ---------- */
function clamp(v){ return Math.max(0, Math.min(100, v)); }
function rand(a,b){ return a + Math.random()*(b-a); }
function pick(arr){ return arr[(Math.random()*arr.length)|0]; }

/* ---------- mood ---------- */
function moodScore(){ return (state.hunger + state.fun + state.love)/3; }
function moodInfo(){
  if ((state.energy ?? 100) < 18) return {emoji:'😴', label:'sleepy', key:'sad'};
  const m = moodScore();
  if (m > 75) return {emoji:'😄', label:'delighted', key:'happy'};
  if (m > 55) return {emoji:'🙂', label:'happy',     key:'idle'};
  if (m > 35) return {emoji:'😐', label:'okay',      key:'idle'};
  if (m > 18) return {emoji:'🙁', label:'grumpy',    key:'sad'};
  return           {emoji:'😢', label:'sad',       key:'sad'};
}

/* ---------- crying ----------
   She cries when everything is neglected (all three stats below 15%).
   The "c" debug key force-toggles it on/off regardless of stats. */
let debugCry = false;
function isCrying(){
  return debugCry || (state.hunger < 15 && state.fun < 15 && state.love < 15);
}

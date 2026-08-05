/* loop: HUD, nags, idle bubbles, happy trail, main loop, resize, scene core  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ---------- HUD ---------- */
const fills = { hunger:document.getElementById('f-hunger'), fun:document.getElementById('f-fun'), love:document.getElementById('f-love'), energy:document.getElementById('f-energy') };
function updateFeedBtn(){ const b=document.querySelector('.btn[data-action="feed"]'); if(!b) return; const ic=b.querySelector('.ic'); if(ic) ic.textContent=offerTreat.e; if(b.lastChild) b.lastChild.textContent=offerTreat.n; }
function barColor(v){ return v>55 ? 'var(--good)' : v>28 ? 'var(--warn)' : 'var(--bad)'; }
function refreshHUD(){
  for (const k of ['hunger','fun','love','energy']){
    fills[k].style.width = state[k] + '%';
    fills[k].style.background = barColor(state[k]);
  }
  const mi = moodInfo();
  document.getElementById('mood').textContent = mi.emoji + ' ' + mi.label;
  updateClock();
}
// a little time-of-day chip: icon shifts sunrise → day → sunset → night
function updateClock(){
  const el = document.getElementById('clockChip'); if (!el) return;
  const d = new Date();
  let h = d.getHours(); const m = d.getMinutes();
  const icon = h<5 ? '🌙' : h<8 ? '🌅' : h<11 ? '🌤️' : h<17 ? '☀️' : h<20 ? '🌇' : '🌙';
  const ampm = h<12 ? 'am' : 'pm';
  let hh = h%12; if (hh===0) hh=12;
  el.textContent = `${icon} ${hh}:${String(m).padStart(2,'0')}${ampm}`;
}
// Render her name; the first "o" is a secret trigger for the birthday scene.
(function renderPetName(){
  const el = document.getElementById('petname');
  el.textContent = '';
  let armed = false;
  for (const ch of CONFIG.name){
    if (!armed && (ch === 'o' || ch === 'O')){
      const s = document.createElement('span');
      s.textContent = ch;                       // looks identical — it's an easter egg
      s.addEventListener('click', (ev)=>{ ev.stopPropagation(); startBirthday(); });
      el.appendChild(s); armed = true;
    } else {
      el.appendChild(document.createTextNode(ch));
    }
  }
})();

/* ---------- nagging when a need gets low ---------- */
let nagTimer = 0;
function maybeNag(dt){
  nagTimer -= dt;
  if (nagTimer > 0) return;
  nagTimer = 9;
  if (state.energy < 22 && !pet.resting){ say(pick(LINES.tired)); }
  else if (state.hunger < 25){ say(pick(LINES.hungry)); }
  else if (state.love < 25){ say(pick(LINES.needlove)); }
  else if (state.fun < 25){ say(pick(LINES.bored)); }
}

/* ---------- idle thought bubbles (little floating emotes) ---------- */
const THOUGHT_SCENE = (()=>{
  const map = {}; const g=(names,arr)=>names.forEach(n=>map[n]=arr);
  g(['florist','cherryblossom','lavender','tulipfield','sunflowers','greenhouse','topiary','hedgemaze','vineyard','orchard','pasture','alpinemeadow','teaplantation'], ['🌸','🌼','🌷']);
  g(['musicroom','recordshop','ballroom','cinema','carnival','arcade'], ['🎵','🎶']);
  g(['koipond','aquarium','tidepools','coralreef','marina','fishingdock','river','beach','waterlily'], ['🐟','🌊','🐚']);
  g(['bakery','chocolateshop','candyshop','icecreamparlor','cafe','diner','cheeseshop','perfumery'], ['😋','🍪','🧁']);
  g(['fireflies','meteorshower','observatory','planetarium','aurora','biobay','glowwormcave'], ['✨','🌟','🌙']);
  g(['catcafe','petshop','butterflydome','aviary','savanna','backyard'], ['🐾','🥰','🦋']);
  g(['snowycabin','icepond','frozenfalls','icebergbay'], ['❄️','☃️']);
  g(['artstudio','pottery','sewingstudio','weaving','stainedglass','glassblowing','luthier','bookbindery','letterpress','cobbler'], ['🎨','✏️','💡']);
  g(['crystalcave','tarotparlor','enchantedforest','wizardtower','fortuneteller','runecircle','arcanelibrary','fairyring','alchemylab','witchcottage','moontemple','willowispmarsh','enchantedmirrorhall','potionkitchen','crystalgrotto','potionlab'], ['🔮','✨','🌙']);
  return map;
})();
let thoughtTimer = 7;
function idleThoughts(dt){
  thoughtTimer -= dt;
  if (thoughtTimer > 0) return;
  thoughtTimer = rand(7, 13);
  // only think when she isn't busy or already speaking
  if (pet.animLock > 0 || pet.resting || isCrying()) return;
  if (speech.classList.contains('show')) return;
  let e;
  if (state.hunger < 40) e = '🍪';
  else if (state.energy < 40) e = '😴';
  else if (state.love < 40) e = '💗';
  else if (state.fun  < 40) e = '🎨';
  else if (state.favTreat && Math.random() < 0.22) e = state.favTreat;   // daydream of her favorite treat
  else { const list = THOUGHT_SCENE[SCENES[currentScene]] || ['💭','🙂','💛','✨','🎶']; e = pick(list); }
  fxAt(pet.x + rand(-6,6), pet.y - SHEETS.walk.displayH*0.9, '💭'+e);
}

/* ---- when she's really happy, tiny hearts drift up as she walks ---- */
let trailTimer = 2;
function happyTrail(dt){
  trailTimer -= dt;
  if (trailTimer > 0) return;
  // only bubble up when content, moving, and not busy
  if (pet.animLock > 0 || pet.resting || isCrying() || !pet.moving){ trailTimer = 0.6; return; }
  const joy = (state.love + state.fun) / 2;
  if (joy < 82){ trailTimer = 1.2; return; }
  trailTimer = rand(0.9, 1.8);
  // higher joy → a little more often & the warmer hearts
  fxAt(pet.x + rand(-10,10), pet.y - SHEETS.walk.displayH*rand(0.55,0.75),
       pick(joy>92 ? ['💛','💗','💖','✨'] : ['💛','💗']));
}

/* ---------- main loop ---------- */
let last = 0, started = true;   // no splash — the game runs immediately on load
function loop(ts){
  if (!last) last = ts;
  let dt = (ts - last)/1000; last = ts;
  if (dt > 0.1) dt = 0.1;            // clamp big gaps (tab switch)

  // birthday scene takes over the whole screen while it runs
  if (birthday){
    updateBirthday(dt);
    render();
    requestAnimationFrame(loop);
    return;
  }

  if (started){
    // needs decay (relaxed mode halves the drain)
    const dm = (settings && settings.relaxed) ? 0.5 : 1;
    state.hunger = clamp(state.hunger - CONFIG.decay.hunger*dt*dm);
    state.fun    = clamp(state.fun    - CONFIG.decay.fun*dt*dm);
    state.love   = clamp(state.love   - CONFIG.decay.love*dt*dm);
    // energy drains ~2x faster at night unless she's resting
    if (!pet.resting) state.energy = clamp(state.energy - CONFIG.decay.energy*dt*(isNight()?2:1)*dm);
    else state.energy = clamp(state.energy + 9*dt);   // recover while resting
    // Reset overfed/overdraw only when stats drop significantly below full
    if (state.hunger < 80) state.overfed = 0;
    if (state.fun < 80) state.overdraw = 0;
    if (cooldown>0) cooldown -= dt;
    if (interactCd>0) interactCd -= dt;
    if (petCd>0) petCd -= dt;
    if (petStreakTimer>0) petStreakTimer -= dt;
    maybeNag(dt);
    idleThoughts(dt);
    happyTrail(dt);
    findTrinket(dt);
    updateWish(dt);
    updateStar(dt);
    updateShootingStar(dt);
    updatePet(dt);
    for (const f of EXTRA_UPDATERS){ try{ f(dt); }catch(e){} }   // add-on features (js/extras.js)
    // refresh bars periodically (cheap)
    hudAccum += dt; if (hudAccum > 0.25){ refreshHUD(); checkAchievements(); hudAccum = 0; }
    saveAccum += dt; if (saveAccum > 5){ save(); saveAccum = 0; }
  }

  sceneTime += dt;
  updateWaves(dt);
  if (started) updateScene(dt);
  render();
  if (speech.classList.contains('show')) positionSpeech();
  requestAnimationFrame(loop);
}
let hudAccum = 0, saveAccum = 0;
// sleep-sequence timing + the black-fade overlay level (0..1), read by render()
const REST_LIE = 0.75, REST_TOBLACK = 0.7, REST_FROMBLACK = 0.7;
let restFade = 0;

function updatePet(dt){
  pet.bob += dt;
  if (pet.blush > 0) pet.blush -= dt;

  // scripted action (eat/draw/hug) — stand facing forward and play the action art
  if (pet.animLock > 0){
    if (pet.action === 'hug') updateHugRunners(dt);
    pet.animLock -= dt;
    pet.moving = false;
    const s = SHEETS[pet.action] || SHEETS.walk;   // eat/draw have their own sheets
    if (pet.frameLock === null) advanceFrame(dt, s.fps, s.cols);
    if (pet.animLock <= 0){
      hugRunners = [];
      pet.action = null; pet.frame = 0; pet.frameTime = 0; pet.frameLock = null;
    }
    return;
  }

  // resting — a little sleep sequence: she lies down, the screen fades to black,
  // and when it's fully black she stands up again, refreshed, then it fades back in.
  if (pet.resting){
    pet.moving = false; pet.dir = 'down'; pet.frame = 0; pet.frameTime = 0;
    pet.restT += dt;
    const HALF_PI = Math.PI/2;
    const smooth = p => p*p*(3-2*p);
    if (pet.restPhase === 'lie'){                       // rotate toward horizontal
      const p = Math.min(1, pet.restT / REST_LIE);
      pet.restAngle = HALF_PI * smooth(p);
      pet.zzzTimer -= dt; if (pet.zzzTimer <= 0){ burst('💤'); pet.zzzTimer = 1.4; }
      if (p >= 1){ pet.restPhase = 'toblack'; pet.restT = 0; }
      return;
    }
    if (pet.restPhase === 'toblack'){                   // screen fades to black
      restFade = Math.min(1, pet.restT / REST_TOBLACK);
      pet.zzzTimer -= dt; if (pet.zzzTimer <= 0){ burst('💤'); pet.zzzTimer = 1.4; }
      if (restFade >= 1){                               // fully black — she wakes, standing & rested
        restFade = 1; pet.restAngle = 0;
        state.energy = clamp(state.energy + CONFIG.gains.rest);
        state.love   = clamp(state.love + 4);
        refreshHUD(); save();
        pet.restPhase = 'fromblack'; pet.restT = 0;
      }
      return;
    }
    if (pet.restPhase === 'fromblack'){                 // black clears, she's standing again
      restFade = Math.max(0, 1 - pet.restT / REST_FROMBLACK);
      if (restFade <= 0){                               // done — resume normal life
        restFade = 0; pet.resting = false; pet.restPhase = null; pet.restAngle = 0;
        pet.wanderTimer = 1.0;
      }
      return;
    }
    // safety: unknown phase → end the nap cleanly
    pet.resting = false; pet.restPhase = null; pet.restAngle = 0; restFade = 0;
    return;
  }

  // crying — everything neglected (all stats < 15%) or toggled with the "c" key.
  // She stands still and sobs until you cheer her up.
  if (isCrying() && sheets.cry && sheets.cry.ready){
    pet.moving = false;
    pet.dir = 'down';
    advanceFrame(dt, SHEETS.cry.fps, SHEETS.cry.cols);
    return;
  }

  // wander: pick a new spot on the floor now and then
  pet.wanderTimer -= dt;
  if (pet.wanderTimer <= 0){
    pet.tx = rand(W*0.18, W*0.82);
    pet.ty = rand(H*0.66, H*0.82);     // keep her feet on the floor
    pet.wanderTimer = rand(CONFIG.idleWanderEvery[0], CONFIG.idleWanderEvery[1]);
  }

  const dx = pet.tx - pet.x, dy = pet.ty - pet.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 3){
    const step = CONFIG.walkSpeed * dt;
    pet.x += dx/dist * step;
    pet.y += dy/dist * step;
    // choose facing row from the dominant movement axis
    if (Math.abs(dx) > Math.abs(dy)) pet.dir = dx > 0 ? 'right' : 'left';
    else                             pet.dir = dy > 0 ? 'down'  : 'up';
    pet.moving = true;
    advanceFrame(dt, SHEETS.walk.fps, SHEETS.walk.cols);
  } else {
    pet.moving = false;                // idle: rest on the standing frame
    pet.frame = 0; pet.frameTime = 0;
  }
}

function updateHugRunners(dt){
  const arrived = [];
  for (const runner of hugRunners){
    const rank = Math.floor(runner.slot / 2);
    const targetOffset = runner.side * (HUG_BASE_GAP + rank * HUG_SIDE_STEP);
    const targetX = pet.x + targetOffset;
    const dx = targetX - runner.x;
    const step = HUG_RUN_SPEED * dt;

    runner.y += (pet.y - runner.y) * Math.min(1, dt * 8);
    runner.frameTime += dt;
    while (runner.frameTime >= 1 / 12){
      runner.frameTime -= 1 / 12;
      runner.frame = (runner.frame + 1) % 4;
    }

    if (Math.abs(dx) <= step + 2){
      runner.x = targetX;
      arrived.push(runner);
    } else {
      runner.x += Math.sign(dx) * step;
    }
  }
  if (arrived.length){
    arrived.sort((a,b)=>a.slot-b.slot);
    const names = new Set(arrived.map(runner=>runner.name));
    hugRunners = hugRunners.filter(runner => !names.has(runner.name));
    for (const runner of arrived){
      if (!hugGroup.includes(runner.name)) hugGroup.push(runner.name);
    }
    hearts();
  }
}

function advanceFrame(dt, fps, cols){
  pet.frameTime += dt;
  const spf = 1 / fps;
  while (pet.frameTime >= spf){ pet.frameTime -= spf; pet.frame = (pet.frame + 1) % cols; }
}

/* ==========================  RENDER  ====================================== */
function resize(){
  const r = stagewrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  cv.width = r.width*dpr; cv.height = r.height*dpr;
  ctx.setTransform(cv.width/W, 0, 0, cv.height/H, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);

let sceneTime = 0;
const SCENES = ['beach', 'backyard', 'river'];
let currentScene = 0;
let sceneChangeTimer = 60; // seconds

// Scenes hidden from the rotation (persisted). Absent = enabled, so scenes
// added later default to on.
let disabledScenes = (function(){ try{ const r=localStorage.getItem('bpet_disabled'); if(r) return new Set(JSON.parse(r)); }catch(e){} return new Set(); })();
function saveDisabled(){ try{ localStorage.setItem('bpet_disabled', JSON.stringify([...disabledScenes])); }catch(e){} }

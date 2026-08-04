/* pet: actions, petting, animation, speech/fx, wishes, star, tap-to-interact  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ---------- actions ---------- */
let cooldown = 0;
function doAction(kind){
  if (cooldown > 0) return;
  cooldown = 0.6;
  sfx(kind);
  const ck = {feed:'feeds',draw:'draws',hug:'hugs',rest:'rests'}[kind];
  if (ck){ state[ck] = (state[ck]||0) + 1; if (typeof checkAchievements==='function') checkAchievements(); }

  if (kind === 'feed'){
    const tr = offerTreat;
    const wouldOverfeed = state.hunger + CONFIG.gains.feed > 100;
    state.hunger = clamp(state.hunger + CONFIG.gains.feed);
    if (wouldOverfeed) {
      state.overfed += CONFIG.gains.feed;
      if (state.overfed >= 70) {
        state.hunger = state.hunger * 0.5;
        state.fun = state.fun * 0.5;
        state.love = state.love * 0.5;
        state.overfed = 0;
        playAnim('eat', 2.0, 2); say(pick(LINES.throwup)); throwUpFx();
      } else {
        playAnim('eat', 1.6); say(pick(LINES.feedFull)); burst(tr.e);
      }
    } else {
      state.overfed = 0;
      if (tr.e === state.favTreat){
        playAnim('eat', 1.6); say('My favorite! ' + tr.e + ' 💖');
        state.love = clamp(state.love + 8); burst(tr.e); hearts();
      } else {
        playAnim('eat', 1.6); say(pick(tr.l)); burst(tr.e);
      }
    }
    offerTreat = pick(TREATS); updateFeedBtn();   // offer a new treat next time
  }
  if (kind === 'draw'){
    const wouldOverdraw = state.fun + CONFIG.gains.draw > 100;
    state.fun = clamp(state.fun + CONFIG.gains.draw);
    state.love = clamp(state.love+6);
    if (wouldOverdraw) {
      state.overdraw += CONFIG.gains.draw;
      state.hunger = clamp(state.hunger - state.overdraw * 0.3);
      playAnim('draw',1.8); say(pick(LINES.drawHungry)); burst('🎨');
    } else {
      state.overdraw = 0;
      playAnim('draw',1.8); say(pick(LINES.draw)); burst('🎨'); burst('🌈');
    }
  }
  if (kind === 'rest'){
    pet.resting = true; pet.restTimer = 5; pet.zzzTimer = 0.1;
    state.energy = clamp(state.energy + CONFIG.gains.rest);
    state.love = clamp(state.love + 4);
    say(pick(isNight() ? LINES.sleepyNight : LINES.rest));
    pet.wanderTimer = 5.2;   // don't wander off the moment she wakes
    refreshHUD(); save(); return;
  }
  if (kind === 'hug' ){
    state.love = clamp(state.love + CONFIG.gains.hug); state.fun = clamp(state.fun+8);
    // fresh hug starts a new group; pressing again mid-hug adds another hugger
    const midHug = pet.animLock > 0 && pet.action === 'hug';
    if (!midHug) hugGroup = [];
    addHugger();
    playAnim('hug', HUG_DURATION);   // (re)start / extend the hug so you can pile on
    say(pick(LINES.hug)); hearts();
  }
  pet.wanderTimer = 0.4;   // resume wandering shortly after the action

  refreshHUD();
  save();
}
document.querySelectorAll('.btn[data-action]').forEach(b=>{
  b.addEventListener('click', ()=> doAction(b.dataset.action));
});
// Tap the pet for a hug too.
stagewrap.addEventListener('pointerdown', (e)=>{
  const r = cv.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * W;
  const py = (e.clientY - r.top)  / r.height * H;
  // during the birthday scene, taps blow out candles (or return when finished)
  if (birthday){
    if (birthday.done) endBirthday();
    else blowOutOne(px, py);                                // blow out the nearest candle to the tap
    return;
  }
  // sprite occupies roughly a box above the feet point (pet.x, pet.y)
  const h = SHEETS.walk.displayH;
  const halfW = h * 0.32;
  if (px > pet.x-halfW && px < pet.x+halfW && py > pet.y-h && py < pet.y+12){
    if (py < pet.y - h*0.55) doPet();      // tapping her head/face -> a gentle nuzzle
    else doAction('hug');                  // tapping her body -> a hug
    return;
  }
  // tapping elsewhere: she looks over, walks to the spot, and reacts to the place
  tapScene(px, py);
});
// a gentle boop on the head — she blushes and giggles (distinct from a hug)
let petCd = 0;
let petStreak = 0, petStreakTimer = 0;   // quick successive boops build a cuddle combo
const PET_COMBO = { 3:'A little cuddle streak! ×3 💕', 5:'Mmm, don\'t stop ×5 🥰', 8:'You spoil me ×8 💖', 12:'I\'m the luckiest ×12 💞' };
function doPet(){
  if (petCd > 0 || pet.animLock > 0) return;
  petCd = 0.5;
  // combo: keep counting while boops keep coming inside the window
  petStreak = (petStreakTimer > 0) ? petStreak + 1 : 1;
  petStreakTimer = 2.6;
  pet.blush = Math.min(2.2, pet.blush + 1.4);
  const milestone = PET_COMBO[petStreak];
  if (milestone){
    say(milestone); state.love = clamp(state.love + 10); state.fun = clamp(state.fun + 6);
    hearts(); sfx('day');
  } else {
    state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 4);
    say(pick(LINES.pet)); sfx('tap');
    // show the running combo count once she's on a little roll
    fxAt(pet.x + rand(-14,14), pet.y - SHEETS.walk.displayH*0.6, petStreak >= 2 ? ('×'+petStreak+' 💗') : pick(['💗','✨','😊']));
  }
  refreshHUD();
}

/* ---------- scripted animation ---------- */
function playAnim(action, dur, lockFrame){
  pet.action = action; pet.animLock = dur; pet.frame = lockFrame ?? 0; pet.frameTime = 0;
  pet.frameLock = lockFrame ?? null;
  pet.dir = 'down';                    // face the player during an action
}

/* ---------- speech + fx ---------- */
const speech = document.getElementById('speech');
let speechTimer = null;
function say(text){
  speech.textContent = text; speech.classList.add('show');
  positionSpeech();
  clearTimeout(speechTimer);
  speechTimer = setTimeout(()=> speech.classList.remove('show'), 1800);
}
function positionSpeech(){
  const r = cv.getBoundingClientRect();
  const wrapR = stagewrap.getBoundingClientRect();
  const sh = SHEETS.walk;
  const dispH = sh ? sh.displayH || 150 : 150;
  const sx = (pet.x / W) * r.width + (r.left - wrapR.left);
  const sy = ((pet.y - dispH - 10) / H) * r.height + (r.top - wrapR.top);
  speech.style.left = sx + 'px';
  speech.style.top = sy + 'px';
}
function fxAt(px, py, chars){
  const r = cv.getBoundingClientRect();
  const wrapR = stagewrap.getBoundingClientRect();
  const sx = (px/W)*r.width  + (r.left - wrapR.left);
  const sy = (py/H)*r.height + (r.top  - wrapR.top);
  const el = document.createElement('div');
  el.className = 'fx'; el.textContent = chars;
  el.style.left = sx+'px'; el.style.top = sy+'px';
  stagewrap.appendChild(el);
  setTimeout(()=> el.remove(), 1300);
}
function burst(ch){ for(let i=0;i<3;i++) setTimeout(()=> fxAt(pet.x + rand(-24,24), pet.y-30, ch), i*90); }
function burstAt(ch, px, py){ for(let i=0;i<3;i++) setTimeout(()=> fxAt(px + rand(-14,14), py-8, ch), i*90); }
function hearts(){ for(let i=0;i<5;i++) setTimeout(()=> fxAt(pet.x + rand(-30,30), pet.y-30, pick(['💗','💛','💖'])), i*80); }

/* ---- she occasionally wishes to visit a place; take her there ---- */
let wish = null, wishTimer = 45 + Math.random()*45, wishExpire = 0;
function pickWish(){
  const en = enabledIndices().filter(i => i !== currentScene);
  if (!en.length) return;
  const idx = en[Math.floor(Math.random()*en.length)];
  wish = { idx, label: sceneLabel(SCENES[idx]) };
  wishExpire = 32;
  const bar = document.getElementById('wishBar');
  bar.innerHTML = `<span class="wt">🥺 Can we visit the ${wish.label}?</span><button id="wishGo">Take me →</button><span class="wx" id="wishNo">✕</span>`;
  bar.classList.remove('hide');
  document.getElementById('wishGo').addEventListener('click', grantWish);
  document.getElementById('wishNo').addEventListener('click', hideWish);
  say(`I'd love to see the ${wish.label}…`);
}
function grantWish(){
  if (!wish) return;
  currentScene = wish.idx; sceneChangeTimer = 60;
  state.love = clamp(state.love + 8); state.fun = clamp(state.fun + 6); refreshHUD();
  say(pick(['Yay! Thank you 🥰','I love it here! 💛','This is perfect 😊'])); hearts(); if (typeof sfx==='function') sfx('find');
  hideWish();
}
function hideWish(){ wish = null; const bar=document.getElementById('wishBar'); if(bar) bar.classList.add('hide'); }
function updateWish(dt){
  if (wish){ wishExpire -= dt; if (wishExpire <= 0) hideWish(); return; }
  wishTimer -= dt;
  if (wishTimer <= 0){ wishTimer = 90 + Math.random()*90;
    if (pet.animLock>0 || pet.resting || isCrying() || speech.classList.contains('show')) return;
    if (moodScore() < 35) return;   // don't ask when she's needy
    pickWish();
  }
}

/* ---- wish on a star at night ---- */
let starTimer = 30 + Math.random()*40, starExpire = 0, starActive = false;
function nightNow(){ return isNight() || SCENE_NO_DAYNIGHT.has(SCENES[currentScene]); }
function showStar(){
  const el = document.getElementById('starWish'); if (!el) return;
  el.style.left = (8 + Math.random()*72) + '%';
  el.style.top  = (6 + Math.random()*22) + '%';
  el.classList.remove('hide'); starActive = true; starExpire = 9;
}
function grantStar(){
  if (!starActive) return; starActive = false;
  const el = document.getElementById('starWish'); if (el) el.classList.add('hide');
  say(pick(["I wished for us 💫", "Make a wish… ✨", "🌟 Wish made!", "I wished you'd stay 🥰"]));
  hearts(); state.love = clamp(state.love + 6); state.fun = clamp(state.fun + 4); refreshHUD();
  if (typeof sfx==='function') sfx('find');
  if (typeof collection==='object'){ collection['✨'] = (collection['✨']||0) + 1; saveCollection(); }
}
function updateStar(dt){
  if (starActive){ starExpire -= dt; if (starExpire <= 0){ starActive=false; const el=document.getElementById('starWish'); if(el) el.classList.add('hide'); } return; }
  starTimer -= dt;
  if (starTimer <= 0){ starTimer = 60 + Math.random()*80;
    if (!nightNow()) return;
    if (pet.animLock>0 || pet.resting || isCrying()) return;
    showStar();
  }
}

/* ---------- tap the scene: she walks over & reacts to the place ---------- */
const SCENE_INTERACT = (()=>{
  const map = {};
  const g = (names, o) => names.forEach(n => map[n] = o);
  g(['catcafe'], {lines:['Kitty! 🐱','So soft…','Purrr 🐱'], emoji:'🐱', love:5});
  g(['florist','cherryblossom','lavender','tulipfield','sunflowers','greenhouse','topiary','hedgemaze','pasture','alpinemeadow','vineyard','orchard','teaplantation'], {lines:['Mmm, flowers 🌸','Smells lovely 💐','So pretty!'], emoji:'🌸', fun:5});
  g(['snowycabin','library','forge','candleshop','glassblowing','bakery'], {lines:['So warm 🔥','Cozy…','Toasty! 🔥'], emoji:'🔥', energy:6});
  g(['koipond','aquarium','tidepools','coralreef','marina','fishingdock','river','waterlily'], {lines:['Fishies! 🐟','So calming…','Look at them go 🐠'], emoji:'🐟', fun:5});
  g(['fireflies','meteorshower','observatory','planetarium','aurora','biobay','glowwormcave'], {lines:['Make a wish ✨','So magical 🌟','The lights!'], emoji:'✨', love:5});
  g(['chocolateshop','candyshop','icecreamparlor','cafe','diner','cheeseshop'], {lines:['Yummy smells 🍪','I want a treat!','Mmm 😋'], emoji:'😋', hunger:5});
  g(['beach'], {lines:['A seashell! 🐚','Sandy toes 🏖️','The waves 🌊'], emoji:'🐚', fun:5});
  g(['musicroom','recordshop','ballroom','cinema','carnival','arcade'], {lines:['I love this song 🎵','Dance with me!','La la la 🎶'], emoji:'🎵', fun:5});
  g(['petshop','butterflydome','aviary','savanna','backyard'], {lines:['Hi little ones! 🐾','So cute!','Animals 🥰'], emoji:'🐾', love:5});
  g(['spa','hotspring','zengarden','bamboo'], {lines:['So relaxing… 😌','Ahhh 💆','Peaceful.'], emoji:'💧', energy:5});
  return map;
})();
const AMBIENT = ["It's lovely here 💛", 'I like it here.', 'So pretty ✨', 'Look over there!', "Let's stay a while 🥰", 'Where to next?'];
let interactCd = 0;
function tapScene(px, py){
  if (interactCd > 0 || pet.animLock > 0) return;
  interactCd = 1.2;
  // walk toward the tapped spot (feet stay on the floor band)
  pet.tx = Math.max(W*0.14, Math.min(W*0.86, px));
  pet.ty = Math.max(H*0.66, Math.min(H*0.82, py));
  pet.wanderTimer = rand(3,5);
  pet.dir = px < pet.x ? 'left' : 'right';
  const sp = SCENE_INTERACT[SCENES[currentScene]];
  if (sp){
    say(pick(sp.lines)); burstAt(sp.emoji, px, py); sfx('tap');
    if (sp.love)   state.love   = clamp(state.love   + sp.love);
    if (sp.fun)    state.fun    = clamp(state.fun    + sp.fun);
    if (sp.energy) state.energy = clamp(state.energy + sp.energy);
    if (sp.hunger) state.hunger = clamp(state.hunger + sp.hunger);
    refreshHUD();
  } else {
    say(pick(AMBIENT));
  }
}

function throwUpFx(){
  const r = cv.getBoundingClientRect();
  const wrapR = stagewrap.getBoundingClientRect();
  const sh = SHEETS.walk;
  const dispH = sh ? sh.displayH || 150 : 150;

  // mouth position (roughly mid-face)
  const mouthY = pet.y - dispH * 0.55;
  // feet position (where cookies pool)
  const feetY = pet.y;

  const toScreenX = (px) => (px / W) * r.width + (r.left - wrapR.left);
  const toScreenY = (py) => (py / H) * r.height + (r.top - wrapR.top);

  const mouthSX = toScreenX(pet.x);
  const mouthSY = toScreenY(mouthY);
  const feetSY = toScreenY(feetY);
  const fallDist = feetSY - mouthSY;

  // Stream of cookies falling from mouth
  const numCookies = 8;
  for (let i = 0; i < numCookies; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'vomit';
      el.textContent = '🍪';
      const startX = mouthSX + rand(-8, 8);
      el.style.left = startX + 'px';
      el.style.top = mouthSY + 'px';
      stagewrap.appendChild(el);

      const xDrift = rand(-20, 20);
      const dur = rand(400, 600);
      el.animate([
        { top: mouthSY + 'px', left: startX + 'px', opacity: 1, transform: 'rotate(0deg) scale(1)' },
        { top: feetSY + 'px', left: (startX + xDrift) + 'px', opacity: 1, transform: 'rotate(' + rand(-180, 180) + 'deg) scale(0.7)' }
      ], { duration: dur, easing: 'ease-in', fill: 'forwards' });

      setTimeout(() => el.remove(), dur);

      // After each cookie lands, add it to the pool
      setTimeout(() => {
        const pool = document.createElement('div');
        pool.className = 'vomit-pool';
        pool.textContent = '🍪';
        pool.style.left = (startX + xDrift + rand(-6, 6)) + 'px';
        pool.style.top = (feetSY + rand(-4, 4)) + 'px';
        stagewrap.appendChild(pool);
        setTimeout(() => pool.remove(), 3000);
      }, dur);
    }, i * 120);
  }
}


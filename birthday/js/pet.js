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
    if (pet.resting) return;                 // already napping
    // start the sleep sequence: lie down → screen fades to black → she stands up refreshed.
    // The energy/love payoff is applied at the fully-black moment (see updatePet).
    pet.resting = true;
    pet.restPhase = 'lie'; pet.restT = 0; pet.restAngle = 0; pet.zzzTimer = 0.4;
    restFade = 0;
    say(pick(isNight() ? LINES.sleepyNight : LINES.rest));
    pet.wanderTimer = 6;     // don't wander off the moment she wakes
    refreshHUD(); return;
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
  // add-on tap handlers (js/extras.js) get first refusal; return true to consume the tap
  for (const f of EXTRA_TAPS){ try{ if (f(px, py)) return; }catch(e){} }
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
  g(['autumnforest','orchard','pumpkinpatch','coveredbridge','cornmaze','wheatfield','redwoods'], {lines:['Crunchy leaves! 🍂','Cozy autumn 🍁','Look, a little pumpkin! 🎃'], emoji:'🍁', fun:5});
  g(['artstudio','pottery','sewingstudio','weaving','stainedglass','luthier','bookbindery','letterpress','cobbler'], {lines:['So creative here 🎨','Can we make something?','I love handmade things ✨'], emoji:'🎨', fun:5});
  g(['icepond','frozenfalls','icebergbay'], {lines:['So sparkly and cold! ❄️','Brrr — pretty though ⛄','Icy magic ✨'], emoji:'❄️', fun:5});
  g(['perfumery','millinery','balletstudio'], {lines:['So elegant 💃','I feel fancy!','Twirl with me 🩰'], emoji:'💃', love:5});
  g(['desert','saltflats'], {lines:['So wide and warm ☀️','Endless sky!','Careful, it\'s toasty 🌵'], emoji:'🌵', energy:4});
  g(['teahouse'], {lines:['Tea time? 🍵','So peaceful here…','Mmm, warm and cozy 🍵'], emoji:'🍵', energy:5});
  g(['nightmarket'], {lines:['So many lanterns! 🏮','Look at all the stalls ✨','Smells amazing here 😋'], emoji:'🏮', fun:5});
  g(['ramenshop'], {lines:['Ramen! 🍜','Slurp slurp 😋','So warm and yummy'], emoji:'🍜', hunger:5});
  g(['moonlitjetty'], {lines:['So peaceful on the water 🌙','The moonlight… ✨','Sit with me here 🥰'], emoji:'🌙', love:5});
  g(['orchidroom'], {lines:['Beautiful orchids 🌸','So delicate!','It smells divine 💐'], emoji:'🌸', fun:5});
  g(['campsite'], {lines:['Cozy campfire 🔥','Marshmallows? 🥰','Under the stars ✨'], emoji:'🔥', energy:5});
  g(['mountain','cliffs','canyon','sanddunes','riceterraces'], {lines:['What a view! ⛰️','Fresh air 🌿','So peaceful up here'], emoji:'⛰️', energy:5});
  g(['toyshop','comicshop','trainroom','puppettheater','bowling','magicshop','escaperoom','chesshall'], {lines:['So much fun stuff! 🎁','Can we play?','This is exciting! 🎉'], emoji:'🎉', fun:5});
  g(['rainystreet'], {lines:['I love the rain 🌧️','Splash! ☔','Cozy and grey 💙'], emoji:'🌧️', love:4});
  g(['sciencelab','naturalhistory','cartographer','optician','apothecary','clockmaker','antiqueshop'], {lines:['So many curiosities! 🔍','How fascinating 🤓','I want to learn everything'], emoji:'🔍', fun:4});
  g(['waterfall','geyser','bayou','cranberrybog'], {lines:['Listen to the water 💧','So wild and beautiful 🌿','Nature is amazing!'], emoji:'💧', energy:5});
  g(['lighthouse','windmill'], {lines:['Look how tall! 🗼','What a landmark ✨','I can see so far'], emoji:'🌅', fun:4});
  g(['winecellar','barbershop','darkroom'], {lines:['So atmospheric here','Cozy little spot 💛','I like the quiet'], emoji:'💛', love:4});
  g(['volcano','fireworks','prairiestorm'], {lines:['Wow, so dramatic! 🎆','Look at that! 😮','So powerful ✨'], emoji:'🎆', fun:5});
  g(['fencing','boxinggym'], {lines:['En garde! 🤺','So energetic!','Let\'s train 💪'], emoji:'💪', energy:5});
  g(['balloons','balloonfest'], {lines:['Balloons! 🎈','So colorful 🎈','Up up up! ✨'], emoji:'🎈', fun:5});
  g(['recordingstudio'], {lines:['Let\'s make music 🎶','Sing with me! 🎤','La la la 🎵'], emoji:'🎤', fun:5});
  g(['terrariumshop','nursery'], {lines:['Tiny green worlds 🌱','So cute and small!','Let\'s grow something 🌿'], emoji:'🌱', love:4});
  g(['rooftop'], {lines:['What a view up here! 🌆','The city lights ✨','So high up 🥰'], emoji:'🌆', fun:5});
  g(['jazzclub'], {lines:['Smooth tunes 🎷','Sway with me…','So dreamy 🎶'], emoji:'🎷', fun:5});
  g(['ferriswheel'], {lines:['Round and round! 🎡','Look how high! 😍','Ride with me? 🥰'], emoji:'🎡', love:5});
  g(['mushroomglade'], {lines:['Look, little mushrooms! 🍄','So enchanted ✨','A fairy place 🧚'], emoji:'🍄', fun:5});
  g(['hammam'], {lines:['So warm and steamy ♨️','Ahhh, relaxing 😌','Melting away…'], emoji:'♨️', energy:5});
  g(['farmersmarket'], {lines:['Fresh veggies! 🥕','So many goodies 🧺','Let\'s pick something yummy 😋'], emoji:'🥕', hunger:5});
  g(['skilodge'], {lines:['Cozy by the fire 🔥','Hot cocoa? ☕','Snug as can be 🧣'], emoji:'🔥', energy:5});
  g(['crystalcave'], {lines:['So sparkly! 💎','It glows! ✨','Look at the crystals 😍'], emoji:'💎', fun:5});
  g(['lanternfestival'], {lines:['So many lanterns! 🏮','Make a wish… ✨','So magical 🥰'], emoji:'🏮', love:5});
  g(['sushibar'], {lines:['Sushi! 🍣','So fresh and pretty 😋','One of each? 🥢'], emoji:'🍣', hunger:5});
  g(['seasidecarousel'], {lines:['Round and round! 🎠','Which horse is yours? 🥰','So dreamy by the sea 🌊'], emoji:'🎠', fun:5});
  g(['potionkitchen'], {lines:['Bubble bubble ✨','What does this one do? 🧪','A love potion? 💕'], emoji:'🧪', fun:5});
  g(['kitehill'], {lines:['Fly, kite, fly! 🪁','So breezy up here 🌬️','Higher, higher! 😍'], emoji:'🪁', energy:5});
  g(['flowermarket'], {lines:['So many blooms! 💐','Pick a bouquet with me? 🌷','Smells wonderful 🌻'], emoji:'💐', fun:5});
  g(['snowglobeshop'], {lines:['Look, it\'s snowing inside! ❄️','So tiny and magical ⛄','Shake it again! 😍'], emoji:'❄️', fun:5});
  g(['nightgarden'], {lines:['So peaceful at night 🌙','The flowers glow ✨','Walk with me? 🥰'], emoji:'🌙', love:5});
  g(['mochishop'], {lines:['Mochi! 🍡','So soft and sweet 😋','One more? 🥰'], emoji:'🍡', hunger:5});
  g(['aquariumtunnel'], {lines:['Fish all around us! 🐠','It\'s like we\'re underwater 🫧','So dreamy in here 😍'], emoji:'🐠', fun:5});
  g(['starrymeadow'], {lines:['Look at all the stars 🌟','Lie in the grass with me? 🌾','So quiet and lovely 🥰'], emoji:'🌟', love:5});
  g(['harbornight'], {lines:['The boats look so peaceful ⚓','City lights on the water 🌃','Let\'s sit by the docks 🥰'], emoji:'⚓', love:5});
  g(['giftwrapshop'], {lines:['So many pretty ribbons! 🎀','Is one for me? 🎁','I love surprises! 😍'], emoji:'🎁', fun:5});
  g(['gingerbreadkitchen'], {lines:['It smells like cookies! 🍪','Can we decorate one? 🍬','So warm and sweet 😋'], emoji:'🍪', hunger:5});
  g(['sunflowermaze'], {lines:['So many sunflowers! 🌻','Don\'t let go of my hand 🥰','Which way now? 😄'], emoji:'🌻', fun:5});
  g(['jellyfishtank'], {lines:['They glow so pretty 🪼','So peaceful… ✨','Look how they float 😍'], emoji:'🪼', love:5});
  g(['cavehotspring'], {lines:['So warm in here ♨️','Ahhh, cozy… 😌','Just us and the steam 🥰'], emoji:'♨️', energy:5});
  g(['iceskatingrink'], {lines:['Skate with me! ⛸️','Don\'t let me fall 🥰','Wheee! ❄️'], emoji:'⛸️', fun:5});
  g(['candyfactory'], {lines:['So much candy! 🍭','Can I have one? 😋','It\'s a sweet dream 🍬'], emoji:'🍭', hunger:5});
  g(['moonbeach'], {lines:['Moonlight on the water 🌝','A midnight stroll? 🥰','So calm and lovely ✨'], emoji:'🌝', love:5});
  g(['papercraftstudio'], {lines:['Let\'s make something! ✂️','So many pretty papers 🎨','I\'ll fold you a heart 💗'], emoji:'✂️', fun:5});
  g(['poppyfield'], {lines:['So many poppies! 🌺','Let\'s run through them 🥰','So bright and happy 🌼'], emoji:'🌺', fun:5});
  g(['treehouse'], {lines:['Our own little hideaway 🌳','Cozy up here 🥰','Just the two of us 💛'], emoji:'🌳', love:5});
  g(['desertoasis'], {lines:['Palm trees! 🌴','Cool water at last 💧','So peaceful here 😌'], emoji:'🌴', energy:5});
  g(['dumplinghouse'], {lines:['Dumplings! 🥟','So warm and yummy 😋','Share a plate? 🥢'], emoji:'🥟', hunger:5});
  g(['sakuratunnel'], {lines:['Cherry blossoms everywhere! 🌸','Walk with me through them 🥰','So dreamy and pink ✨'], emoji:'🌸', love:5});
  g(['igloo'], {lines:['So cozy inside! 🧊','Snuggle to keep warm? 🥰','Brrr, but pretty ❄️'], emoji:'🧊', energy:5});
  g(['mistyforest'], {lines:['So mysterious 🌫️','Stay close to me 🥰','It\'s so quiet here 🌲'], emoji:'🌫️', fun:5});
  g(['planetlab'], {lines:['Look at the planets! 🪐','So many stars 🌠','Let\'s explore space 🚀'], emoji:'🪐', fun:5});
  g(['wizardtower'], {lines:['So much magic in the air 🪄','Teach me a spell? ✨','The potions are bubbling 🔮'], emoji:'🪄', fun:5});
  g(['fortuneteller'], {lines:['What does our future hold? 🔮','I see love in the cards 🃏','So mysterious… 🕯️'], emoji:'🔮', love:5});
  g(['runecircle'], {lines:['The runes are glowing ✨','Can you feel the magic? 🌙','Make a wish with me 🥰'], emoji:'✨', love:5});
  g(['arcanelibrary'], {lines:['So many ancient books 📜','What secrets are here? 🦉','Read to me? 🕯️'], emoji:'📜', fun:5});
  g(['fairyring'], {lines:['Fairies live here! 🧚','So enchanted ✨','Careful, it\'s magic 🍄'], emoji:'🧚', fun:5});
  g(['alchemylab'], {lines:['So many bubbling potions 🧪','What are we brewing? ⚗️','Careful, it\'s fizzing! ✨'], emoji:'⚗️', fun:5});
  g(['witchcottage'], {lines:['So cozy and spooky 🕯️','Is that a black cat? 🐈‍⬛','It smells like herbs 🧹'], emoji:'🕯️', love:5});
  g(['moontemple'], {lines:['So sacred and still 🌙','The moonlight feels holy ✨','Let\'s be quiet here 🥰'], emoji:'🌙', love:5});
  g(['willowispmarsh'], {lines:['Little lights in the mist 🔥','Stay close to me 🥺','So eerie and pretty 🌫️'], emoji:'🔥', fun:5});
  g(['enchantedmirrorhall'], {lines:['So many reflections! 🪞','I see us everywhere 🥰','It shimmers like magic ✨'], emoji:'🪞', fun:5});
  g(['hummingbirdgarden'], {lines:['Look, a hummingbird! 🐦','So tiny and quick 🥰','They love the flowers 🌺'], emoji:'🐦', love:5});
  g(['gelateria'], {lines:['Gelato! 🍨','So many flavors 😋','Which one should we get? 🍦'], emoji:'🍨', hunger:5});
  g(['lotuspond'], {lines:['The lotus flowers 🪷','So calm and pretty ✨','Let\'s sit by the water 🥰'], emoji:'🪷', energy:5});
  g(['trainstation'], {lines:['Where shall we go? 🚂','So many adventures 🧳','All aboard! 🎫'], emoji:'🚂', fun:5});
  g(['birchgrove'], {lines:['So tall and peaceful 🌳','The leaves whisper 🍂','A quiet walk with you 🥰'], emoji:'🌳', energy:5});
  g(['balloonride'], {lines:['We\'re so high up! 🎈','The view is amazing ☁️','Float away with me 🥰'], emoji:'🎈', fun:5});
  g(['bonsaigarden'], {lines:['So tiny and perfect 🌳','Such careful little trees ✂️','So calming here 😌'], emoji:'🌳', energy:5});
  g(['harvestbarn'], {lines:['Look at the harvest! 🌽','So cozy and rustic 🍂','Hayride? 🥰'], emoji:'🌽', fun:5});
  g(['peonygarden'], {lines:['The peonies are blooming! 🌷','So soft and fragrant 🌸','A butterfly! 🦋'], emoji:'🌷', fun:5});
  g(['rooftoppool'], {lines:['Let\'s cool off! 🏊','So refreshing ☀️','Sip a drink with me? 🍹'], emoji:'🏊', energy:5});
  g(['sugarshack'], {lines:['Maple syrup! 🍁','So sweet and sticky 🥞','Pancakes? 😋'], emoji:'🍁', hunger:5});
  g(['sunroom'], {lines:['So warm and bright ☀️','Cozy up with a book? 📚','My favorite little nook 🥰'], emoji:'☀️', energy:5});
  g(['duckpond'], {lines:['Little ducks! 🦆','Quack quack 🥰','Let\'s feed them 🍞'], emoji:'🦆', love:5});
  g(['beekeepergarden'], {lines:['Busy little bees 🐝','Fresh honey? 🍯','So sweet and buzzy 🌼'], emoji:'🐝', fun:5});
  g(['kelpforest'], {lines:['Swaying kelp 🌿','So peaceful underwater ✨','Look, a fish! 🐟'], emoji:'🌿', energy:5});
  g(['cheesecave'], {lines:['So many cheeses! 🧀','Yummy and stinky 😋','A little taste? 🍷'], emoji:'🧀', hunger:5});
  return map;
})();
const AMBIENT = ["It's lovely here 💛", 'I like it here.', 'So pretty ✨', 'Look over there!', "Let's stay a while 🥰", 'Where to next?', 'I\'m so glad you\'re here 💛', 'This spot feels like ours.', 'Can we come back here again?', 'Everything is nicer with you.', 'Ooh, what\'s over there?', 'I could stay here forever with you 🥰', 'This feels like a little dream 💭', 'My favorite place is wherever you are.', 'Let\'s make a memory here 📸', 'I\'m so happy right now 😊', 'Hold my hand? 🤝', 'What a perfect little moment 💛', 'I never want this to end 🥰', 'You always take me somewhere lovely.', 'Pinch me — this is too nice 😊', 'Just you and me and the view 💫', 'I feel so safe with you here.', 'Thank you for today 💛', 'Let\'s remember this one 🌟', 'Everywhere is prettier with you.', 'I\'m exactly where I want to be 😊', 'You always know the loveliest spots.'];

/* ---- generic tap-region system: tapping different AREAS gives different reactions,
   flavored by the current scene. Makes EVERY scene (incl. future ones) reactive. ---- */
const REGION_SKY    = { lines:['Look up there! ☁️','Something in the sky ✨','Way up high! 🕊️','The view above us 🌤️','Up above us 🌈'], emojis:['☁️','✨','🌤️','🕊️'] };
const REGION_GROUND = { lines:['Something in the grass 🌿','Down by our feet 👀','Ooh, on the ground! 🐞','What\'s down here? 🍃','Look, right here! 🌱'], emojis:['🌿','🌱','🐞','🍃'] };
const REGION_MID    = { lines:['Ooh, over here!','What\'s this? 👀','Come see! 💫','Right here 🥰','Look at this!'], emojis:['💫','✨','💛'] };
// px,py are canvas coords; returns {line, emoji, sp} using the scene's flavor
function regionReaction(px, py){
  const scene = SCENES[currentScene];
  const sp = SCENE_INTERACT[scene];
  const trinkets = (typeof TRINKET_POOL === 'object' && TRINKET_POOL[scene])
                || (typeof TRINKET_DEFAULT !== 'undefined' ? TRINKET_DEFAULT : ['✨']);
  let line, emoji;
  if (py < H*0.36){                                   // upper / sky band
    line  = pick(REGION_SKY.lines);
    emoji = pick(Math.random() < 0.3 ? trinkets : REGION_SKY.emojis);
  } else if (py > H*0.60){                            // lower / ground band
    line  = pick(REGION_GROUND.lines);
    emoji = pick(Math.random() < 0.4 ? trinkets : REGION_GROUND.emojis);
  } else if (sp){                                     // middle band — prefer the place's own flavor
    line  = pick(sp.lines.concat(REGION_MID.lines));
    emoji = pick([sp.emoji].concat(trinkets));
  } else {
    line  = pick(REGION_MID.lines.concat(AMBIENT));
    emoji = pick(trinkets.concat(REGION_MID.emojis));
  }
  return { line, emoji, sp };
}

/* ---- hand-authored object hotspots: normalized coords (nx,ny in 0..1 of the WxH
   canvas), r = tap radius in px, e = burst emoji, lines = unique reactions. A tap
   inside a spot wins over the generic region reaction. ---- */
const SCENE_SPOTS = {
  beach: [
    {nx:0.82, ny:0.14, r:55, e:'☀️', lines:['The warm sun ☀️','So bright and cheery!','Sunshine on my face 😊']},
    {nx:0.50, ny:0.50, r:72, e:'🌊', lines:['The waves! 🌊','Splashy splashy 💦','The sea sounds so nice 🐚']},
    {nx:0.24, ny:0.80, r:46, e:'🐚', lines:['A seashell! 🐚','Can I keep it? 🥰','Listen — the ocean! 🐚']},
    {nx:0.70, ny:0.80, r:50, e:'🏰', lines:['A sandcastle! 🏰','Let\'s build one 🥰','Don\'t let the tide get it!']},
  ],
  backyard: [
    {nx:0.20, ny:0.34, r:60, e:'🌳', lines:['Our big tree 🌳','So shady and cool','A bird\'s up there! 🐦']},
    {nx:0.76, ny:0.74, r:50, e:'🌷', lines:['I planted these 🌷','Smell them! 💐','So colorful 🌸']},
    {nx:0.50, ny:0.15, r:55, e:'☀️', lines:['What a lovely day ☀️','Not a cloud… 🌤️','Let\'s stay outside 🥰']},
    {nx:0.50, ny:0.82, r:70, e:'🌿', lines:['Soft grass 🌿','Let\'s lie down here','A little ladybug! 🐞']},
  ],
  river: [
    {nx:0.50, ny:0.55, r:74, e:'💧', lines:['The river flows by 💧','So clear and cool!','A little fish! 🐟']},
    {nx:0.28, ny:0.72, r:48, e:'🪨', lines:['Stepping stones 🪨','Careful, slippery!','Hop hop hop 🐸']},
    {nx:0.80, ny:0.34, r:58, e:'🌲', lines:['Tall trees 🌲','So green and peaceful','Birdsong 🐦']},
    {nx:0.50, ny:0.14, r:52, e:'☁️', lines:['Fluffy clouds ☁️','So blue up there','A dragonfly! 🦋']},
  ],
  bakery: [
    {nx:0.75, ny:0.50, r:54, e:'🔥', lines:['The warm oven 🔥','Fresh bread! 🍞','Mmm, that smell 😋']},
    {nx:0.24, ny:0.44, r:54, e:'🍞', lines:['So many loaves 🍞','Which one? 🥖','Still warm!']},
    {nx:0.50, ny:0.72, r:50, e:'🧁', lines:['Cupcakes! 🧁','Frosting… 😋','One for each of us? 🥰']},
    {nx:0.52, ny:0.18, r:44, e:'✨', lines:['So cozy in here','Warm and sweet 💛','My favorite little shop']},
  ],
  library: [
    {nx:0.20, ny:0.40, r:60, e:'📚', lines:['So many books! 📚','Which story? 📖','I love it here 🥰']},
    {nx:0.75, ny:0.68, r:50, e:'🪑', lines:['A comfy chair 🪑','Read to me? 📖','Cozy corner 💛']},
    {nx:0.58, ny:0.30, r:42, e:'💡', lines:['Warm little lamp 💡','So snug','Perfect for reading']},
    {nx:0.85, ny:0.44, r:42, e:'🪜', lines:['The tall ladder 🪜','Way up high!','Careful up there!']},
  ],
  aquarium: [
    {nx:0.50, ny:0.45, r:74, e:'🐠', lines:['Look at the fish! 🐠','So many colors 🌈','They\'re dancing 🐟']},
    {nx:0.25, ny:0.34, r:46, e:'🪼', lines:['Jellyfish! 🪼','So glowy ✨','Floaty floaty']},
    {nx:0.70, ny:0.72, r:50, e:'⭐', lines:['A starfish! ⭐','On the sand 🐚','So still and pretty']},
    {nx:0.82, ny:0.40, r:44, e:'🦈', lines:['A shark! 🦈','Eek — but cool 😮','Don\'t worry, it\'s glass!']},
  ],
  cherryblossom: [
    {nx:0.34, ny:0.30, r:64, e:'🌸', lines:['So many blossoms! 🌸','Pink everywhere 💗','Falling like snow ❄️']},
    {nx:0.60, ny:0.80, r:58, e:'🌸', lines:['Petals on the ground 🌸','A soft pink carpet','Let\'s gather some 🥰']},
    {nx:0.76, ny:0.70, r:46, e:'🪑', lines:['Sit with me? 🪑','Best seat in spring 🌸','Just us and the petals 💛']},
    {nx:0.58, ny:0.14, r:50, e:'🍃', lines:['A gentle breeze 🍃','Petals in the air ✨','So dreamy up there']},
  ],
  campsite: [
    {nx:0.50, ny:0.68, r:54, e:'🔥', lines:['The campfire 🔥','So warm and crackly','Marshmallows? 🥰']},
    {nx:0.22, ny:0.60, r:54, e:'⛺', lines:['Our little tent ⛺','Cozy inside 💛','Snuggle up later 🥰']},
    {nx:0.55, ny:0.14, r:60, e:'⭐', lines:['So many stars! ⭐','Make a wish ✨','The whole sky is out 🌌']},
    {nx:0.82, ny:0.40, r:48, e:'🌲', lines:['Tall dark trees 🌲','An owl! 🦉','So quiet out here']},
  ],
  greenhouse: [
    {nx:0.30, ny:0.45, r:60, e:'🪴', lines:['So many plants! 🪴','So green and alive 🌿','They love it here 💚']},
    {nx:0.70, ny:0.55, r:54, e:'🌺', lines:['Bright flowers 🌺','Smell this one! 💐','So many colors 🌈']},
    {nx:0.50, ny:0.78, r:46, e:'💧', lines:['Time to water 💧','Drip drip','Helping them grow 🌱']},
    {nx:0.50, ny:0.16, r:54, e:'☀️', lines:['Sun through the glass ☀️','So warm and bright','Like a little jungle 🌴']},
  ],
  artstudio: [
    {nx:0.30, ny:0.50, r:55, e:'🎨', lines:['Your masterpiece! 🎨','Paint me something? 🖌️','So much color 🌈']},
    {nx:0.60, ny:0.70, r:48, e:'🖌️', lines:['So many colors 🖌️','Messy but fun!','Which shade? 🎨']},
    {nx:0.75, ny:0.35, r:55, e:'🖼️', lines:['Look at these! 🖼️','So talented 😍','I love that one 💛']},
    {nx:0.50, ny:0.15, r:48, e:'☀️', lines:['Nice light in here ☀️','Perfect for painting','So bright and airy']},
  ],
  musicroom: [
    {nx:0.35, ny:0.60, r:55, e:'🎹', lines:['Play me a tune? 🎹','Plink plonk 🎶','So pretty 🎵']},
    {nx:0.70, ny:0.55, r:48, e:'🎸', lines:['A guitar! 🎸','Strum strum','Sing along? 🎤']},
    {nx:0.50, ny:0.25, r:55, e:'🎵', lines:['Music everywhere 🎵','La la la 🎶','I feel like dancing 💃']},
    {nx:0.20, ny:0.40, r:45, e:'🎻', lines:['So many instruments','A violin! 🎻','Which one next?']},
  ],
  teahouse: [
    {nx:0.40, ny:0.60, r:50, e:'🍵', lines:['Tea\'s ready! 🍵','Careful, it\'s hot ♨️','Pour me a cup? 🥰']},
    {nx:0.70, ny:0.72, r:48, e:'🧧', lines:['Comfy cushions','Sit with me 🥰','So cozy down here']},
    {nx:0.75, ny:0.35, r:52, e:'🎋', lines:['The little garden 🎋','So serene 🍃','Look outside 🌿']},
    {nx:0.25, ny:0.30, r:45, e:'🏮', lines:['A paper lantern 🏮','Soft glow ✨','So peaceful']},
  ],
  zengarden: [
    {nx:0.40, ny:0.55, r:50, e:'🪨', lines:['A quiet stone 🪨','So balanced','Breathe with me 😌']},
    {nx:0.60, ny:0.75, r:55, e:'🌊', lines:['Perfect ripples 🌊','So neat and calm','Don\'t step on it! 😄']},
    {nx:0.75, ny:0.40, r:45, e:'🌳', lines:['Tiny tree 🌳','So carefully grown','So peaceful 🍃']},
    {nx:0.22, ny:0.35, r:42, e:'🏮', lines:['A stone lantern 🏮','So still','Serenity ✨']},
  ],
  arcade: [
    {nx:0.25, ny:0.45, r:52, e:'🕹️', lines:['The claw machine! 🎮','Win me a prize? 🧸','So close!']},
    {nx:0.55, ny:0.40, r:50, e:'👾', lines:['High score! 👾','Beep boop 🎮','Let\'s play! 🕹️']},
    {nx:0.75, ny:0.65, r:48, e:'🔴', lines:['Pinball! 🔴','Ding ding ding','Tilt! 😆']},
    {nx:0.50, ny:0.78, r:45, e:'🎟️', lines:['So many tickets! 🎟️','What can we get?','Jackpot! 🎉']},
  ],
  planetarium: [
    {nx:0.50, ny:0.20, r:70, e:'🌟', lines:['The whole galaxy! 🌌','So many stars ⭐','Make a wish ✨']},
    {nx:0.30, ny:0.35, r:48, e:'🪐', lines:['Look, Saturn! 🪐','So far away','Space is huge 😮']},
    {nx:0.50, ny:0.65, r:45, e:'🔭', lines:['The star projector 🔭','How does it work?','So clever!']},
    {nx:0.75, ny:0.30, r:45, e:'🌙', lines:['The moon 🌙','So bright tonight','Hello, moon 🥰']},
  ],
  autumnforest: [
    {nx:0.30, ny:0.40, r:58, e:'🍁', lines:['Golden leaves 🍁','So many colors 🍂','Autumn is magic ✨']},
    {nx:0.60, ny:0.78, r:55, e:'🍂', lines:['Jump in the leaves! 🍂','Crunch crunch','So cozy 🧣']},
    {nx:0.22, ny:0.75, r:42, e:'🍄', lines:['A little mushroom 🍄','So cute!','Don\'t eat it! 😄']},
    {nx:0.78, ny:0.50, r:45, e:'🐿️', lines:['A squirrel! 🐿️','Gathering nuts 🌰','So busy 🥰']},
  ],
  lavender: [
    {nx:0.50, ny:0.60, r:65, e:'💜', lines:['So much lavender 💜','Smells heavenly','Purple everywhere 🌸']},
    {nx:0.30, ny:0.45, r:45, e:'🐝', lines:['A busy bee 🐝','Buzz buzz','It loves the flowers 💜']},
    {nx:0.72, ny:0.75, r:46, e:'🧺', lines:['Let\'s gather some 🧺','For a bouquet 💐','So fragrant 🥰']},
    {nx:0.50, ny:0.20, r:55, e:'☀️', lines:['Rolling purple hills 💜','So dreamy','What a view ✨']},
  ],
  rooftop: [
    {nx:0.50, ny:0.30, r:65, e:'🌆', lines:['The city lights 🌆','So sparkly at night ✨','Look how big it is 😮']},
    {nx:0.25, ny:0.20, r:48, e:'✨', lines:['Twinkly lights ✨','So romantic 🥰','Cozy up here']},
    {nx:0.75, ny:0.68, r:45, e:'🪴', lines:['A rooftop garden 🪴','So green up here','Growing strong 🌿']},
    {nx:0.50, ny:0.78, r:48, e:'🪑', lines:['Sit with me 🪑','Best seat in the city','Just us up here 💛']},
  ],
  waterfall: [
    {nx:0.50, ny:0.35, r:60, e:'💧', lines:['The waterfall! 💧','So loud and grand','Sparkling mist ✨']},
    {nx:0.50, ny:0.72, r:55, e:'🌊', lines:['The pool below 🌊','So clear!','Dip our toes? 🦶']},
    {nx:0.25, ny:0.60, r:46, e:'🪨', lines:['Mossy rocks 🪨','Careful, slippery','Watch your step!']},
    {nx:0.72, ny:0.25, r:48, e:'🌈', lines:['A rainbow! 🌈','In the mist ✨','So lucky 🍀']},
  ],
  pottery: [
    {nx:0.35, ny:0.60, r:52, e:'🏺', lines:['The potter\'s wheel 🏺','Round and round','Let\'s make a bowl! 🥰']},
    {nx:0.72, ny:0.40, r:52, e:'🍶', lines:['So many pots 🍶','Which is prettiest?','Handmade with love 💛']},
    {nx:0.20, ny:0.45, r:46, e:'🔥', lines:['The warm kiln 🔥','Baking the clay','So toasty']},
    {nx:0.55, ny:0.78, r:44, e:'🎨', lines:['Squishy clay!','So messy 😄','Look what I made! 🏺']},
  ],
  florist: [
    {nx:0.40, ny:0.50, r:55, e:'💐', lines:['So many bouquets 💐','Which for you? 🌹','Smells amazing 🥰']},
    {nx:0.70, ny:0.68, r:48, e:'🌷', lines:['Fresh cut flowers 🌷','So colorful 🌈','Pick your favorite']},
    {nx:0.72, ny:0.35, r:42, e:'🎀', lines:['Pretty ribbons 🎀','Wrap it up 🎁','A little bow']},
    {nx:0.25, ny:0.30, r:45, e:'☀️', lines:['Sunny window ☀️','Flowers love it','So cheerful']},
  ],
  cafe: [
    {nx:0.35, ny:0.55, r:52, e:'☕', lines:['Coffee! ☕','Smells so good','What\'ll you have? 😊']},
    {nx:0.60, ny:0.65, r:46, e:'🥐', lines:['A croissant! 🥐','Flaky and warm 😋','Share one? 🥰']},
    {nx:0.75, ny:0.72, r:48, e:'🪟', lines:['Our little table 🪟','People-watching','Cozy corner 💛']},
    {nx:0.50, ny:0.25, r:45, e:'📋', lines:['So many choices','Hmm, decisions','I\'ll have what you have 🥰']},
  ],
  catcafe: [
    {nx:0.40, ny:0.60, r:50, e:'🐱', lines:['Kitty! 🐱','So soft…','Purrr 🐈']},
    {nx:0.70, ny:0.45, r:48, e:'🐈', lines:['A cat tower 🐈','One\'s napping up top','So cozy for them 😴']},
    {nx:0.25, ny:0.40, r:45, e:'🐾', lines:['Sunbathing kitty ☀️','So sleepy 😴','Sweet little paws 🐾']},
    {nx:0.60, ny:0.78, r:44, e:'🧶', lines:['A ball of yarn 🧶','Chase it! 🐱','So playful 🥰']},
  ],
  koipond: [
    {nx:0.50, ny:0.60, r:58, e:'🐟', lines:['Orange koi! 🐟','So graceful','They\'re coming over 🥰']},
    {nx:0.30, ny:0.70, r:48, e:'🪷', lines:['Lily pads 🪷','A frog? 🐸','So serene']},
    {nx:0.70, ny:0.40, r:50, e:'⛩️', lines:['The little bridge','Cross with me 🥰','Best view from here']},
    {nx:0.25, ny:0.35, r:42, e:'🏮', lines:['A stone lantern 🏮','So peaceful ✨','Soft glow']},
  ],
  carnival: [
    {nx:0.30, ny:0.30, r:58, e:'🎡', lines:['The ferris wheel! 🎡','Ride with me? 🥰','So high up!']},
    {nx:0.70, ny:0.45, r:50, e:'🎪', lines:['The big top! 🎪','What\'s the show?','So exciting 🎉']},
    {nx:0.25, ny:0.55, r:45, e:'🎈', lines:['Balloons! 🎈','Can I have one?','So colorful 🌈']},
    {nx:0.60, ny:0.75, r:46, e:'🍿', lines:['Popcorn! 🍿','Smells buttery 😋','Share a bag? 🥰']},
  ],
  aurora: [
    {nx:0.50, ny:0.25, r:68, e:'🌌', lines:['The northern lights! 🌌','So many colors ✨','It\'s dancing 💚']},
    {nx:0.25, ny:0.20, r:45, e:'⭐', lines:['A bright star ⭐','Make a wish 🥰','So clear tonight']},
    {nx:0.60, ny:0.80, r:55, e:'❄️', lines:['Fresh snow ❄️','So sparkly','Crunch crunch ⛄']},
    {nx:0.80, ny:0.55, r:46, e:'🌲', lines:['Snowy pines 🌲','So still','Frosted tips ❄️']},
  ],
  tidepools: [
    {nx:0.45, ny:0.60, r:55, e:'🌊', lines:['A little tidepool 🌊','So much life!','Peek inside 👀']},
    {nx:0.70, ny:0.72, r:46, e:'🦀', lines:['A crab! 🦀','Snip snip','Sideways scuttle 😄']},
    {nx:0.28, ny:0.70, r:44, e:'⭐', lines:['A starfish ⭐','So squishy','Right on the rock']},
    {nx:0.60, ny:0.40, r:46, e:'🪸', lines:['Wavy seaweed 🌿','So colorful 🪸','Careful, slippery']},
  ],
  balletstudio: [
    {nx:0.30, ny:0.55, r:50, e:'🩰', lines:['The barre 🩰','Stretch with me','Plié! 💃']},
    {nx:0.60, ny:0.40, r:52, e:'🪞', lines:['So many mirrors 🪞','I see us dancing','Twirl! ✨']},
    {nx:0.75, ny:0.68, r:45, e:'👗', lines:['A pretty tutu 👗','So frilly 🥰','Can I wear it?']},
    {nx:0.22, ny:0.40, r:44, e:'🎹', lines:['A little tune 🎹','Time to dance 🎶','So graceful']},
  ],
  vineyard: [
    {nx:0.35, ny:0.50, r:52, e:'🍇', lines:['Ripe grapes! 🍇','So plump and purple','Taste one? 😋']},
    {nx:0.65, ny:0.60, r:52, e:'🌿', lines:['Rows of vines 🌿','So neat and green','Endless rows']},
    {nx:0.75, ny:0.72, r:45, e:'🛢️', lines:['Wine barrels 🍷','Aged just right','So rustic 💛']},
    {nx:0.50, ny:0.20, r:55, e:'☀️', lines:['Rolling hills 🌄','What a view!','So golden ✨']},
  ],
  recordshop: [
    {nx:0.30, ny:0.55, r:52, e:'💿', lines:['Crates of records 💿','So many albums','Find a gem? 🎶']},
    {nx:0.60, ny:0.50, r:48, e:'🎧', lines:['Drop the needle 🎧','Crackle crackle','Our song? 🥰']},
    {nx:0.75, ny:0.30, r:45, e:'🎸', lines:['Cool posters 🎸','So retro','I love this band']},
    {nx:0.25, ny:0.35, r:44, e:'🔊', lines:['Big speakers 🔊','Turn it up! 🎶','Feel the bass']},
  ],
  snowycabin: [
    {nx:0.35, ny:0.55, r:52, e:'🔥', lines:['The crackling fire 🔥','So warm and cozy','Snuggle up 🥰']},
    {nx:0.70, ny:0.35, r:50, e:'❄️', lines:['Snow outside ❄️','So pretty','Glad we\'re inside 💛']},
    {nx:0.55, ny:0.70, r:44, e:'☕', lines:['Hot cocoa? ☕','Warms my hands','Marshmallows! 🥰']},
    {nx:0.25, ny:0.75, r:46, e:'🧸', lines:['A soft rug 🧸','Let\'s lie down','So comfy 😌']},
  ],
  spa: [
    {nx:0.30, ny:0.45, r:48, e:'🕯️', lines:['Soft candlelight 🕯️','So calming','Breathe out 😌']},
    {nx:0.55, ny:0.60, r:48, e:'💧', lines:['Warm water 💧','So soothing','Ahhh 💆']},
    {nx:0.75, ny:0.70, r:44, e:'🧖', lines:['Fluffy towels 🧖','So fresh','Pampered 🥰']},
    {nx:0.70, ny:0.35, r:42, e:'🪴', lines:['A little plant 🪴','So serene 🌿','Zen vibes']},
  ],
  desert: [
    {nx:0.30, ny:0.55, r:50, e:'🌵', lines:['A tall cactus 🌵','Careful, prickly!','So hardy']},
    {nx:0.75, ny:0.20, r:50, e:'☀️', lines:['Blazing sun ☀️','So hot!','Need some shade 🥵']},
    {nx:0.55, ny:0.75, r:58, e:'🏜️', lines:['Rolling sand 🏜️','So soft and warm','Endless dunes']},
    {nx:0.70, ny:0.68, r:42, e:'🦎', lines:['A little lizard! 🦎','So quick','Sunbathing too']},
  ],
  fireflies: [
    {nx:0.50, ny:0.40, r:60, e:'✨', lines:['Fireflies! ✨','Catch one? 🥰','Like tiny stars 🌟']},
    {nx:0.60, ny:0.78, r:52, e:'🌿', lines:['In the tall grass 🌿','They love it here','So magical']},
    {nx:0.28, ny:0.65, r:46, e:'💧', lines:['A quiet pond 💧','Reflecting the lights','So still']},
    {nx:0.80, ny:0.35, r:45, e:'🌳', lines:['Dark trees 🌳','Twinkling all around','So dreamy 🌙']},
  ],
  lighthouse: [
    {nx:0.50, ny:0.25, r:55, e:'🔦', lines:['The lighthouse beam 🔦','Round and round','Guiding ships home ⛵']},
    {nx:0.60, ny:0.70, r:55, e:'🌊', lines:['The crashing sea 🌊','So wild!','Salty breeze']},
    {nx:0.25, ny:0.72, r:46, e:'🪨', lines:['Craggy rocks 🪨','Careful up here','Watch the waves']},
    {nx:0.75, ny:0.35, r:45, e:'🕊️', lines:['Seagulls! 🕊️','Squawk squawk','So free up there']},
  ],
  chocolateshop: [
    {nx:0.35, ny:0.50, r:50, e:'🍫', lines:['A chocolate fountain! 🍫','So dreamy 😋','Dip something?']},
    {nx:0.60, ny:0.60, r:46, e:'🍬', lines:['Fancy truffles 🍬','Which flavor?','One for you 🥰']},
    {nx:0.75, ny:0.70, r:44, e:'🧁', lines:['So many sweets 🧁','My mouth\'s watering','Hard to choose!']},
    {nx:0.25, ny:0.35, r:44, e:'☕', lines:['Warm cocoa ☕','So rich','Mmm 💛']},
  ],
  tulipfield: [
    {nx:0.50, ny:0.60, r:62, e:'🌷', lines:['So many tulips! 🌷','Every color 🌈','Which is prettiest?']},
    {nx:0.75, ny:0.35, r:50, e:'🌬️', lines:['A windmill 🌬️','Round and round','So Dutch and cute 🥰']},
    {nx:0.28, ny:0.72, r:44, e:'🧺', lines:['Pick a few? 🧺','For our table 💐','So fresh']},
    {nx:0.40, ny:0.18, r:48, e:'☁️', lines:['Big open sky ☁️','So bright','What a day ✨']},
  ],
  savanna: [
    {nx:0.30, ny:0.40, r:55, e:'🌳', lines:['A lone acacia 🌳','So iconic','Shade at last']},
    {nx:0.60, ny:0.62, r:48, e:'🦁', lines:['A lion! 🦁','So majestic','Rawr 😮']},
    {nx:0.78, ny:0.35, r:48, e:'🦒', lines:['A giraffe! 🦒','So tall!','Munching leaves 🌿']},
    {nx:0.40, ny:0.80, r:55, e:'🌾', lines:['Golden grass 🌾','Swaying softly','So wide and wild']},
  ],
  butterflydome: [
    {nx:0.50, ny:0.40, r:58, e:'🦋', lines:['Butterflies! 🦋','So many colors 🌈','One landed on me! 🥰']},
    {nx:0.65, ny:0.68, r:50, e:'🌸', lines:['Nectar flowers 🌸','They love these','So fragrant']},
    {nx:0.25, ny:0.55, r:46, e:'🌿', lines:['Big green leaves 🌿','A chrysalis? 🐛','So lush']},
    {nx:0.55, ny:0.16, r:48, e:'☀️', lines:['Warm and humid ☀️','Perfect for them','So bright 🦋']},
  ],
  marina: [
    {nx:0.40, ny:0.50, r:55, e:'⛵', lines:['So many boats ⛵','Which is ours?','Set sail? 🥰']},
    {nx:0.55, ny:0.72, r:52, e:'🌊', lines:['Gentle waves 🌊','So blue','Sparkling water ✨']},
    {nx:0.75, ny:0.65, r:45, e:'🪝', lines:['The wooden dock','Careful at the edge','Dangle our feet 🦶']},
    {nx:0.70, ny:0.30, r:44, e:'🕊️', lines:['Seagulls! 🕊️','After our snacks 😆','So noisy']},
  ],
  sunflowers: [
    {nx:0.40, ny:0.50, r:60, e:'🌻', lines:['So tall! 🌻','Taller than me!','Facing the sun ☀️']},
    {nx:0.65, ny:0.55, r:45, e:'🐝', lines:['A busy bee 🐝','Buzz buzz','Gathering pollen']},
    {nx:0.60, ny:0.18, r:50, e:'☀️', lines:['Bright blue sky ☀️','So cheerful','What a day 🥰']},
    {nx:0.50, ny:0.80, r:52, e:'🌾', lines:['A little path 🌾','Wander with me','Where does it go?']},
  ],
  balloons: [
    {nx:0.30, ny:0.28, r:58, e:'🎈', lines:['That big red one! 🎈','Up, up we go! 🥰','Ride it with me?']},
    {nx:0.62, ny:0.17, r:50, e:'🎈', lines:['Golden balloon 🎈','Floating so high','I wish we could hop aboard']},
    {nx:0.82, ny:0.34, r:48, e:'🎈', lines:['A little blue one 🎈','Drifting so gently','Bye bye! 👋']},
    {nx:0.50, ny:0.80, r:60, e:'🌼', lines:['Wildflower meadow 🌼','So soft to sit in','Let\'s picnic here 🧺']},
  ],
  sewingstudio: [
    {nx:0.20, ny:0.20, r:54, e:'🧵', lines:['That patchwork quilt! 🧵','So many little colors','Every square a memory 💛']},
    {nx:0.72, ny:0.16, r:48, e:'🧶', lines:['A rack of thread 🧶','Which color today?','So neat and tidy']},
    {nx:0.44, ny:0.54, r:52, e:'🪡', lines:['The sewing machine 🪡','Whirr whirr whirr','I could make you something 🥰']},
    {nx:0.87, ny:0.78, r:48, e:'👗', lines:['A dress form 👗','Almost a person!','What shall we make it wear?']},
  ],
  pumpkinpatch: [
    {nx:0.28, ny:0.55, r:52, e:'🎃', lines:['The scarecrow! 🎃','He\'s guarding the field','Say hi to him 👋']},
    {nx:0.14, ny:0.78, r:60, e:'🎃', lines:['Such a fat pumpkin! 🎃','Perfect for carving','Let\'s take this one home 🥰']},
    {nx:0.42, ny:0.84, r:52, e:'🎃', lines:['So many pumpkins! 🎃','Orange everywhere','Pick your favorite']},
    {nx:0.65, ny:0.90, r:48, e:'🌾', lines:['A cozy hay bale 🌾','Let\'s sit a while','Smells like autumn 🍂']},
  ],
  toyshop: [
    {nx:0.30, ny:0.24, r:54, e:'🧸', lines:['A little teddy bear! 🧸','So soft and huggable','Can we keep him? 🥰']},
    {nx:0.82, ny:0.18, r:48, e:'🪁', lines:['A hanging kite 🪁','Twirling up there','I\'d love to fly it with you']},
    {nx:0.30, ny:0.74, r:54, e:'🐴', lines:['A rocking horse! 🐴','Giddy up!','Rock rock rock 🥰']},
    {nx:0.73, ny:0.72, r:46, e:'🧱', lines:['Stacked blocks 🧱','Don\'t topple them!','Let\'s build higher']},
  ],
  observatory: [
    {nx:0.50, ny:0.25, r:56, e:'🌟', lines:['Stars through the slit ✨','The dome is open!','So many of them 🌟']},
    {nx:0.50, ny:0.20, r:44, e:'🌙', lines:['The moon! 🌙','Look how clear','Make a wish 🥰']},
    {nx:0.66, ny:0.55, r:54, e:'🔭', lines:['The big telescope 🔭','Let me peek!','Show me a planet 🪐']},
    {nx:0.16, ny:0.58, r:48, e:'🖥️', lines:['The control desk 🖥️','So many blinking lights','What does this button do?']},
  ],
  winecellar: [
    {nx:0.24, ny:0.42, r:60, e:'🍷', lines:['The wine rack 🍷','So dusty and old','Which vintage, love?']},
    {nx:0.82, ny:0.72, r:52, e:'🛢️', lines:['Oak barrels 🛢️','They smell wonderful','Aging away down here']},
    {nx:0.50, ny:0.60, r:48, e:'🕯️', lines:['A little candle 🕯️','So cozy and warm','Just us two down here 🥰']},
    {nx:0.50, ny:0.55, r:44, e:'🥂', lines:['Two glasses 🥂','A toast to us 💛','To you, my love']},
  ],
  bamboo: [
    {nx:0.30, ny:0.35, r:60, e:'🎋', lines:['Tall bamboo 🎋','Swaying so gently','Listen to it whisper']},
    {nx:0.60, ny:0.40, r:56, e:'🌿', lines:['So green and calm 🌿','Breathe it in','So peaceful with you 🥰']},
    {nx:0.50, ny:0.85, r:50, e:'🪨', lines:['Stepping stones 🪨','Hop with me!','Careful, careful']},
    {nx:0.85, ny:0.72, r:46, e:'🏮', lines:['A stone lantern 🏮','Glowing softly','Guiding our way 💛']},
  ],
  clockmaker: [
    {nx:0.24, ny:0.24, r:56, e:'🕰️', lines:['So many clocks! 🕰️','All ticking together','Tick tock tick tock']},
    {nx:0.86, ny:0.55, r:54, e:'⏰', lines:['The grandfather clock ⏰','Watch the pendulum','Swing, swing, swing']},
    {nx:0.28, ny:0.58, r:52, e:'⚙️', lines:['Tiny gears ⚙️','So delicate!','How do they fit together?']},
    {nx:0.72, ny:0.16, r:44, e:'🕐', lines:['A little wall clock 🕐','Right on time','What hour is it, love?']},
  ],
  diner: [
    {nx:0.50, ny:0.08, r:50, e:'💗', lines:['The neon sign! 💗','So retro and pink','Let\'s grab a booth 🥰']},
    {nx:0.35, ny:0.44, r:52, e:'🥤', lines:['Milkshakes! 🥤','Two straws, one shake?','Strawberry for me 💗']},
    {nx:0.92, ny:0.52, r:52, e:'🎶', lines:['The jukebox 🎶','Pick a song for us','Let\'s slow dance 💃']},
    {nx:0.35, ny:0.70, r:44, e:'🍒', lines:['A shiny stool 🍒','Spin me around!','Wheee 🥰']},
  ],
  icecreamparlor: [
    {nx:0.18, ny:0.20, r:50, e:'📋', lines:['The scoops menu 📋','So many flavors!','What are you getting? 🥰']},
    {nx:0.55, ny:0.58, r:60, e:'🍨', lines:['The ice cream case! 🍨','Every color of the rainbow','One of each? 😋']},
    {nx:0.50, ny:0.48, r:46, e:'🍒', lines:['A tall sundae 🍒','With a cherry on top!','Share it with me?']},
    {nx:0.16, ny:0.86, r:46, e:'🍦', lines:['A soda-fountain stool 🍦','Spin, spin, spin','Sit close to me 🥰']},
  ],
  sciencelab: [
    {nx:0.11, ny:0.14, r:48, e:'🧪', lines:['The periodic table 🧪','So many little squares','Quiz me, professor 🥰']},
    {nx:0.37, ny:0.48, r:52, e:'⚗️', lines:['Bubbling flasks! ⚗️','Blorp blorp blorp','Is it safe to touch?']},
    {nx:0.58, ny:0.48, r:46, e:'🔥', lines:['The bunsen burner 🔥','A tiny blue flame','Careful, love!']},
    {nx:0.72, ny:0.47, r:48, e:'🧫', lines:['Test tubes in a rack 🧫','Such pretty colors','Which one\'s the magic potion?']},
  ],
  apothecary: [
    {nx:0.50, ny:0.20, r:60, e:'🫙', lines:['Shelves of old jars 🫙','What\'s in all of them?','Smells like herbs and spice']},
    {nx:0.84, ny:0.55, r:48, e:'🌿', lines:['Dried herb bundles 🌿','Hanging to cure','So earthy and calming']},
    {nx:0.30, ny:0.55, r:48, e:'⚖️', lines:['A little brass scale ⚖️','Tipping back and forth','Weigh my heart for you 💛']},
    {nx:0.66, ny:0.55, r:46, e:'🪨', lines:['A mortar and pestle 🪨','Grind grind grind','An old remedy 🥰']},
  ],
  icepond: [
    {nx:0.12, ny:0.54, r:52, e:'🔥', lines:['A cozy bonfire 🔥','Warm your hands, love','So snug against the cold']},
    {nx:0.55, ny:0.76, r:60, e:'⛸️', lines:['The frozen pond! ⛸️','Skate with me! 🥰','Hold my hand, don\'t slip']},
    {nx:0.50, ny:0.07, r:48, e:'💡', lines:['String lights above 💡','Twinkling in the dusk','So magical out here']},
    {nx:0.25, ny:0.50, r:46, e:'🌲', lines:['Snowy pine trees 🌲','Frosted so pretty','A quiet winter evening']},
  ],
  antiqueshop: [
    {nx:0.17, ny:0.14, r:48, e:'🖼️', lines:['Old framed portraits 🖼️','Who were they?','So much history here']},
    {nx:0.16, ny:0.55, r:46, e:'🌍', lines:['A dusty globe 🌍','Spin it — where to?','Let\'s travel everywhere 🥰']},
    {nx:0.52, ny:0.55, r:48, e:'🎵', lines:['A gramophone! 🎵','Does it still play?','A crackly old tune 💛']},
    {nx:0.80, ny:0.55, r:44, e:'🪔', lines:['A little oil lamp 🪔','Glowing so warmly','Cozy golden light']},
  ],
  magicshop: [
    {nx:0.50, ny:0.50, r:52, e:'🔮', lines:['A crystal ball! 🔮','Swirling with color','What do you see for us? 🥰']},
    {nx:0.24, ny:0.52, r:48, e:'🎩', lines:['A top hat 🎩','There\'s a bunny inside!','Abracadabra! 🐰']},
    {nx:0.78, ny:0.17, r:50, e:'🧪', lines:['Shelf of potions 🧪','So bubbly and bright','A love potion, maybe? 💗']},
    {nx:0.14, ny:0.20, r:44, e:'✨', lines:['Crossed magic wands ✨','Make a wish!','Sparkles everywhere 🥰']},
  ],
  orchard: [
    {nx:0.52, ny:0.42, r:60, e:'🍎', lines:['Apples on the tree! 🍎','So round and red','Pick one for me? 🥰']},
    {nx:0.46, ny:0.55, r:48, e:'🪜', lines:['A leaning ladder 🪜','Way up to the top','Hold it steady for me!']},
    {nx:0.16, ny:0.85, r:48, e:'🧺', lines:['A basket of apples 🧺','Fresh from the branch','Let\'s make a pie 🥧']},
    {nx:0.50, ny:0.80, r:46, e:'🍏', lines:['Apples in the grass 🍏','A few fell down','Windfall treasures']},
  ],
  candleshop: [
    {nx:0.30, ny:0.20, r:52, e:'🕯️', lines:['Rows of candles 🕯️','Every warm shade','So cozy in here 🥰']},
    {nx:0.80, ny:0.20, r:48, e:'🪢', lines:['The dipping rack 🪢','Hanging by their wicks','Dip, dip, dip']},
    {nx:0.76, ny:0.58, r:50, e:'♨️', lines:['A steaming wax vat ♨️','Warm and golden','Mind your fingers, love']},
    {nx:0.50, ny:0.88, r:52, e:'🔥', lines:['Big pillar candles 🔥','Flickering softly','I\'ll light one for us 💛']},
  ],
  hotspring: [
    {nx:0.55, ny:0.76, r:62, e:'♨️', lines:['The warm spring ♨️','So soothing and toasty','Soak with me a while 🥰']},
    {nx:0.40, ny:0.50, r:50, e:'💨', lines:['Steam rising up 💨','Curling in the cold air','So dreamy and hazy']},
    {nx:0.85, ny:0.60, r:44, e:'🏮', lines:['A stone lantern 🏮','Glowing on the bank','Such a gentle light']},
    {nx:0.28, ny:0.72, r:44, e:'🍵', lines:['A floating tea tray 🍵','Tea in the hot spring!','How lovely is this 💛']},
  ],
  cinema: [
    {nx:0.50, ny:0.30, r:64, e:'🎬', lines:['The big screen! 🎬','Ooh, it\'s starting','Snuggle in with me 🥰']},
    {nx:0.94, ny:0.40, r:44, e:'💡', lines:['A warm wall sconce 💡','Dim and golden','So cozy and dark in here']},
    {nx:0.35, ny:0.85, r:52, e:'💺', lines:['Comfy velvet seats 💺','Front row for us','Pass the popcorn 🍿']},
    {nx:0.65, ny:0.80, r:50, e:'🍿', lines:['Rows of seats 🍿','All to ourselves','Our own little theater 💛']},
  ],
  bowling: [
    {nx:0.50, ny:0.12, r:50, e:'✨', lines:['The STRIKE sign! ✨','Glowing pink and bright','Bet I\'ll beat you 😏']},
    {nx:0.50, ny:0.68, r:56, e:'🎳', lines:['Here comes the ball! 🎳','Roll roll roll','Knock \'em all down!']},
    {nx:0.90, ny:0.85, r:50, e:'🎳', lines:['The ball return 🎳','So many colors','Pick your lucky one 🥰']},
    {nx:0.11, ny:0.41, r:44, e:'📺', lines:['The score monitor 📺','Am I winning? 😄','Loser buys the nachos!']},
  ],
};
// nearest hotspot hit for the current scene, or null
function spotAt(px, py){
  const arr = SCENE_SPOTS[SCENES[currentScene]];
  if (!arr) return null;
  for (const s of arr){
    const dx = px - s.nx*W, dy = py - s.ny*H;
    if (dx*dx + dy*dy <= s.r*s.r) return s;
  }
  return null;
}
let interactCd = 0;
function tapScene(px, py){
  if (interactCd > 0 || pet.animLock > 0) return;
  interactCd = 1.2;
  // walk toward the tapped spot (feet stay on the floor band)
  pet.tx = Math.max(W*0.14, Math.min(W*0.86, px));
  pet.ty = Math.max(H*0.66, Math.min(H*0.82, py));
  pet.wanderTimer = rand(3,5);
  pet.dir = px < pet.x ? 'left' : 'right';
  // (1) hand-authored object hotspot wins if the tap lands on one
  const spot = spotAt(px, py);
  if (spot){
    say(pick(spot.lines)); burstAt(spot.e, px, py); sfx('tap');
    state.fun = clamp(state.fun + 4); refreshHUD();
    return;
  }
  // (2) otherwise a generic region reaction, flavored by this scene
  const rr = regionReaction(px, py);
  say(rr.line); burstAt(rr.emoji, px, py); sfx('tap');
  const sp = rr.sp;
  if (sp){
    if (sp.love)   state.love   = clamp(state.love   + sp.love);
    if (sp.fun)    state.fun    = clamp(state.fun    + sp.fun);
    if (sp.energy) state.energy = clamp(state.energy + sp.energy);
    if (sp.hunger) state.hunger = clamp(state.hunger + sp.hunger);
  } else {
    state.fun = clamp(state.fun + 3);
  }
  refreshHUD();
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


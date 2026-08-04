/* config: CONFIG + sprite sheet definitions  —  part of the Birthday virtual-pet game (8-3.html). Loaded as a classic script; shares global scope. */

/* ============================================================================
   BIRTHDAY VIRTUAL PET  —  engine
   ----------------------------------------------------------------------------
   Everything you'll want to change lives in CONFIG below.
   The art comes from the sprite sheets defined in the SHEETS block below.
   A placeholder character shows only during the brief moment the art loads.
   ============================================================================ */

const CONFIG = {
  name: "My Love",              // <-- put her name here

  // How fast needs drain (points lost per real-time second). Lower = more relaxed.
  decay: { hunger: 0.35, fun: 0.30, love: 0.25, energy: 0.18 },

  // How much each action gives back (0-100 scale)
  gains: { feed: 34, draw: 30, hug: 40, rest: 45 },

  // Movement
  walkSpeed: 42,                // pixels per second (in the canvas's internal coords)
  idleWanderEvery: [2.5, 6.0],  // she picks a new spot every N seconds (random in range)

  // Persist progress between visits
  save: true,
};

/* ----------------------------------------------------------------------------
   SPRITE SHEETS  (all sheets have transparent backgrounds)
   ----------------------------------------------------------------------------
   Each sheet is a grid of frames laid out cols x rows.
     cols       frames across (the animation frames)
     rows       rows down. For `walk` each row is a facing direction.
     fps        playback speed
     displayH   on-screen height in canvas px (feet pinned to the floor)
     footInset  fraction of empty space below her feet; she is shifted down by
                this much so her feet rest on the floor (raise if she floats)
     rowMap     (walk only) which row holds which facing direction
   To add/replace a sheet later, just edit the entry (src / cols / rows / fps).
   ---------------------------------------------------------------------------- */
const SHEETS = {
  walk: { src:"k-walking3.png", cols:4, rows:4, fps:8, displayH:150, footInset:0.07,
          rowMap:{ down:0, left:1, right:2, up:3 } },
  eat:  { src:"k-eating.png",   cols:4, rows:1, fps:7, displayH:158, footInset:0.11 },
  draw: { src:"k-drawing.png",  cols:4, rows:1, fps:6, displayH:158, footInset:0.00 },
  cry:  { src:"k-crying.png",   cols:4, rows:1, fps:5, displayH:158, footInset:0.11 },
  // Hug sheets: each is 4 quarters. People are pre-positioned inside their quarter
  // so overlaying quarters at the same rect makes them line up into a hug.
  hugs1:{ src:"hugs1.png",      cols:4, rows:1, fps:1, displayH:158, footInset:0.02 },
  hugs2:{ src:"hugs2.png",      cols:4, rows:1, fps:1, displayH:158, footInset:0.02 },
};

/* ----------------------------------------------------------------------------
   HUG GROUP
   ----------------------------------------------------------------------------
   Krystal (hugs1 quarter 0) is the anchor and always faces right. Everyone else
   faces left, so a hugger placed on her right meets her in the middle. To put a
   hugger on her LEFT we mirror them (so they face right, toward her).
   Max group is 6 = Krystal + 5 others. No duplicates.
   ---------------------------------------------------------------------------- */
const HUGGERS = {
  krystal: { sheet:'hugs1', index:0 },   // anchor, always present, not mirrored
  paul:    { sheet:'hugs1', index:1 },
  luna:    { sheet:'hugs1', index:2 },
  wade:    { sheet:'hugs1', index:3 },
  luke:    { sheet:'hugs2', index:0 },
  william: { sheet:'hugs2', index:1 },
};
const HUG_POOL = ['paul','luna','wade','luke','william'];   // the 5 pickable others
const HUG_MAX_OTHERS   = 5;    // Krystal + 5 = 6 total
const HUG_BASE_GAP     = 30;   // px each hugger sits out from Krystal (raise to spread apart)
const HUG_SIDE_STEP    = 30;   // px between people stacked on the same side of Krystal
const HUG_SQUEEZE_AMP  = 0.16; // how much the group compresses at the squeeze peak
const HUG_SQUEEZE_FREQ = 5;    // squeeze pulse speed (radians/sec)
const HUG_DURATION     = 2.4;  // each hug press (re)sets the timer to this many seconds
let hugGroup = [];             // names of the "other" people currently hugging Krystal

function addHugger(){
  if (hugGroup.length >= HUG_MAX_OTHERS) return;
  const avail = HUG_POOL.filter(p => !hugGroup.includes(p));   // no duplicates
  if (avail.length) hugGroup.push(pick(avail));                // pick a random newcomer
}

/* Things she "says" — pulled at random per action/mood. Personalize freely. */
const LINES = {
  feed:  ["Cookies! 🍪", "Mmm, thank you!", "My favorite 😋", "One more?"],
  feedFull: ["I'm pretty full…", "Maybe no more cookies…", "My tummy hurts a little 🤢"],
  throwup: ["🤢 I don't feel so good…", "Too many cookies… 🤮", "I told you I was full! 😣"],
  draw:  ["Let's draw! 🎨", "I love this ✏️", "Look what I made!", "So fun 🌈"],
  drawHungry: ["Drawing makes me hungry…", "I need a snack break 🍪", "My tummy's growling…"],
  hug:   ["Aww 🥰", "I feel safe.", "Hold me longer 💗", "You're the best."],
  happy: ["I'm so happy!", "Best day ever 💛", "I love you!"],
  sad:   ["I'm a little lonely…", "Play with me?", "Hungry…", "Come back 🥺"],
  hungry:["I could go for a cookie…"],
  bored: ["I'm bored 😪"],
  needlove:["Need a hug 🥺"],
  rest:  ["Zzz… 💤", "A little nap 😴", "So cozy…", "Mmm, rested 😌"],
  tired: ["I'm so sleepy… 😴", "Can I nap? 💤", "My eyes are heavy…"],
  sleepyNight:["It's late… 🌙", "Sleepy time 😴", "The stars are out ✨"],
  pet:   ["Hehe 😊", "*nuzzles* 🥰", "That tickles!", "Boop! 😄", "You're sweet 💗", "Aww 😳"],
};

/* A rotating variety of treats for the Cookie button — the icon previews the next one. */
const TREATS = [
  {e:'🍪', n:'Cookie',     l:['Cookies! 🍪','My favorite 😋','One more?']},
  {e:'🧁', n:'Cupcake',    l:['A cupcake! 🧁','So sweet!','Frosting first 😄']},
  {e:'🍰', n:'Cake',       l:['Cake?! 🍰','Yes please!','Best day ever']},
  {e:'🍦', n:'Ice cream',  l:['Ice cream! 🍦','Brain freeze… worth it 🥶','Sprinkles?']},
  {e:'🍫', n:'Chocolate',  l:['Chocolate 🍫','Mmm 😍','You know me well']},
  {e:'🍩', n:'Donut',      l:['A donut! 🍩','Sprinkles! 🎉','Nom nom']},
  {e:'🍓', n:'Berries',    l:['Berry sweet 🍓','So juicy!','Yum']},
  {e:'🥐', n:'Croissant',  l:['Ooh, flaky 🥐','Buttery! 😌','Très bon']},
  {e:'🍑', n:'Peach',      l:['Juicy peach 🍑','Sweet!','Mmm']},
  {e:'🥧', n:'Pie',        l:['Pie! 🥧','Warm and cozy','A little slice?']},
];
let offerTreat = TREATS[0];


const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const data = new Map();
const drawCalls = [];
const messages = [];
let clapLoads = 0;
const scenes = ['beach','backyard','river','cafe','arcade','garden','cinema'];
const renderers = Object.fromEntries(scenes.map(scene => [scene, () => {}]));
const sheets = Object.fromEntries(['paul','luna','wade','luke','william'].map(name => [
  `${name}Sneak`,
  { ready:true, fw:256, fh:256, canvas:{}, cfg:{ footInset:.08, rowMap:{down:0,left:1,right:2,up:3} } },
]));
for (const name of ['paul','luna','wade','luke','william']){
  sheets[`${name}Run`] = { ready:true, fw:256, fh:256, canvas:{}, cfg:{ footInset:.08 } };
}

const context = vm.createContext({
  SCENES:scenes,
  SCENE_RENDERERS:renderers,
  disabledScenes:new Set(),
  currentScene:0,
  sceneTime:0,
  W:360, H:420,
  sheets,
  birthdayClapSheets:Object.fromEntries(['paul','luna','wade','luke','william'].map(name => [
    name, { ready:true, img:{} },
  ])),
  loadBirthdayClappers(){ clapLoads += 1; },
  EXTRA_UPDATERS:[], EXTRA_DRAWERS:[], CHARACTER_TAPS:[],
  localStorage:{
    getItem:key => data.get(key) ?? null,
    setItem:(key, value) => data.set(key, value),
  },
  ctx:{
    save(){}, restore(){}, beginPath(){}, ellipse(){}, fill(){}, translate(){}, rotate(){}, scale(){},
    fillRect(){}, strokeRect(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){},
    drawImage(...args){ drawCalls.push({ args, alpha:this.globalAlpha ?? 1 }); },
  },
  pick:values => values[0],
  rand:(min,max) => (min+max)/2,
  say:text => messages.push(text),
  showToast(){}, burstAt(){}, sfx(){}, refreshHUD(){},
  state:{ fun:50, love:50 },
  clamp:value => Math.max(0, Math.min(100, value)),
  sceneLabel:scene => scene,
  Math, JSON, Map, Set,
});

vm.runInContext(fs.readFileSync('birthday/js/family-hideout.js', 'utf8'), context);

const storageKey = 'bpet_family_hideouts_v1';
const initial = JSON.parse(data.get(storageKey));
assert.equal(Object.keys(initial).length, 5);
assert.equal(new Set(Object.values(initial)).size, 5, 'initial hideouts should be unique');
const revealed = context.getFamilyHideoutLocations();
assert.equal(Object.values(revealed).flat().length, 5, 'debug accessor reveals all hideouts');

context.currentScene = 0;
context.EXTRA_UPDATERS[0](0.1);
context.currentScene = 1;
context.EXTRA_UPDATERS[0](0.1);
const noteStorageKey = 'bpet_family_clue_notes_v1';
let clueState = JSON.parse(data.get(noteStorageKey));
assert.ok(clueState.notes.backyard, 'every second location visit leaves a clue note');
const clue = clueState.notes.backyard;
assert.equal(context.CHARACTER_TAPS[0](clue.x, clue.y), true);
clueState = JSON.parse(data.get(noteStorageKey));
assert.equal(clueState.notes.backyard, undefined, 'clicked notes are collected');

const foundName = Object.keys(initial)[0];
context.currentScene = scenes.indexOf(initial[foundName]);
drawCalls.length = 0;
context.EXTRA_UPDATERS[0](0.1);
context.EXTRA_DRAWERS[0]();
assert.equal(drawCalls.length, 1, 'the family member should render in their assigned scene');

const draw = drawCalls[0].args;
const clickY = draw[6] + 52;
const found = context.CHARACTER_TAPS[0](context.W*.12, clickY)
  || context.CHARACTER_TAPS[0](context.W*.88, clickY);
assert.equal(found, true);

assert.equal(clapLoads, 1);
const immediateRelocation = JSON.parse(data.get(storageKey));
assert.notEqual(immediateRelocation[foundName], initial[foundName], 'clicking relocates immediately');
context.EXTRA_DRAWERS[0]();
assert.equal(drawCalls.length, 2, 'the clapping sprite should replace the walker');
context.EXTRA_UPDATERS[0](2.4);
assert.deepEqual(JSON.parse(data.get(storageKey)), immediateRelocation, 'celebration does not delay relocation');
context.EXTRA_UPDATERS[0](0.7);
assert.deepEqual(JSON.parse(data.get(storageKey)), immediateRelocation, 'exit walk keeps the new hideout');
context.EXTRA_DRAWERS[0]();
assert.equal(drawCalls.at(-1).alpha, 1, 'the exit walker remains fully visible');
context.EXTRA_UPDATERS[0](5);
const relocated = JSON.parse(data.get(storageKey));
assert.deepEqual(relocated, immediateRelocation);
assert.ok(messages.some(message => /You found me/.test(message)));
assert.equal(context.state.fun, 56);
assert.equal(context.state.love, 53);

console.log('family hideout persistence and relocation: ok');

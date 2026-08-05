const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const names=['cloud','lantern','butterfly','bird','npc-adult','npc-child','puppy','cat',
  'table-chair','teacup','bush','potted-plant','gift-box','umbrella','book','cooking-pot'];
names.push('jellyfish','parrot','crab','whale-shark','bunny','kittens','fireflies','reindeer');
names.push('tree','flowering-bush','wildflowers','grass-tuft','park-bench','cafe-table','signpost','fence',
  'streetlamp','mailbox','trash-can','market-awning','doorway','flower-window','pennant-flags','water-ripple');
function pngSize(path){const data=fs.readFileSync(path).subarray(0,24);return[data.readUInt32BE(16),data.readUInt32BE(20)]}
for(const name of names){
  const path=`birthday/sprites/objects/${name}.png`;
  assert.ok(fs.existsSync(path),`missing ${path}`);
  assert.deepEqual(pngSize(path),[1024,256],`${name} must contain four 256px cells`);
}

const registered=[];
const sandbox=vm.createContext({
  SpriteRenderer:{register:(name,config)=>registered.push({name,config}),submit(){}},
  Object,Math,sceneTime:0,globalThis:null,
});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-object-pack-1.js','utf8'),sandbox);
assert.equal(registered.length,40);
assert.ok(registered.every(item=>item.config.cols<=4));
const environment=registered.slice(-16);
assert.ok(environment.every(item=>item.config.defaultSize>0));
assert.ok(environment.every(item=>item.config.phase==='ground'));
assert.ok(environment.every(item=>item.config.anchorX!=null&&item.config.anchorY!=null));
assert.ok(environment.every(item=>item.config.footprint?.width>0&&item.config.footprint?.depth>0));
assert.ok(environment.every(item=>Number.isFinite(item.config.depthOffset)));

const scenes=fs.readFileSync('birthday/js/scenes/scenes-1.js','utf8');
assert.equal((scenes.match(/drawSpriteCloud\(/g)||[]).length,9);

console.log('first sprite object pack and cloud migration: ok');

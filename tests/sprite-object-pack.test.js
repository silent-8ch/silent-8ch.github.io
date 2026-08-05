const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const names=['cloud','lantern','butterfly','bird','npc-adult','npc-child','puppy','cat',
  'table-chair','teacup','bush','potted-plant','gift-box','umbrella','book','cooking-pot'];
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
assert.equal(registered.length,8);
assert.ok(registered.every(item=>item.config.cols<=4));

const scenes=fs.readFileSync('birthday/js/scenes/scenes-1.js','utf8');
assert.equal((scenes.match(/drawSpriteCloud\(/g)||[]).length,7);

console.log('first sprite object pack and cloud migration: ok');

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const files=['meadow-grass','forest-grass','dirt-path','beach-sand','cobblestone','flagstone','wood-floor','terracotta-tile',
  'grass-dirt-edge','grass-curb-edge','sand-shoreline','riverbank-edge','dock-edge','stone-stairs','wood-stairs','path-border'];
function pngSize(path){const data=fs.readFileSync(path).subarray(0,24);return[data.readUInt32BE(16),data.readUInt32BE(20)]}
for(const file of files){
  const path=`birthday/sprites/objects/${file}.png`;
  assert.ok(fs.existsSync(path),`missing ${path}`);
  assert.deepEqual(pngSize(path),[1024,256],`${file} must contain four 256px cells`);
}

const registered=[];
const sandbox=vm.createContext({SpriteRenderer:{register:(name,config)=>registered.push({name,config})},Object,globalThis:null});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-terrain-pack.js','utf8'),sandbox);
assert.equal(registered.length,16);
assert.ok(registered.every(item=>item.config.cols===4));
assert.ok(registered.slice(0,8).every(item=>item.config.renderMode==='tile'&&item.config.tileSize===64&&item.config.phase==='background'));
assert.ok(registered.slice(8).every(item=>item.config.renderMode==='strip'&&item.config.defaultWidth>item.config.defaultHeight));

const combinedNames=new Set();
const combinedSandbox=vm.createContext({
  SpriteRenderer:{register:(name)=>{assert.ok(!combinedNames.has(name),`duplicate sprite registration: ${name}`);combinedNames.add(name)},submit(){}},
  Object,Math,sceneTime:0,globalThis:null,
});
combinedSandbox.globalThis=combinedSandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-object-pack-1.js','utf8'),combinedSandbox);
vm.runInContext(fs.readFileSync('birthday/js/sprite-terrain-pack.js','utf8'),combinedSandbox);
assert.equal(combinedNames.size,56);

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.includes('js/sprite-terrain-pack.js'));
console.log('terrain tile and edge sprite pack: ok');

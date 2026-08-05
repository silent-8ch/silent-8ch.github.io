const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('birthday/js/sprite-texture-pack.js','utf8');
const registered=[];
const sandbox=vm.createContext({SpriteRenderer:{register:(name,config)=>registered.push({name,config})},Object,globalThis:null});
sandbox.globalThis=sandbox;
vm.runInContext(source,sandbox);
assert.equal(registered.length,64);
assert.equal(new Set(registered.map(item=>item.name)).size,64);
assert.ok(registered.every(item=>item.config.cols===1&&item.config.fps===0));
assert.ok(registered.every(item=>item.config.lazy===true&&item.config.renderMode==='texture'));
assert.ok(registered.every(item=>item.config.tileSize===64&&item.config.phase==='background'));

const combinedNames=new Set();
const combinedSandbox=vm.createContext({
  SpriteRenderer:{register:(name)=>{assert.ok(!combinedNames.has(name),`duplicate sprite registration: ${name}`);combinedNames.add(name)},submit(){}},
  Object,Math,sceneTime:0,globalThis:null,
});
combinedSandbox.globalThis=combinedSandbox;
for(const file of ['sprite-object-pack-1.js','sprite-terrain-pack.js','sprite-texture-pack.js']){
  vm.runInContext(fs.readFileSync(`birthday/js/${file}`,'utf8'),combinedSandbox);
}
assert.equal(combinedNames.size,120);

function pngSize(path){const data=fs.readFileSync(path).subarray(0,24);return[data.readUInt32BE(16),data.readUInt32BE(20)]}
for(const item of registered){
  assert.deepEqual(pngSize(`birthday/${item.config.src}`),[256,256],`${item.name} must be one 256px frame`);
}

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.includes('js/sprite-texture-pack.js'));
console.log('static texture pack: 64 lazy single-frame textures ok');

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const registered=[];
const sandbox=vm.createContext({SpriteRenderer:{register:(name,config)=>registered.push({name,config})},Object,Math,globalThis:null});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-architecture-pack.js','utf8'),sandbox);
assert.equal(registered.length,48);
assert.equal(new Set(registered.map(item=>item.name)).size,48);
assert.ok(registered.every(item=>item.config.cols===1&&item.config.fps===0&&item.config.lazy===true));
assert.ok(registered.every(item=>item.config.defaultSize>0&&item.config.anchorY===1));
assert.ok(registered.filter(item=>item.config.collidable).every(item=>item.config.footprint?.width>0&&item.config.footprint?.depth>0));
assert.ok(registered.filter(item=>item.config.category==='foreground').every(item=>item.config.phase==='foreground'));

function pngSize(path){const data=fs.readFileSync(path).subarray(0,26);return[data.readUInt32BE(16),data.readUInt32BE(20),data[25]]}
for(const item of registered){
  assert.deepEqual(pngSize(`birthday/${item.config.src}`),[256,256,6],`${item.name} must be one RGBA 256px frame`);
}

const combinedNames=new Set();
const combinedSandbox=vm.createContext({
  SpriteRenderer:{register:(name)=>{assert.ok(!combinedNames.has(name),`duplicate sprite registration: ${name}`);combinedNames.add(name)},submit(){}},
  Object,Math,sceneTime:0,globalThis:null,
});
combinedSandbox.globalThis=combinedSandbox;
for(const file of ['sprite-object-pack-1.js','sprite-terrain-pack.js','sprite-texture-pack.js','sprite-architecture-pack.js']){
  vm.runInContext(fs.readFileSync(`birthday/js/${file}`,'utf8'),combinedSandbox);
}
assert.equal(combinedNames.size,168);

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.includes('js/sprite-architecture-pack.js'));
console.log('static architecture pack: 48 aligned single-frame modules ok');

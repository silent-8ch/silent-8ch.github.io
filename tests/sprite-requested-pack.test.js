const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const files=['sky-day','sky-night','sky-sunset','star-field','water-surface','shelf-counter','window-rect','window-arch','candle-flame','moon-crescent','mountain-silhouette','rock-boulder','rug-carpet','bed-pillow','fog-mist','boat-hull','curtain-drape'];
function pngSize(path){const data=fs.readFileSync(path).subarray(0,24);return[data.readUInt32BE(16),data.readUInt32BE(20)]}
for(const file of files){
  const path=`birthday/sprites/requested/${file}.png`;
  assert.ok(fs.existsSync(path),`missing ${path}`);
  assert.deepEqual(pngSize(path),[1024,256],`${file} must contain four exact 256px cells`);
}

const registered=[];
const sandbox=vm.createContext({SpriteRenderer:{register:(name,config)=>registered.push({name,config})},Object,globalThis:null});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-requested-pack.js','utf8'),sandbox);
assert.equal(registered.length,17);
assert.ok(registered.every(item=>item.config.cols===4&&item.config.lazy===true));
assert.equal(registered.find(item=>item.name==='fogMist').config.defaultAlpha,.22);
assert.equal(registered.find(item=>item.name==='candleFlame').config.fps,7);

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.includes('js/sprite-requested-pack.js'));
console.log('requested four-frame sprite pack: ok');

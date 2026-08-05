const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeImage {
  constructor(){ FakeImage.count++; this.width=400; this.height=100; }
  set src(value){ this._src=value; if(this.onload)this.onload(); }
}
FakeImage.count=0;

const calls=[],drawArgs=[];
const context={
  globalAlpha:1,
  save(){}, restore(){}, translate(){}, scale(){},
  drawImage(...args){ calls.push('sprite'); drawArgs.push(args); },
};
const tintContexts=[];
function createCanvas(width,height){
  const tintContext={
    width,height,globalAlpha:1,globalCompositeOperation:'source-over',fillStyle:null,draws:0,fills:0,
    clearRect(){},drawImage(){this.draws++},fillRect(){this.fills++},
  };
  tintContexts.push(tintContext);
  return{width,height,getContext:()=>tintContext};
}
const sandbox=vm.createContext({globalThis:null,Image:FakeImage,Map,Object,Error,Math});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-objects.js','utf8'),sandbox);

let scene='garden';
const renderer=sandbox.createSpriteRenderer({context,ImageCtor:FakeImage,getScene:()=>scene,createCanvas,tintCacheLimit:2});
renderer.register('bird',{src:'bird.png',cols:4,rows:1,fps:4});
renderer.register('tree',{src:'tree.png',cols:4,rows:1,fps:2,defaultSize:100,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:40,depth:12},depthOffset:-2});
renderer.register('stairs',{src:'stairs.png',cols:4,rows:1,fps:0,defaultWidth:80,defaultHeight:40,phase:'ground'});
const lazy=renderer.register('wall',{src:'wall.png',cols:1,fps:0,lazy:true,phase:'background'});
assert.equal(FakeImage.count,3,'lazy sprites do not allocate an image while registering');
renderer.submit({sprite:'wall',phase:'background',x:0,y:0});
renderer.drawPhase('background');
assert.equal(FakeImage.count,4,'first draw loads a lazy sprite');
assert.equal(lazy.ready,true);
renderer.beginFrame();
assert.throws(()=>renderer.register('too-many',{src:'bad.png',cols:3,rows:2}),/four-frame/);

const back=renderer.create({sprite:'bird',phase:'background',x:10,y:30,width:20,height:20});
const front=renderer.create({sprite:'bird',phase:'actors',x:10,y:80,width:20,height:20});
const tree=renderer.create({sprite:'tree',x:50,y:60});
assert.equal(tree.phase,'ground','sprite phase is used when an object does not override it');
assert.equal(tree.depth,58,'sprite depth offset is applied automatically');
assert.deepEqual({...renderer.getFootprint(tree)},{left:30,right:70,top:48,bottom:60,width:40,depth:12});
const stairs=renderer.create({sprite:'stairs',x:100,y:100});
calls.length=0; renderer.drawPhase('ground');
assert.equal(calls.length,2,'ground sprites render with configured rectangular dimensions');
assert.deepEqual(drawArgs.at(-1).slice(-2),[80,40]);
calls.length=0;
renderer.submit({phase:'actors',scene:'garden',x:10,y:40,draw:()=>calls.push('near')});
renderer.submit({phase:'actors',scene:'garden',x:10,y:20,draw:()=>calls.push('far')});
renderer.drawPhase('background');
renderer.drawPhase('actors');
assert.deepEqual(calls,['sprite','far','near','sprite'],'phases and actor depth must be deterministic');

renderer.update(.26);
assert.equal(back.frame,1,'registered fps advances persistent sprites');
assert.equal(renderer.hitTest(10,70)?.id,front.id,'hit testing returns the topmost matching object');
const tinted=renderer.create({sprite:'bird',phase:'overlay',x:20,y:20,tint:'#4466aa',tintAmount:.354});
renderer.create({sprite:'bird',phase:'overlay',x:40,y:20,tint:'#4466aa',tintAmount:.35});
assert.equal(tinted.tintAmount,.35,'tint intensity is clamped and quantized for stable cache keys');
calls.length=0; renderer.drawPhase('overlay'); renderer.drawPhase('overlay');
assert.equal(tintContexts.length,1,'matching sprite, frame, tint, and intensity reuse one cached canvas');
assert.equal(tintContexts[0].draws,1);
assert.equal(tintContexts[0].fills,1);
assert.equal(tintContexts[0].globalAlpha,1);
tinted.frame=2; renderer.drawPhase('overlay');
assert.equal(tintContexts.length,2,'a different frame creates a distinct tinted cache entry');
renderer.clearTintCache(); renderer.drawPhase('overlay');
assert.equal(tintContexts.length,4,'clearing the tint cache rebuilds the active frame entries');
scene='beach'; calls.length=0; renderer.drawPhase('actors');
assert.deepEqual(calls,[],'objects stay in their assigned scene');
renderer.clearScene('garden');
assert.equal(renderer.getObject(back.id),undefined);

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.indexOf('js/engine.js') < html.indexOf('js/sprite-objects.js'));
assert.ok(html.indexOf('js/sprite-objects.js') < html.indexOf('js/loop.js'));

console.log('sprite object renderer layering and frame cap: ok');

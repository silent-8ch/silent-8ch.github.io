const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeImage {
  constructor(){ this.width=400; this.height=100; }
  set src(value){ this._src=value; if(this.onload)this.onload(); }
}

const calls=[];
const context={
  globalAlpha:1,
  save(){}, restore(){}, translate(){}, scale(){},
  drawImage(){ calls.push('sprite'); },
};
const sandbox=vm.createContext({globalThis:null,Image:FakeImage,Map,Object,Error,Math});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('birthday/js/sprite-objects.js','utf8'),sandbox);

let scene='garden';
const renderer=sandbox.createSpriteRenderer({context,ImageCtor:FakeImage,getScene:()=>scene});
renderer.register('bird',{src:'bird.png',cols:4,rows:1,fps:4});
renderer.register('tree',{src:'tree.png',cols:4,rows:1,fps:2,defaultSize:100,phase:'ground',anchorX:.5,anchorY:1,footprint:{width:40,depth:12},depthOffset:-2});
assert.throws(()=>renderer.register('too-many',{src:'bad.png',cols:3,rows:2}),/four-frame/);

const back=renderer.create({sprite:'bird',phase:'background',x:10,y:30,width:20,height:20});
const front=renderer.create({sprite:'bird',phase:'actors',x:10,y:80,width:20,height:20});
const tree=renderer.create({sprite:'tree',x:50,y:60});
assert.equal(tree.phase,'ground','sprite phase is used when an object does not override it');
assert.equal(tree.depth,58,'sprite depth offset is applied automatically');
assert.deepEqual({...renderer.getFootprint(tree)},{left:30,right:70,top:48,bottom:60,width:40,depth:12});
renderer.submit({phase:'actors',scene:'garden',x:10,y:40,draw:()=>calls.push('near')});
renderer.submit({phase:'actors',scene:'garden',x:10,y:20,draw:()=>calls.push('far')});
renderer.drawPhase('background');
renderer.drawPhase('actors');
assert.deepEqual(calls,['sprite','far','near','sprite'],'phases and actor depth must be deterministic');

renderer.update(.26);
assert.equal(back.frame,1,'registered fps advances persistent sprites');
assert.equal(renderer.hitTest(10,70)?.id,front.id,'hit testing returns the topmost matching object');
scene='beach'; calls.length=0; renderer.drawPhase('actors');
assert.deepEqual(calls,[],'objects stay in their assigned scene');
renderer.clearScene('garden');
assert.equal(renderer.getObject(back.id),undefined);

const html=fs.readFileSync('birthday/8-3.html','utf8');
assert.ok(html.indexOf('js/engine.js') < html.indexOf('js/sprite-objects.js'));
assert.ok(html.indexOf('js/sprite-objects.js') < html.indexOf('js/loop.js'));

console.log('sprite object renderer layering and frame cap: ok');

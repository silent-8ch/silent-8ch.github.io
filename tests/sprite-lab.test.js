const assert = require('node:assert/strict');
const fs = require('node:fs');

const people = ['krystal','luna','wade','paul','luke','william'];
const expressions = ['laugh','scared','surprised','cheer','sad','embarrassed','think','wave','talk','nod','shake','shrug','point','beckon','search','inspect','sit','give','hug','highfive','look','interact','startled','sleep'];

function pngSize(path){
  const header = fs.readFileSync(path).subarray(0, 24);
  assert.equal(header.toString('ascii', 1, 4), 'PNG');
  return [header.readUInt32BE(16), header.readUInt32BE(20)];
}

for(const person of people){
  for(const animation of expressions){
    const path = `birthday/sprites/expressions/${person}/${animation}.png`;
    assert.ok(fs.existsSync(path), `missing ${path}`);
    assert.deepEqual(pngSize(path), [1024, 256], `${path} must contain four 256px cells`);
  }
  assert.ok(fs.existsSync(`birthday/sprites/walking-all/${person}-walk.png`));
  assert.ok(fs.existsSync(`birthday/sprites/clapping/${person}-clap-processed.png`));
}

const html = fs.readFileSync('birthday/sprite-lab.html', 'utf8');
assert.match(html, /css\/sprite-lab\.css/);
assert.match(html, /js\/sprite-lab\.js/);

console.log('sprite lab manifest: 144 expression sheets and shared cycles ok');

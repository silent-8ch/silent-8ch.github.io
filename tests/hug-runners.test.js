const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({
  W: 360,
  pet: { y: 280 },
  pick: values => values[0],
  Set,
});

vm.runInContext(fs.readFileSync('birthday/js/config.js', 'utf8'), context);

vm.runInContext(`
  for (let i = 0; i < 5; i++) {
    if (!addHugger()) throw new Error('expected a runner');
  }
  globalThis.snapshot = hugRunners.map(runner => ({...runner}));
  globalThis.overflow = addHugger();
`, context);

const runners = JSON.parse(JSON.stringify(context.snapshot));
assert.equal(runners.length, 5);
assert.equal(new Set(runners.map(runner => runner.name)).size, 5);
assert.deepEqual(runners.map(runner => runner.slot), [0, 1, 2, 3, 4]);
assert.deepEqual(runners.map(runner => runner.side), [1, -1, 1, -1, 1]);
assert.deepEqual(runners.map(runner => runner.x), [415, -55, 415, -55, 415]);
assert.equal(context.overflow, false);

console.log('hug runner spawning: ok');

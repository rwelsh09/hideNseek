const { performance } = require('perf_hooks');

const currentDisabledForReset = Array.from({ length: 1000 }, (_, i) => `station_${i}`);
const previousQuestionDisabled = Array.from({ length: 500 }, (_, i) => `station_${i * 2}`);

function before() {
  return currentDisabledForReset.filter(
      (id) => !previousQuestionDisabled.includes(id),
  );
}

function after() {
  const previousSet = new Set(previousQuestionDisabled);
  return currentDisabledForReset.filter(
      (id) => !previousSet.has(id),
  );
}

const N = 10000;

let startBefore = performance.now();
for (let i = 0; i < N; i++) {
  before();
}
let endBefore = performance.now();

let startAfter = performance.now();
for (let i = 0; i < N; i++) {
  after();
}
let endAfter = performance.now();

console.log(`Before: ${(endBefore - startBefore).toFixed(2)}ms`);
console.log(`After: ${(endAfter - startAfter).toFixed(2)}ms`);

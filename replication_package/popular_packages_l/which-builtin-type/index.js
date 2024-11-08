// which-builtin-type.js
function whichBuiltinType(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const type = typeof value;
  if (type === 'boolean') return 'Boolean';
  if (type === 'string') return 'String';
  if (type === 'number') return 'Number';
  if (type === 'bigint') return 'BigInt';
  if (type === 'symbol') return 'Symbol';
  if (type === 'function') {
    // Distinguish generator functions
    return isGeneratorFunction(value) ? 'GeneratorFunction' : 'Function';
  }

  if (Array.isArray(value)) return 'Array';

  if (type === 'object') {
    // Use Object.prototype.toString to get the internal class
    const objectType = Object.prototype.toString.call(value).slice(8, -1);

    // Map some object types to their expected names
    if (objectType === 'Object') return 'Object';
    if (objectType === 'RegExp') return 'RegExp';
    if (objectType === 'Date') return 'Date';
    if (objectType === 'Array') return 'Array';

    // Typed Arrays
    if (objectType.includes('Array')) return objectType;

    // Other native objects
    return objectType;
  }

  return type;
}

function isGeneratorFunction(fn) {
  // Use the function constructor name to check for GeneratorFunction
  const constructorName = fn.constructor.name || '';
  return constructorName === 'GeneratorFunction';
}

module.exports = whichBuiltinType;

// To test
// const assert = require('assert');
// assert.equal(undefined, whichBuiltinType(undefined));
// assert.equal(null, whichBuiltinType(null));
// assert.equal('Boolean', whichBuiltinType(false));
// ... (rest of the test cases)

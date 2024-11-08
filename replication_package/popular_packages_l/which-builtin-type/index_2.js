// which-builtin-type.js
function identifyBuiltinType(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const basicType = typeof value;
  switch (basicType) {
    case 'boolean':
      return 'Boolean';
    case 'string':
      return 'String';
    case 'number':
      return 'Number';
    case 'bigint':
      return 'BigInt';
    case 'symbol':
      return 'Symbol';
    case 'function':
      return isGeneratorFunction(value) ? 'GeneratorFunction' : 'Function';
  }

  if (Array.isArray(value)) return 'Array';

  if (basicType === 'object') {
    const objectType = Object.prototype.toString.call(value).slice(8, -1);
    switch (objectType) {
      case 'Object':
      case 'RegExp':
      case 'Date':
      case 'Array':
        return objectType;
      default:
        if (objectType.includes('Array')) return objectType;
        return objectType;
    }
  }

  return basicType;
}

function isGeneratorFunction(fn) {
  return (fn.constructor.name || '') === 'GeneratorFunction';
}

module.exports = identifyBuiltinType;

// To test
// const assert = require('assert');
// assert.equal(undefined, identifyBuiltinType(undefined));
// assert.equal(null, identifyBuiltinType(null));
// assert.equal('Boolean', identifyBuiltinType(false));
// ... (rest of the test cases)

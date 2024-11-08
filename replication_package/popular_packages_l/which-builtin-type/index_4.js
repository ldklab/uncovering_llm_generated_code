// which-builtin-type.js
function whichBuiltinType(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';

  const type = typeof value;
  switch (type) {
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

  if (type === 'object') {
    const objectType = Object.prototype.toString.call(value).slice(8, -1);
    switch (objectType) {
      case 'Object':
      case 'RegExp':
      case 'Date':
      case 'Array':
        return objectType;
      default:
        return objectType.includes('Array') ? objectType : objectType;
    }
  }

  return type;
}

function isGeneratorFunction(fn) {
  return (fn.constructor.name || '') === 'GeneratorFunction';
}

module.exports = whichBuiltinType;

// To test
// const assert = require('assert');
// assert.strictEqual('undefined', whichBuiltinType(undefined));
// assert.strictEqual('null', whichBuiltinType(null));
// assert.strictEqual('Boolean', whichBuiltinType(false));
// ... (rest of the test cases)

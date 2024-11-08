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
    case 'object':
      if (Array.isArray(value)) return 'Array';

      const objectType = Object.prototype.toString.call(value).slice(8, -1);

      switch (objectType) {
        case 'Object':
        case 'RegExp':
        case 'Date':
        case 'Array':
          return objectType;
        default:
          return objectType.includes('Array') ? objectType : 'Object';
      }
    default:
      return type;
  }
}

function isGeneratorFunction(fn) {
  return (fn.constructor.name || '') === 'GeneratorFunction';
}

module.exports = whichBuiltinType;

// To test
// const assert = require('assert');
// assert.equal('undefined', whichBuiltinType(undefined));
// assert.equal('null', whichBuiltinType(null));
// assert.equal('Boolean', whichBuiltinType(false));
// ... (rest of the test cases)

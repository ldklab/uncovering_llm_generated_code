const crypto = require('crypto');

function hash(value, options = {}) {
  const {
    algorithm = 'sha1',
    excludeValues = false,
    encoding = 'hex',
    unorderedArrays = false,
    unorderedSets = true,
    unorderedObjects = true,
    respectFunctionProperties = true,
    respectFunctionNames = true,
    respectType = true,
    ignoreUnknown = false,
    replacer = (v) => v,
    excludeKeys = () => false,
  } = options;

  // This function replaces all processable values.
  const replacedValue = replacer(value);
  
  // Function to handle objects, arrays, etc.
  function process(value) {
    const type = typeof value;
    
    // Handle special JavaScript types
    if (value === null || type === 'undefined') {
      return `@null`;
    }
    if (type === 'boolean' || type === 'number' || type === 'string') {
      return `@${type}:${value}`;
    }
    if (type === 'function') {
      return handleFunction(value);
    }
    if (Buffer.isBuffer(value)) {
      return `@buffer:${value.toString('hex')}`;
    }
    if (type === 'symbol') {
      return `@symbol:${value.toString()}`;
    }
    
    // Handle objects and arrays
    if (Array.isArray(value)) {
      return handleArray(value);
    }
    
    if (typeof value === 'object') {
      return handleObject(value);
    }

    if (ignoreUnknown) {
      return '';
    }
    
    throw new Error('type not supported: ' + type);
  }
  
  function handleFunction(func) {
    let result = `@function`;
    if (respectFunctionNames) {
      result += `:${func.name}`;
    }
    if (respectFunctionProperties) {
      result += `:${Object.keys(func).toString()}`;
    }
    return result;
  }
  
  function handleArray(arr) {
    const newArr = arr.slice();
    if (unorderedArrays) {
      newArr.sort();
    }
    return `@array:${newArr.map(item => process(item)).join(',')}`;
  }
  
  function handleObject(obj) {
    const keys = Object.keys(obj);
    
    if (unorderedObjects) {
      keys.sort();
    }

    let result = `@object`;

    keys.forEach(key => {
      if (!excludeKeys(key)) {
        const value = obj[key];
        result += `:${key}:${excludeValues ? '' : process(value)}`;
      }
    });

    return result;
  }
  
  // Apply processing based on the replacer and configuration
  let finalResult = process(replacedValue);
  
  // Create the crypto hash
  if (algorithm === 'passthrough') {
    return finalResult;
  }
  const hash = crypto.createHash(algorithm).update(finalResult).digest(encoding);
  return hash;
}

// Helper functions for special cases
hash.sha1 = (value) => hash(value, { algorithm: 'sha1' });
hash.keys = (value) => hash(value, { excludeValues: true });
hash.MD5 = (value) => hash(value, { algorithm: 'md5' });
hash.keysMD5 = (value) => hash(value, { algorithm: 'md5', excludeValues: true });

// Stream support function
hash.writeToStream = (value, options, stream) => {
  const passthrough = hash(value, { ...options, algorithm: 'passthrough' });
  stream.write(passthrough);
};

module.exports = hash;

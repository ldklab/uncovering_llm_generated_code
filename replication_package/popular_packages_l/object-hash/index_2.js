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

  const replacedValue = replacer(value);
  
  function process(value) {
    const type = typeof value;
    
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
    const newArr = unorderedArrays ? arr.slice().sort() : arr;
    return `@array:${newArr.map(item => process(item)).join(',')}`;
  }
  
  function handleObject(obj) {
    const keys = unorderedObjects ? Object.keys(obj).sort() : Object.keys(obj);
    return keys.reduce((acc, key) => {
      if (!excludeKeys(key)) {
        const value = obj[key];
        acc += `:${key}:${excludeValues ? '' : process(value)}`;
      }
      return acc;
    }, '@object');
  }
  
  let finalResult = process(replacedValue);
  
  if (algorithm === 'passthrough') {
    return finalResult;
  }

  return crypto.createHash(algorithm).update(finalResult).digest(encoding);
}

hash.sha1 = (value) => hash(value, { algorithm: 'sha1' });
hash.keys = (value) => hash(value, { excludeValues: true });
hash.MD5 = (value) => hash(value, { algorithm: 'md5' });
hash.keysMD5 = (value) => hash(value, { algorithm: 'md5', excludeValues: true });

hash.writeToStream = (value, options, stream) => {
  const passthrough = hash(value, { ...options, algorithm: 'passthrough' });
  stream.write(passthrough);
};

module.exports = hash;

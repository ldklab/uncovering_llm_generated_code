const crypto = require('crypto');

function hash(value, options = {}) {
  const {
    algorithm = 'sha1', 
    excludeValues = false,
    encoding = 'hex',
    unorderedArrays = false,
    unorderedObjects = true,
    respectFunctionProperties = true,
    respectFunctionNames = true,
    ignoreUnknown = false,
    replacer = (v) => v,
    excludeKeys = () => false,
  } = options;

  const replacedValue = replacer(value);

  function process(value) {
    const type = typeof value;

    if (value === null || type == 'undefined') return '@null';
    if (type === 'boolean' || type === 'number' || type === 'string')
      return `@${type}:${value}`;
    if (type === 'function') return processFunction(value);
    if (Buffer.isBuffer(value)) return `@buffer:${value.toString('hex')}`;
    if (type === 'symbol') return `@symbol:${value.toString()}`;

    if (Array.isArray(value)) return processArray(value);
    if (typeof value === 'object') return processObject(value);

    if (ignoreUnknown) return '';
    
    throw new Error(`type not supported: ${type}`);
  }

  function processFunction(func) {
    let result = '@function';
    if (respectFunctionNames) result += `:${func.name}`;
    if (respectFunctionProperties) result += `:${Object.keys(func)}`;
    return result;
  }

  function processArray(arr) {
    const newArr = [...arr];
    if (unorderedArrays) newArr.sort();
    return `@array:${newArr.map(process).join(',')}`;
  }

  function processObject(obj) {
    const keys = Object.keys(obj);
    if (unorderedObjects) keys.sort();
    return keys
      .filter(key => !excludeKeys(key))
      .reduce((str, key) => str + `:${key}:${excludeValues ? '' : process(obj[key])}`, '@object');
  }

  const finalResult = process(replacedValue);

  if (algorithm === 'passthrough') return finalResult;
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

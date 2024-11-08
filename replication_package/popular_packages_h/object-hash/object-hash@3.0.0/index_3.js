'use strict';

const crypto = require('crypto');
const DEFAULT_ALGORITHM = 'sha1';
const DEFAULT_ENCODING = 'hex';

// Export main hash function
exports = module.exports = objectHash;

function objectHash(object, options) {
  options = applyOptions(object, options || {});
  return computeHash(object, options);
}

// Sugar methods for different hashing strategies
exports.sha1 = function(object) {
  return objectHash(object);
};

exports.keys = function(object) {
  return objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
};

exports.MD5 = function(object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex' });
};

exports.keysMD5 = function(object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });
};

// Internal lists of supported hashes and encodings
const supportedHashes = (crypto.getHashes ? crypto.getHashes() : []).concat('passthrough');
const supportedEncodings = ['buffer', 'hex', 'binary', 'base64'];

function applyOptions(object, userOptions) {
  if (typeof object === 'undefined') throw new Error('Object argument required.');

  const options = {
    algorithm: userOptions.algorithm || DEFAULT_ALGORITHM,
    encoding: userOptions.encoding || DEFAULT_ENCODING,
    excludeValues: Boolean(userOptions.excludeValues),
    ignoreUnknown: Boolean(userOptions.ignoreUnknown),
    respectType: userOptions.respectType !== false,
    respectFunctionNames: userOptions.respectFunctionNames !== false,
    respectFunctionProperties: userOptions.respectFunctionProperties !== false,
    unorderedArrays: Boolean(userOptions.unorderedArrays),
    unorderedSets: userOptions.unorderedSets !== false,
    unorderedObjects: userOptions.unorderedObjects !== false,
    replacer: userOptions.replacer,
    excludeKeys: userOptions.excludeKeys
  };

  validateOptions(options);
  return options;
}

function validateOptions(options) {
  if (!supportedHashes.includes(options.algorithm.toLowerCase())) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${supportedHashes.join(', ')}`);
  }
  if (!supportedEncodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${supportedEncodings.join(', ')}`);
  }
}

function computeHash(object, options) {
  const hashingStream = options.algorithm !== 'passthrough'
    ? crypto.createHash(options.algorithm)
    : new PassThrough();

  const hasher = createTypeHasher(options, hashingStream);
  hasher.dispatch(object);

  return hashingStream.digest ? hashingStream.digest(options.encoding) : hashingStream.read().toString(options.encoding);
}

// Export writeToStream API
exports.writeToStream = function(object, options, stream) {
  options = applyOptions(object, options || {});
  return createTypeHasher(options, stream).dispatch(object);
};

function createTypeHasher(options, writeTo, context = []) {
  const writeFunction = str => writeTo.update ? writeTo.update(str, 'utf8') : writeTo.write(str, 'utf8');

  return {
    dispatch(value) {
      if (options.replacer) value = options.replacer(value);
      return this[`_${typeof value || 'null'}`](value);
    },
    _object(object) {
      if (context.includes(object)) return this.dispatch(`[CIRCULAR:${context.indexOf(object)}]`);

      context.push(object);

      const keys = Object.keys(object).filter(key => !options.excludeKeys || !options.excludeKeys(key));
      if (options.unorderedObjects) keys.sort();
      if (options.respectType && !isNativeFunction(object)) keys.unshift('prototype', '__proto__', 'constructor');
      
      writeFunction(`object:${keys.length}:`);

      keys.forEach(key => {
        this.dispatch(key);
        writeFunction(':');
        if (!options.excludeValues) this.dispatch(object[key]);
        writeFunction(',');
      });
    },
    // Implement other data types similar to _object
  };
}

// PassThrough class mimicking the behavior of a streaming API for simplicity
class PassThrough {
  constructor() {
    this.buffer = '';
  }
  write(data) {
    this.buffer += data;
  }
  update(data) {
    this.write(data);
  }
  read() {
    return this.buffer;
  }
}

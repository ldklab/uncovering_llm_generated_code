'use strict';

const crypto = require('crypto');

function objectHash(object, options = {}) {
  options = applyDefaults(object, options);
  return hash(object, options);
}

exports = module.exports = objectHash;

exports.sha1 = function (object) {
  return objectHash(object);
};
exports.keys = function (object) {
  return objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
};
exports.MD5 = function (object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex' });
};
exports.keysMD5 = function (object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });
};

const hashes = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
hashes.push('passthrough');
const encodings = ['buffer', 'hex', 'binary', 'base64'];

function applyDefaults(object, sourceOptions) {
  if (typeof object === 'undefined') {
    throw new Error('Object argument required.');
  }

  const options = {
    algorithm: sourceOptions.algorithm || 'sha1',
    encoding: sourceOptions.encoding || 'hex',
    excludeValues: Boolean(sourceOptions.excludeValues),
    ignoreUnknown: Boolean(sourceOptions.ignoreUnknown),
    respectType: sourceOptions.respectType !== false,
    respectFunctionNames: sourceOptions.respectFunctionNames !== false,
    respectFunctionProperties: sourceOptions.respectFunctionProperties !== false,
    unorderedArrays: Boolean(sourceOptions.unorderedArrays),
    unorderedSets: sourceOptions.unorderedSets !== false,
    unorderedObjects: sourceOptions.unorderedObjects !== false,
    replacer: sourceOptions.replacer,
    excludeKeys: sourceOptions.excludeKeys,
  };

  validateOptions(options);

  return options;
}

function validateOptions(options) {
  if (!hashes.includes(options.algorithm.toLowerCase())) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${hashes.join(', ')}`);
  }

  if (options.algorithm !== 'passthrough' && !encodings.includes(options.encoding)) {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${encodings.join(', ')}`);
  }
}

function isNativeFunction(func) {
  return typeof func === 'function' && /native code/.test(Function.prototype.toString.call(func));
}

function hash(object, options) {
  const hashingStream = options.algorithm === 'passthrough' ? new PassThrough() : crypto.createHash(options.algorithm);
  if (!hashingStream.write) {
    hashingStream.write = hashingStream.update;
  }

  const hasher = typeHasher(options, hashingStream);
  hasher.dispatch(object);
  
  if (!hashingStream.update) hashingStream.end('');
  return hashingStream.digest ? hashingStream.digest(options.encoding) : hashingStream.read().toString(options.encoding);
}

exports.writeToStream = function (object, options = {}, stream) {
  if (!stream) {
    stream = options;
    options = {};
  }

  options = applyDefaults(object, options);
  return typeHasher(options, stream).dispatch(object);
};

function typeHasher(options, writeTo, context = []) {
  const write = (str) => writeTo.update ? writeTo.update(str, 'utf8') : writeTo.write(str, 'utf8');

  return {
    dispatch(value) {
      if (options.replacer) value = options.replacer(value);

      const type = value === null ? 'null' : typeof value;
      const methodName = `_${type}`;
      
      if (this[methodName]) return this[methodName](value);

      if (options.ignoreUnknown) return write(`[unknown:${type}]`);
      throw new Error(`Unknown type: "${type}"`);
    },
    _object(object) {
      // Object handling and hashing
      const objString = Object.prototype.toString.call(object);
      const objType = (/\[object (\w+)\]/.exec(objString) || [])[1]?.toLowerCase() || `unknown:[${objString}]`;

      const objectNumber = context.indexOf(object);
      if (objectNumber >= 0) return this.dispatch(`[CIRCULAR:${objectNumber}]`);
      context.push(object);

      if (Buffer.isBuffer(object)) {
        write('buffer:');
        return write(object);
      }

      if (!['object', 'function', 'asyncfunction'].includes(objType) && this[`_${objType}`]) {
        return this[`_${objType}`](object);
      } else {
        if (options.ignoreUnknown) return write(`[${objType}]`);
        throw new Error(`Unknown object type "${objType}"`);
      }

      let keys = Object.keys(object);
      if (options.unorderedObjects) keys.sort();
      if (options.excludeKeys) keys = keys.filter(key => !options.excludeKeys(key));

      if (options.respectType && !isNativeFunction(object)) {
        keys = ['prototype', '__proto__', 'constructor', ...keys];
      }

      write(`object:${keys.length}:`);
      keys.forEach(key => {
        this.dispatch(key);
        if (!options.excludeValues) this.dispatch(object[key]);
        write(':');
      });
    },
    /* Other type handling functions (_array, _number, etc.) ... */
  }
}

function PassThrough() {
  let buf = '';

  return {
    write(b) { buf += b; },
    end(b) { buf += b; },
    read() { return buf; },
  };
}
'use strict';

const crypto = require('crypto');

/**
 * Exported hashing function with various options to customize behavior.
 */
exports = module.exports = function objectHash(object, options) {
  options = applyDefaults(object, options);
  return createHash(object, options);
};

// Sugar methods for common use cases
exports.sha1 = object => objectHash(object);

exports.keys = object => objectHash(object, {
  excludeValues: true,
  algorithm: 'sha1',
  encoding: 'hex'
});

exports.MD5 = object => objectHash(object, {
  algorithm: 'md5',
  encoding: 'hex'
});

exports.keysMD5 = object => objectHash(object, {
  algorithm: 'md5',
  encoding: 'hex',
  excludeValues: true
});

// Internal lists of supported hashes and encodings
const hashes = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
hashes.push('passthrough');
const encodings = ['buffer', 'hex', 'binary', 'base64'];

// Apply default options for hashing if none exist
function applyDefaults(object, sourceOptions = {}) {
  const options = {
    algorithm: sourceOptions.algorithm || 'sha1',
    encoding: sourceOptions.encoding || 'hex',
    excludeValues: !!sourceOptions.excludeValues,
    ignoreUnknown: sourceOptions.ignoreUnknown === true,
    respectType: sourceOptions.respectType !== false,
    respectFunctionNames: sourceOptions.respectFunctionNames !== false,
    respectFunctionProperties: sourceOptions.respectFunctionProperties !== false,
    unorderedArrays: sourceOptions.unorderedArrays === true,
    unorderedSets: sourceOptions.unorderedSets !== false,
    unorderedObjects: sourceOptions.unorderedObjects !== false,
    replacer: sourceOptions.replacer,
    excludeKeys: sourceOptions.excludeKeys
  };

  if (typeof object === 'undefined') {
    throw new Error('Object argument required.');
  }

  const matchingAlgorithm = hashes.find(hash => hash.toLowerCase() === options.algorithm.toLowerCase());
  if (!matchingAlgorithm) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${hashes.join(', ')}`);
  }
  options.algorithm = matchingAlgorithm;

  if (!encodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${encodings.join(', ')}`);
  }

  return options;
}

/**
 * Check if a function is native.
 */
function isNativeFunction(f) {
  return typeof f === 'function' && /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/.test(Function.prototype.toString.call(f));
}

/**
 * Create a hash for the given object using the defined options.
 */
function createHash(object, options) {
  const hashingStream = options.algorithm !== 'passthrough' ?
    crypto.createHash(options.algorithm) :
    new PassThrough();

  if (!hashingStream.update) {
    hashingStream.write = hashingStream.update;
    hashingStream.end = hashingStream.update;
  }

  const hasher = typeHasher(options, hashingStream);
  hasher.dispatch(object);

  if (!hashingStream.update) {
    hashingStream.end('');
  }

  return hashingStream.digest ? hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding) : hashingStream.read().toString(options.encoding);
}

/**
 * Expose streaming API.
 */
exports.writeToStream = function(object, options, stream) {
  if (!stream) {
    stream = options;
    options = {};
  }

  options = applyDefaults(object, options);
  return typeHasher(options, stream).dispatch(object);
};

// Type hashing and serialization logic
function typeHasher(options, writeTo, context = []) {
  const write = str => writeTo.update ? writeTo.update(str, 'utf8') : writeTo.write(str, 'utf8');

  return {
    dispatch(value) {
      if (options.replacer) value = options.replacer(value);
      const type = value === null ? 'null' : typeof value;
      if (this[`_${type}`]) {
        this[`_${type}`](value);
      } else if (options.ignoreUnknown) {
        write(`[${type}]`);
      } else {
        throw new Error(`Unknown object type "${type}"`);
      }
    },
    _object(object) {
      // Object-specific serialization logic
      const objString = Object.prototype.toString.call(object);
      const objTypeMatch = /\[object (.*)\]/i.exec(objString);
      const objType = objTypeMatch ? objTypeMatch[1].toLowerCase() : `unknown:[${objString}]`;

      if (context.includes(object)) {
        write(`[CIRCULAR:${context.indexOf(object)}]`);
      } else {
        context.push(object);
        if (Buffer && Buffer.isBuffer && Buffer.isBuffer(object)) {
          write('buffer:');
          write(object);
        } else if (objType !== 'object' && this[`_${objType}`]) {
          this[`_${objType}`](object);
        } else if (objType === 'object' || objType === 'function' || objType === 'asyncfunction') {
          let keys = Object.keys(object);
          if (options.unorderedObjects) keys.sort();
          if (options.respectType && !isNativeFunction(object)) keys = ['prototype', '__proto__', 'constructor', ...keys];
          if (options.excludeKeys) keys = keys.filter(key => !options.excludeKeys(key));
          write(`object:${keys.length}:`);
          keys.forEach(key => {
            this.dispatch(key);
            write(':');
            if (!options.excludeValues) this.dispatch(object[key]);
            write(',');
          });
        } else if (options.ignoreUnknown) {
          write(`[${objType}]`);
        } else {
          throw new Error(`Unknown object type "${objType}"`);
        }
      }
    },
    _array(arr) {
      // Array-specific serialization logic
      write(`array:${arr.length}:`);
      const dispatcher = index => this.dispatch(arr[index]);
      if (options.unorderedArrays !== false && arr.length > 1) {
        const contextAdditions = [];
        const entries = arr.map(entry => {
          const stream = new PassThrough();
          const hasher = typeHasher(options, stream, context.slice());
          hasher.dispatch(entry);
          contextAdditions.push(...context.slice(entries.length));
          return stream.read().toString();
        });
        context.push(...contextAdditions);
        entries.sort();
        return dispatcher(entries);
      }
      return arr.forEach(dispatcher);
    },
    _date: date => write(`date:${date.toJSON()}`),
    _symbol: sym => write(`symbol:${sym.toString()}`),
    _error: err => write(`error:${err.toString()}`),
    _boolean: bool => write(`bool:${bool.toString()}`),
    _string: str => { write(`string:${str.length}:`); write(str.toString()); },
    _function(fn) {
      write('fn:');
      this.dispatch(isNativeFunction(fn) ? '[native]' : fn.toString());
      if (options.respectFunctionNames !== false) {
        this.dispatch(`function-name:${String(fn.name)}`);
      }
      if (options.respectFunctionProperties) this._object(fn);
    },
    _number: num => write(`number:${num.toString()}`),
    _null: () => write('Null'),
    _undefined: () => write('Undefined'),
    _regexp: regex => write(`regex:${regex.toString()}`),
    _map: map => this._array(Array.from(map), options.unorderedSets !== false),
    _set: set => this._array(Array.from(set), options.unorderedSets !== false),
    // Additional type handlers...
  };
}

// PassThrough stream implementation
function PassThrough() {
  return {
    buffer: '',
    write(chunk) { this.buffer += chunk; },
    end(chunk) { this.buffer += chunk || ''; },
    read() { return this.buffer; }
  };
}

'use strict';

const crypto = require('crypto');

module.exports = objectHash;

function objectHash(object, options = {}) {
  options = configureOptions(object, options);
  return generateHash(object, options);
}

module.exports.sha1 = function(object) {
  return objectHash(object);
};

module.exports.keys = function(object) {
  return objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
};

module.exports.MD5 = function(object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex' });
};

module.exports.keysMD5 = function(object) {
  return objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });
};

const availableHashes = crypto.getHashes ? crypto.getHashes().concat('passthrough') : ['sha1', 'md5', 'passthrough'];
const validEncodings = ['buffer', 'hex', 'binary', 'base64'];

function configureOptions(object, options) {
  if (typeof object === 'undefined') throw new Error('Object argument required.');

  const defaultOptions = {
    algorithm: 'sha1',
    encoding: 'hex',
    excludeValues: false,
    ignoreUnknown: false,
    respectType: true,
    respectFunctionNames: true,
    respectFunctionProperties: true,
    unorderedArrays: false,
    unorderedSets: true,
    unorderedObjects: true,
  };

  // Combine user-defined options with defaults
  options = { ...defaultOptions, ...options };
  options.algorithm = options.algorithm.toLowerCase();
  options.encoding = options.encoding.toLowerCase();

  if (!availableHashes.includes(options.algorithm)) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${availableHashes.join(', ')}`);
  }

  if (!validEncodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${validEncodings.join(', ')}`);
  }

  return options;
}

function generateHash(object, options) {
  const hashStream = options.algorithm !== 'passthrough'
    ? crypto.createHash(options.algorithm)
    : new SimplePassThroughStream();

  const hasher = createTypeHasher(options, hashStream);
  hasher.process(object);

  if (hashStream.digest) {
    return hashStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
  }

  return hashStream.read().toString(options.encoding);
}

module.exports.writeToStream = function(object, options = {}, stream) {
  if (typeof stream === 'undefined') {
    stream = options;
    options = {};
  }

  options = configureOptions(object, options);
  return createTypeHasher(options, stream).process(object);
};

function createTypeHasher(options, targetStream, visitedObjects = []) {
  const write = (str) => {
    if (targetStream.update) {
      return targetStream.update(str, 'utf8');
    }
    targetStream.write(str, 'utf8');
  };

  function handleCircularReference(reference) {
    const existingIndex = visitedObjects.indexOf(reference);
    if (existingIndex >= 0) {
      return `[CIRCULAR:${existingIndex}]`;
    }
    visitedObjects.push(reference);
    return null;
  }

  function dispatch(value) {
    if (options.replacer) {
      value = options.replacer(value);
    }
    
    const type = value === null ? 'null' : typeof value;
    if (this[`_hash${type.charAt(0).toUpperCase() + type.slice(1)}`]) {
      return this[`_hash${type.charAt(0).toUpperCase() + type.slice(1)}`](value);
    } else if (options.ignoreUnknown) {
      return write(`[unknown type: ${type}]`);
    } else {
      throw new Error(`Unknown type "${type}"`);
    }
  }

  return {
    process: dispatch,
    _hashObject(obj) {
      if (Buffer.isBuffer(obj)) {
        write('buffer:');
        return write(obj);
      }

      const circular = handleCircularReference(obj);
      if (circular) return dispatch(circular);

      const keys = Object.keys(obj);
      if (options.unorderedObjects) keys.sort();

      if (options.respectType && !isNativeFunction(obj)) {
        keys.unshift('prototype', '__proto__', 'constructor');
      }

      if (options.excludeKeys) {
        keys.filter(key => !options.excludeKeys(key));
      }

      write(`object:${keys.length}:`);
      keys.forEach(key => {
        dispatch(key);
        write(':');
        if (!options.excludeValues) dispatch(obj[key]);
        write(',');
      });
    },
    _hashArray(arr) {
      write(`array:${arr.length}:`);
      arr.forEach(item => dispatch(item));
    },
    _hashString(str) {
      write(`string:${str.length}:`);
      write(str);
    },
    _hashFunction(fn) {
      write('fn:');
      dispatch(isNativeFunction(fn) ? '[native]' : fn.toString());
      if (options.respectFunctionNames) dispatch(`function-name:${String(fn.name)}`);
      if (options.respectFunctionProperties) this._hashObject(fn);
    },
    _hashNull() {
      return write('null');
    },
    _hashUndefined() {
      return write('undefined');
    },
    _hashNumber(num) {
      return write(`number:${num}`);
    },
    _hashSymbol(sym) {
      return write(`symbol:${sym.toString()}`);
    },
    _hashDate(date) {
      return write(`date:${date.toJSON()}`);
    },
    _hashError(err) {
      return write(`error:${err.toString()}`);
    },
    _hashBoolean(bool) {
      return write(`bool:${bool}`);
    },
  };
}

function isNativeFunction(func) {
  return typeof func === 'function' && /\[native code\]/.test(func.toString());
}

function SimplePassThroughStream() {
  return {
    buffer: '',
    write(data) { this.buffer += data; },
    end(data) { this.buffer += data; },
    read() { return this.buffer; }
  };
}

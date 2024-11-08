'use strict';

const crypto = require('crypto');

// Primary export of object-hash module
exports = module.exports = function objectHash(object, options = {}) {
  options = setDefaultOptions(object, options);
  return createHash(object, options);
};

// Hashing with preconfigured options
exports.sha1 = (object) => objectHash(object);
exports.keys = (object) => objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
exports.MD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex' });
exports.keysMD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });

// Supported hashing algorithms and encodings
const supportedHashes = crypto.getHashes().slice().concat('passthrough');
const supportedEncodings = ['buffer', 'hex', 'binary', 'base64'];

function setDefaultOptions(object, sourceOptions) {
  if (typeof object === 'undefined') throw new Error('Object argument required.');
  
  const options = { ...sourceOptions };
  options.algorithm = (sourceOptions.algorithm || 'sha1').toLowerCase();
  options.encoding = (sourceOptions.encoding || 'hex').toLowerCase();
  options.excludeValues = !!sourceOptions.excludeValues;
  options.ignoreUnknown = !!sourceOptions.ignoreUnknown;
  options.respectType = sourceOptions.respectType !== false;

  if (!supportedHashes.includes(options.algorithm)) throw new Error(`Algorithm "${options.algorithm}" not supported.`);
  if (!supportedEncodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported.`);
  }

  return options;
}

function isNativeFunction(func) {
  return typeof func === 'function' && /^function\s+\w*\s*\(\)\s*\{\s+\[native code\]\s+\}$/.test(Function.prototype.toString.call(func));
}

function createHash(object, options) {
  const hashingStream = options.algorithm !== 'passthrough' ? crypto.createHash(options.algorithm) : new PassThrough();

  if (typeof hashingStream.write === 'undefined') {
    hashingStream.write = hashingStream.update;
    hashingStream.end = hashingStream.update;
  }

  const hasher = typeHasher(options, hashingStream);
  hasher.dispatch(object);
  
  return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
}

exports.writeToStream = function (object, options = {}, stream) {
  if (typeof stream === 'undefined') {
    stream = options;
    options = {};
  }
  options = setDefaultOptions(object, options);
  return typeHasher(options, stream).dispatch(object);
};

function typeHasher(options, writer, context = []) {
  const write = (str) => {
    if (writer.update) {
      return writer.update(str, 'utf8');
    } else {
      return writer.write(str, 'utf8');
    }
  };

  function dispatch(value) {
    if (options.replacer) value = options.replacer(value);

    const type = value === null ? 'null' : typeof value;
    return this[`_${type}`](value);
  }

  function writeObject(obj) {
    const protoNames = ['prototype', '__proto__', 'constructor'];
    const pattern = /\[object (.*)\]/i;
    let objType = pattern.exec(Object.prototype.toString.call(obj));
    objType = objType ? objType[1].toLowerCase() : `unknown:[${Object.prototype.toString.call(obj)}]`;

    if (context.includes(obj)) return dispatch(`[CIRCULAR:${context.indexOf(obj)}]`);
    context.push(obj);

    if (Buffer.isBuffer(obj)) {
      write('buffer:');
      return write(obj);
    }

    if (['object', 'function', 'asyncfunction'].includes(objType)) {
      let keys = Object.keys(obj);
      if (options.unorderedObjects) keys = keys.sort();
      if (options.respectType && !isNativeFunction(obj)) keys = [...protoNames, ...keys];
      if (options.excludeKeys) keys = keys.filter((key) => !options.excludeKeys(key));

      write(`object:${keys.length}:`);
      keys.forEach((key) => {
        dispatch(key);
        write(':');
        if (!options.excludeValues) dispatch(obj[key]);
        write(',');
      });
    } else if (this[`_${objType}`]) {
      this[`_${objType}`](obj);
    } else if (options.ignoreUnknown) {
      write(`[${objType}]`);
    } else {
      throw new Error(`Unknown object type "${objType}"`);
    }
  }

  return {
    dispatch,
    _object: writeObject,
    _array(arr, unordered = options.unorderedArrays !== false) {
      write(`array:${arr.length}:`);
      if (!unordered || arr.length <= 1) {
        arr.forEach((entry) => dispatch(entry));
      } else {
        let contextAdditions = [];
        const entries = arr.map((entry) => {
          const strm = new PassThrough();
          const localCtx = context.slice();
          typeHasher(options, strm, localCtx).dispatch(entry);
          contextAdditions = contextAdditions.concat(localCtx.slice(context.length));
          return strm.read().toString();
        });
        context = context.concat(contextAdditions);
        entries.sort();
        this._array(entries, false);
      }
    },
    _date: (date) => write(`date:${date.toJSON()}`),
    _symbol: (sym) => write(`symbol:${sym.toString()}`),
    _error: (err) => write(`error:${err.toString()}`),
    _boolean: (bool) => write(`bool:${bool.toString()}`),
    _string: (string) => {
      write(`string:${string.length}:`);
      write(string.toString());
    },
    _function: (fn) => {
      write('fn:');
      dispatch(isNativeFunction(fn) ? '[native]' : fn.toString());
      if (options.respectFunctionNames !== false) dispatch(`function-name:${String(fn.name)}`);
      if (options.respectFunctionProperties) writeObject(fn);
    },
    _number: (number) => write(`number:${number.toString()}`),
    _xml: (xml) => write(`xml:${xml.toString()}`),
    _null: () => write('Null'),
    _undefined: () => write('Undefined'),
    _regexp: (regex) => write(`regex:${regex.toString()}`),
    _map(map) {
      write('map:');
      this._array(Array.from(map), false);
    },
    _set(set) {
      write('set:');
      this._array(Array.from(set), false);
    },
    _bigint: (number) => write(`bigint:${number.toString()}`),
    /* Fill in methods for other data types as needed... */
  };
}

function PassThrough() {
  return {
    buf: '',
    write(b) { this.buf += b; },
    end(b) { this.buf += b; },
    read() { return this.buf; }
  };
}

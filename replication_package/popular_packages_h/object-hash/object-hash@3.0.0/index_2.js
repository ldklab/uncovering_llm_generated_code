'use strict';

const crypto = require('crypto');

exports = module.exports = objectHash;

function objectHash(object, options) {
  options = applyOptionsDefaults(object, options);
  return computeHash(object, options);
}

exports.sha1 = (object) => objectHash(object);
exports.keys = (object) => objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
exports.MD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex' });
exports.keysMD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });

const supportedAlgorithms = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
supportedAlgorithms.push('passthrough');
const supportedEncodings = ['buffer', 'hex', 'binary', 'base64'];

function applyOptionsDefaults(object, sourceOptions) {
  if (typeof object === 'undefined') throw new Error('Object argument required.');

  const options = Object.assign({
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
    replacer: undefined,
    excludeKeys: undefined
  }, sourceOptions);

  options.algorithm = options.algorithm.toLowerCase();
  options.encoding = options.encoding.toLowerCase();

  if (!supportedAlgorithms.includes(options.algorithm)) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${supportedAlgorithms.join(', ')}`);
  }
  if (!supportedEncodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${supportedEncodings.join(', ')}`);
  }

  return options;
}

function isNativeFunction(f) {
  return typeof f === 'function' && /^\s*function [^(]*\(\s*\)\s*\{\s*\[native code]\s*\}\s*$/m.test(f.toString());
}

function computeHash(object, options) {
  const hashingStream = (options.algorithm === 'passthrough') ? new PassThrough() : crypto.createHash(options.algorithm);
  const hasher = createTypeHasher(options, hashingStream);
  hasher.dispatch(object);

  if (hashingStream.digest) {
    return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
  }
  return hashingStream.read().toString(options.encoding);
}

exports.writeToStream = (object, options, stream) => {
  if (!stream) [stream, options] = [options, {}];
  options = applyOptionsDefaults(object, options);
  return createTypeHasher(options, stream).dispatch(object);
};

function createTypeHasher(options, writeTo, context = []) {
  const write = (str) => writeTo.update ? writeTo.update(str, 'utf8') : writeTo.write(str, 'utf8');

  return {
    dispatch(value) {
      if (options.replacer) value = options.replacer(value);
      const dataType = value === null ? 'null' : typeof value;
      this[`_${dataType}`](value);
    },
    _object(object) {
      const typeTag = Object.prototype.toString.call(object).slice(8, -1).toLowerCase();
      
      if (context.includes(object)) return this.dispatch(`[CIRCULAR:${context.indexOf(object)}]`);
      context.push(object);

      if (typeTag !== 'object' && typeTag !== 'function' && typeTag !== 'asyncfunction') {
        return this[`_${typeTag}`] ? this[`_${typeTag}`](object) : options.ignoreUnknown && write(`[${typeTag}]`);
      }

      let keys = Object.keys(object);
      if (options.unorderedObjects) keys.sort();

      if (options.respectType && !isNativeFunction(object)) {
        keys = ['prototype', '__proto__', 'constructor', ...keys];
      }

      if (options.excludeKeys) keys = keys.filter((key) => !options.excludeKeys(key));

      write(`object:${keys.length}:`);
      keys.forEach(key => {
        this.dispatch(key);
        write(':');
        if (!options.excludeValues) this.dispatch(object[key]);
        write(',');
      });
    },
    _array(arr, unordered = options.unorderedArrays !== false) {
      write(`array:${arr.length}:`);
      if (!unordered || arr.length <= 1) return arr.forEach(entry => this.dispatch(entry));

      const streamEntries = arr.map(entry => {
        const stream = new PassThrough();
        const localContext = [...context];
        createTypeHasher(options, stream, localContext).dispatch(entry);
        context.push(...localContext.slice(context.length));
        return stream.read().toString();
      });
      streamEntries.sort();
      this._array(streamEntries, false);
    },
    _date(date) { write(`date:${date.toJSON()}`); },
    _symbol(sym) { write(`symbol:${sym.toString()}`); },
    _error(err) { write(`error:${err.toString()}`); },
    _boolean(bool) { write(`bool:${bool.toString()}`); },
    _string(string) { write(`string:${string.length}:${string.toString()}`); },
    _function(fn) {
      write('fn:');
      this.dispatch(isNativeFunction(fn) ? '[native]' : fn.toString());

      if (options.respectFunctionNames !== false) {
        this.dispatch(`function-name:${fn.name}`);
      }

      if (options.respectFunctionProperties) this._object(fn);
    },
    _number(number) { write(`number:${number.toString()}`); },
    _xml(xml) { write(`xml:${xml.toString()}`); },
    _null() { write('Null'); },
    _undefined() { write('Undefined'); },
    _regexp(regex) { write(`regex:${regex.toString()}`); },
    _uint8array(arr) { this.dispatchArrayLike(arr, 'uint8array:'); },
    _uint8clampedarray(arr) { this.dispatchArrayLike(arr, 'uint8clampedarray:'); },
    _int8array(arr) { this.dispatchArrayLike(arr, 'int8array:'); },
    _uint16array(arr) { this.dispatchArrayLike(arr, 'uint16array:'); },
    _int16array(arr) { this.dispatchArrayLike(arr, 'int16array:'); },
    _uint32array(arr) { this.dispatchArrayLike(arr, 'uint32array:'); },
    _int32array(arr) { this.dispatchArrayLike(arr, 'int32array:'); },
    _float32array(arr) { this.dispatchArrayLike(arr, 'float32array:'); },
    _float64array(arr) { this.dispatchArrayLike(arr, 'float64array:'); },
    _arraybuffer(arr) { this.dispatchArrayLike(new Uint8Array(arr), 'arraybuffer:'); },
    _url(url) { write(`url:${url.toString()}`, 'utf8'); },
    _map(map) { this._array([...map], options.unorderedSets !== false); },
    _set(set) { this._array([...set], options.unorderedSets !== false); },
    _file(file) { this.dispatch([file.name, file.size, file.type, file.lastModified], 'file:'); },
    _blob() {
      if (options.ignoreUnknown) write('[blob]');
      else throw Error('Hashing Blob objects is not supported. Use "options.replacer" or "options.ignoreUnknown"');
    },
    _domwindow() { write('domwindow'); },
    _bigint(number) { write(`bigint:${number.toString()}`); },
    _process() { write('process'); },
    _timer() { write('timer'); },
    _pipe() { write('pipe'); },
    _tcp() { write('tcp'); },
    _udp() { write('udp'); },
    _tty() { write('tty'); },
    _statwatcher() { write('statwatcher'); },
    _securecontext() { write('securecontext'); },
    _connection() { write('connection'); },
    _zlib() { write('zlib'); },
    _context() { write('context'); },
    _nodescript() { write('nodescript'); },
    _httpparser() { write('httpparser'); },
    _dataview() { write('dataview'); },
    _signal() { write('signal'); },
    _fsevent() { write('fsevent'); },
    _tlswrap() { write('tlswrap'); },
    dispatchArrayLike(arr, prefix) {
      write(prefix);
      this.dispatch(Array.prototype.slice.call(arr));
    }
  };
}

function PassThrough() {
  return {
    buffer: '',

    write(chunk) {
      this.buffer += chunk;
    },

    end(chunk) {
      if (chunk) this.write(chunk);
    },

    read() {
      return this.buffer;
    }
  };
}

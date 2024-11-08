'use strict';

const crypto = require('crypto');

/**
 * Hash objects using a variety of options and algorithms
 */
module.exports = objectHash;

function objectHash(object, options) {
  options = applyDefaults(object, options);
  return hash(object, options);
}

// Additional methods providing pre-configured hash functions
objectHash.sha1 = (object) => objectHash(object);
objectHash.keys = (object) => objectHash(object, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
objectHash.MD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex' });
objectHash.keysMD5 = (object) => objectHash(object, { algorithm: 'md5', encoding: 'hex', excludeValues: true });

const hashes = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
hashes.push('passthrough');
const encodings = ['buffer', 'hex', 'binary', 'base64'];

function applyDefaults(object, sourceOptions = {}) {
  const options = {};
  options.algorithm = (sourceOptions.algorithm || 'sha1').toLowerCase();
  options.encoding = (sourceOptions.encoding || 'hex').toLowerCase();
  options.excludeValues = !!sourceOptions.excludeValues;
  options.ignoreUnknown = !!sourceOptions.ignoreUnknown;
  options.respectType = sourceOptions.respectType !== false;
  options.respectFunctionNames = sourceOptions.respectFunctionNames !== false;
  options.respectFunctionProperties = sourceOptions.respectFunctionProperties !== false;
  options.unorderedArrays = !!sourceOptions.unorderedArrays;
  options.unorderedSets = sourceOptions.unorderedSets !== false;
  options.unorderedObjects = sourceOptions.unorderedObjects !== false;
  options.replacer = sourceOptions.replacer;
  options.excludeKeys = sourceOptions.excludeKeys;

  if (typeof object === 'undefined') {
    throw new Error('Object argument required.');
  }

  if (!hashes.includes(options.algorithm)) {
    throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${hashes.join(', ')}`);
  }

  if (!encodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
    throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${encodings.join(', ')}`);
  }

  return options;
}

function isNativeFunction(f) {
  return typeof f === 'function' && /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.test(Function.prototype.toString.call(f));
}

function hash(object, options) {
  const hashingStream = options.algorithm !== 'passthrough'
    ? crypto.createHash(options.algorithm)
    : new PassThrough();

  if (!hashingStream.write) {
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

function typeHasher(options, writeTo, context = []) {
  return {
    dispatch(value) {
      if (options.replacer) value = options.replacer(value);
      const type = value === null ? 'null' : typeof value;
      return this[`_${type}`](value);
    },
    _object(object) {
      // Handle circular references and known object types
      if (context.includes(object)) return this.dispatch(`[CIRCULAR:${context.indexOf(object)}]`);
      context.push(object);

      if (Buffer.isBuffer(object)) return writeBuffer('buffer:', object);

      let keys = Object.keys(object);
      if (options.unorderedObjects) keys.sort();

      if (options.respectType && !isNativeFunction(object)) keys.unshift('prototype', '__proto__', 'constructor');

      if (options.excludeKeys) keys = keys.filter(key => !options.excludeKeys(key));

      writeTo.write(`object:${keys.length}:`);
      keys.forEach(key => {
        this.dispatch(key);
        writeTo.write(':');
        if (!options.excludeValues) this.dispatch(object[key]);
        writeTo.write(',');
      });
    },
    _array(arr) {
      const unordered = options.unorderedArrays !== false;
      writeTo.write(`array:${arr.length}:`);
      if (!unordered || arr.length <= 1) return arr.forEach(entry => this.dispatch(entry));

      let contextAdditions = [];
      const entries = arr.map(entry => {
        const strm = new PassThrough();
        const localContext = context.slice();
        const hasher = typeHasher(options, strm, localContext);
        hasher.dispatch(entry);
        contextAdditions = contextAdditions.concat(localContext.slice(context.length));
        return strm.read().toString();
      });
      context = context.concat(contextAdditions);
      entries.sort();
      this._array(entries, false);
    },
    _date(date) { writeTo.write(`date:${date.toJSON()}`); },
    _symbol(sym) { writeTo.write(`symbol:${sym.toString()}`); },
    _error(err) { writeTo.write(`error:${err.toString()}`); },
    _boolean(bool) { writeTo.write(`bool:${bool.toString()}`); },
    _string(string) { writeTo.write(`string:${string.length}:` + string); },
    _function(fn) {
      writeTo.write('fn:');
      this.dispatch(isNativeFunction(fn) ? '[native]' : fn.toString());
      if (options.respectFunctionNames !== false) this.dispatch(`function-name:${String(fn.name)}`);
      if (options.respectFunctionProperties) this._object(fn);
    },
    _number(number) { writeTo.write(`number:${number.toString()}`); },
    _xml(xml) { writeTo.write(`xml:${xml.toString()}`); },
    _null() { writeTo.write('Null'); },
    _undefined() { writeTo.write('Undefined'); },
    _regexp(regex) { writeTo.write(`regex:${regex.toString()}`); },
    _uint8array(arr) { this.dispatch(new Uint8Array(arr)); },
    _float32array(arr) { this.dispatch(Array.from(arr)); },
    _map(map) { this._array(Array.from(map), options.unorderedSets !== false); },
    _set(set) { this._array(Array.from(set), options.unorderedSets !== false); },
    _blob() {
      if (options.ignoreUnknown) {
        writeTo.write('[blob]');
      } else {
        throw Error('Hashing Blob is unsupported. Use "options.replacer" or "options.ignoreUnknown"');
      }
    },
    _url(url) { writeTo.write(`url:${url.toString()}`); },
    // Other native Node.js objects
    _domwindow() { writeTo.write('domwindow'); },
    _process() { writeTo.write('process'); },
    _timer() { writeTo.write('timer'); },
    _pipe() { writeTo.write('pipe'); },
    _tcp() { writeTo.write('tcp'); },
    _udp() { writeTo.write('udp'); },
    _tty() { writeTo.write('tty'); },
    _statwatcher() { writeTo.write('statwatcher'); },
    _securecontext() { writeTo.write('securecontext'); },
    _connection() { writeTo.write('connection'); },
    _zlib() { writeTo.write('zlib'); },
    _context() { writeTo.write('context'); },
    _nodescript() { writeTo.write('nodescript'); },
    _httpparser() { writeTo.write('httpparser'); },
    _dataview() { writeTo.write('dataview'); },
    _signal() { writeTo.write('signal'); },
    _fsevent() { writeTo.write('fsevent'); },
    _tlswrap() { writeTo.write('tlswrap'); },
  };

  function writeBuffer(prefix, buf) {
    writeTo.write(prefix);
    writeTo.write(buf);
  }
}

// A minimalist implementation of PassThrough stream
function PassThrough() {
  return {
    buf: '',
    write(b) { this.buf += b; },
    end(b) { this.buf += b; },
    read() { return this.buf; }
  };
}

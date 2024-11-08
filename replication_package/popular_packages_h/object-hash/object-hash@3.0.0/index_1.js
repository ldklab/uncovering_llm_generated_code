'use strict';

const crypto = require('crypto');

module.exports = exports = createObjectHash;

function createObjectHash(object, options) {
  const opts = setupOptions(object, options);
  return generateHash(object, opts);
}

exports.sha1 = obj => createObjectHash(obj);
exports.keys = obj => createObjectHash(obj, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
exports.MD5 = obj => createObjectHash(obj, { algorithm: 'md5', encoding: 'hex' });
exports.keysMD5 = obj => createObjectHash(obj, { algorithm: 'md5', encoding: 'hex', excludeValues: true });

const supportedHashes = crypto.getHashes ? crypto.getHashes().filter(hash => hash) : ['sha1', 'md5'];
const supportedEncodings = ['buffer', 'hex', 'binary', 'base64'];

function setupOptions(object, incomingOptions = {}) {
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
    replacer: undefined,
    excludeKeys: undefined,
  };

  const options = { ...defaultOptions, ...parseProviderOptions(incomingOptions) };
  validateOptions(options);

  if (typeof object === 'undefined') {
    throw new Error('An object to hash is required.');
  }

  return options;
}

function parseProviderOptions(providerOptions) {
  return {
    algorithm: providerOptions.algorithm?.toLowerCase() || defaultOptions.algorithm,
    encoding: providerOptions.encoding?.toLowerCase() || defaultOptions.encoding,
    excludeValues: !!providerOptions.excludeValues,
    ignoreUnknown: providerOptions.ignoreUnknown === true,
    respectType: providerOptions.respectType !== false,
    respectFunctionNames: providerOptions.respectFunctionNames !== false,
    respectFunctionProperties: providerOptions.respectFunctionProperties !== false,
    unorderedArrays: providerOptions.unorderedArrays !== false,
    unorderedSets: providerOptions.unorderedSets !== false,
    unorderedObjects: providerOptions.unorderedObjects !== false,
    replacer: providerOptions.replacer,
    excludeKeys: providerOptions.excludeKeys,
  };
}

function validateOptions(options) {
  const isAlgorithmSupported = supportedHashes.includes(options.algorithm);
  if (!isAlgorithmSupported) {
    throw new Error(`Unsupported algorithm "${options.algorithm}". Supported algorithms: ${supportedHashes.join(', ')}`);
  }

  const isEncodingSupported = supportedEncodings.includes(options.encoding);
  if (!isEncodingSupported) {
    throw new Error(`Unsupported encoding "${options.encoding}". Supported encodings: ${supportedEncodings.join(', ')}`);
  }
}

function generateHash(object, options) {
  const hashingStream = options.algorithm !== 'passthrough' ?
    crypto.createHash(options.algorithm) : new SimplePassThrough();

  const hasher = hashTypeDispatcher(options, hashingStream);
  hasher.process(object);

  return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding) || hashingStream.read().toString(options.encoding);
}

exports.writeToStream = function (object, opts, stream) {
  const options = opts instanceof stream.Stream ? opts : setupOptions(object, opts);
  return hashTypeDispatcher(options, stream).process(object);
};

function hashTypeDispatcher(opts, outputStream) {
  let contextTracker = [];
  const write = text => (outputStream.update || outputStream.write)(text, 'utf8');

  return {
    process(value) {
      if (opts.replacer) value = opts.replacer(value);
      const valueType = value === null ? 'null' : typeof value;
      return this[`process_${valueType}`](value);
    },
    process_object(obj) {
      const objTag = Object.prototype.toString.call(obj);
      let objectClass = objTag.match(/\[object (.+)\]/i)?.[1]?.toLowerCase();

      if (objectClass === undefined) {
        objectClass = `unknown:[${objTag}]`;
      }

      const objectID = contextTracker.indexOf(obj);
      if (objectID >= 0) return write(`[CIRCULAR:${objectID}]`);
      contextTracker.push(obj);

      if (typeof Buffer !== 'undefined' && Buffer.isBuffer?.(obj)) {
        write('buffer:');
        return write(obj);
      }

      if (!['object', 'function', 'asyncfunction'].includes(objectClass) || this[`process_${objectClass}`]) {
        return this[`process_${objectClass}`]?.(obj) ?? write(`[${objectClass}]`);
      } else if (opts.ignoreUnknown) {
        return write(`[${objectClass}]`);
      } else {
        throw new Error(`Unknown object type "${objectClass}"`);
      }
    },
    process_array(arr, isUnordered = opts.unorderedArrays !== false) {
      write(`array:${arr.length}:`);
      if (isUnordered && arr.length > 1) {
        return this.orderIndependentArraySerialization(arr, contextTracker.slice());
      }
      return arr.forEach(this.process.bind(this));
    },
    process_date(date) { write(`date:${date.toJSON()}`); },
    process_symbol(sym) { write(`symbol:${sym.toString()}`); },
    process_error(err) { write(`error:${err.toString()}`); },
    process_boolean(bool) { write(`bool:${bool.toString()}`); },
    process_string(str) { write(`string:${str.length}:${str}`); },
    process_number(num) { write(`number:${num.toString()}`); },
    process_function(fn) {
      write('fn:');
      this.process(isNativeFunction(fn) ? '[native]' : fn.toString());
      if (opts.respectFunctionNames) this.process(`function-name:${String(fn.name)}`);
      if (opts.respectFunctionProperties) this.process_object(fn);
    },
    process_map(map) {
      write('map:');
      this.process_array(Array.from(map).map(([key, value]) => `${key}:${value}`), opts.unorderedSets !== false);
    },
    process_set(set) {
      write('set:');
      this.process_array(Array.from(set), opts.unorderedSets !== false);
    },
    process_blob() {
      if (opts.ignoreUnknown) return write('[blob]');
      throw new Error('Blob object hashing is not supported. Consider options like "replacer" or "ignoreUnknown".');
    },
    process_uint8array(arr) {
      write('uint8array:');
      this.process_array(Array.prototype.slice.call(arr));
    },
    orderIndependentArraySerialization(arr, currentContext) {
      const localContextAdditions = [];
      const entryStrings = arr.map(entry => {
        const temporaryStream = new SimplePassThrough();
        const tempHasher = hashTypeDispatcher(opts, temporaryStream, currentContext.slice());
        tempHasher.process(entry);
        localContextAdditions.push(...currentContext.slice(currentContext.length));
        return temporaryStream.read().toString();
      }).sort();

      contextTracker.push(...localContextAdditions);
      return this.process_array(entryStrings, false);
    },
  };
}

function SimplePassThrough() {
  return {
    buffer: '',
    write(data) { this.buffer += data; },
    end(data) { this.buffer += data; },
    read() { return this.buffer; },
  };
}

function isNativeFunction(func) {
  if (typeof func !== 'function') return false;
  return /^\s*function\s*\(\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(func));
}

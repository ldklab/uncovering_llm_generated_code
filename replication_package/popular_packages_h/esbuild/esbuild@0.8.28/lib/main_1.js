const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const tty = require('tty');
const crypto = require('crypto');

// Define utilities for working with modules and properties
const __defProp = Object.defineProperty;
const __markAsModule = (target) => __defProp(target, '__esModule', { value: true });
const __export = (target, all) => {
  __markAsModule(target);
  for (let name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

// Handle asynchronous operations using generator functions
const __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    const step = (result) =>
      result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected);

    const fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };

    const rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };

    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// Packet encoding/decoding functions for inter-process communication
function encodePacket(packet) {
  const bb = new ByteBuffer();
  bb.write32(0);
  bb.write32(packet.id << 1 | +!packet.isRequest);
  const visit = (value) => {
    if (value === null) {
      bb.write8(0);
    } else if (typeof value === 'boolean') {
      bb.write8(1);
      bb.write8(+value);
    } else if (typeof value === 'number') {
      bb.write8(2);
      bb.write32(value | 0);
    } else if (typeof value === 'string') {
      bb.write8(3);
      bb.write(encodeUTF8(value));
    } else if (value instanceof Uint8Array) {
      bb.write8(4);
      bb.write(value);
    } else if (value instanceof Array) {
      bb.write8(5);
      bb.write32(value.length);
      for (const item of value) visit(item);
    } else {
      let keys = Object.keys(value);
      bb.write8(6);
      bb.write32(keys.length);
      for (let key of keys) {
        bb.write(encodeUTF8(key));
        visit(value[key]);
      }
    }
  };
  visit(packet.value);
  writeUInt32LE(bb.buf, bb.len - 4, 0);
  return bb.buf.subarray(0, bb.len);
}

function decodePacket(bytes) {
  const bb = new ByteBuffer(bytes);
  const id = bb.read32();
  const isRequest = (id & 1) === 0;
  const packet = { id: id >>> 1, isRequest, value: visit() };
  if (bb.ptr !== bytes.length) throw new Error('Invalid packet');
  return packet;

  function visit() {
    switch (bb.read8()) {
      case 0: return null;
      case 1: return !!bb.read8();
      case 2: return bb.read32();
      case 3: return decodeUTF8(bb.read());
      case 4: return bb.read();
      case 5: {
        let count = bb.read32();
        let value = [];
        for (let i = 0; i < count; i++) value.push(visit());
        return value;
      }
      case 6: {
        let count = bb.read32();
        let value = {};
        for (let i = 0; i < count; i++) {
          value[decodeUTF8(bb.read())] = visit();
        }
        return value;
      }
      default: throw new Error('Invalid packet');
    }
  }
}

// Dynamic byte buffer class for encoding/decoding packets
class ByteBuffer {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }

  _write(delta) {
    if (this.len + delta > this.buf.length) {
      let clone = new Uint8Array((this.len + delta) * 2);
      clone.set(this.buf);
      this.buf = clone;
    }
    this.len += delta;
    return this.len - delta;
  }

  write8(value) {
    let offset = this._write(1);
    this.buf[offset] = value;
  }

  write32(value) {
    let offset = this._write(4);
    writeUInt32LE(this.buf, value, offset);
  }

  write(bytes) {
    let offset = this._write(4 + bytes.length);
    writeUInt32LE(this.buf, bytes.length, offset);
    this.buf.set(bytes, offset + 4);
  }

  _read(delta) {
    if (this.ptr + delta > this.buf.length) {
      throw new Error('Invalid packet');
    }
    this.ptr += delta;
    return this.ptr - delta;
  }

  read8() {
    return this.buf[this._read(1)];
  }

  read32() {
    return readUInt32LE(this.buf, this._read(4));
  }

  read() {
    let length = this.read32();
    let bytes = new Uint8Array(length);
    let ptr = this._read(bytes.length);
    bytes.set(this.buf.subarray(ptr, ptr + length));
    return bytes;
  }
}

// Determine available UTF-8 codec for string conversion
let encodeUTF8;
let decodeUTF8;

if (typeof TextEncoder !== 'undefined' && typeof TextDecoder !== 'undefined') {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  encodeUTF8 = (text) => encoder.encode(text);
  decodeUTF8 = (bytes) => decoder.decode(bytes);
} else if (typeof Buffer !== 'undefined') {
  encodeUTF8 = (text) => Buffer.from(text);
  decodeUTF8 = (bytes) => Buffer.from(bytes).toString();
} else {
  throw new Error('No UTF-8 codec found');
}

// Helper functions for reading/writing 32-bit integers
function readUInt32LE(buffer, offset) {
  return (
    buffer[offset++] |
    (buffer[offset++] << 8) |
    (buffer[offset++] << 16) |
    (buffer[offset++] << 24)
  );
}

function writeUInt32LE(buffer, value, offset) {
  buffer[offset++] = value;
  buffer[offset++] = value >> 8;
  buffer[offset++] = value >> 16;
  buffer[offset++] = value >> 24;
}

// Define validation functions for different data types
function validateTarget(target) { /* Implementation */ }
const mustBeBoolean = (value) => typeof value === 'boolean' ? null : 'a boolean';
const mustBeString = (value) => typeof value === 'string' ? null : 'a string';
const mustBeRegExp = (value) => value instanceof RegExp ? null : 'a RegExp object';
const mustBeInteger = (value) => typeof value === 'number' && value === (value | 0) ? null : 'an integer';
const mustBeFunction = (value) => typeof value === 'function' ? null : 'a function';
const mustBeArray = (value) => Array.isArray(value) ? null : 'an array';
const mustBeObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'an object';
const mustBeObjectOrNull = (value) => typeof value === 'object' && !Array.isArray(value) ? null : 'an object or null';
const mustBeStringOrBoolean = (value) => (typeof value === 'string' || typeof value === 'boolean') ? null : 'a string or a boolean';
const mustBeStringOrObject = (value) => (typeof value === 'string' || typeof value === 'object' && value !== null && !Array.isArray(value)) ? null : 'a string or an object';
const mustBeStringOrArray = (value) => (typeof value === 'string' || Array.isArray(value)) ? null : 'a string or an array';
const mustBeStringOrUint8Array = (value) => (typeof value === 'string' || value instanceof Uint8Array) ? null : 'a string or a Uint8Array';

// Functions for flag processing based on build and transform options
function getFlag(object, keys, key, mustBeFn) {
  const value = object[key];
  keys[key + ""] = true;
  if (value === void 0) return;
  const mustBe = mustBeFn(value);
  if (mustBe != null) throw new Error(`"${key}" must be ${mustBe}`);
  return value;
}

function checkForInvalidFlags(object, keys, where) {
  for (let key in object) {
    if (!(key in keys)) {
      throw new Error(`Invalid option ${where}: "${key}"`);
    }
  }
}

function validateServiceOptions(options) { /* Implementation */}

function pushLogFlags(flags, options, keys, isTTY2, logLevelDefault) {
  let color = getFlag(options, keys, "color", mustBeBoolean);
  let logLevel = getFlag(options, keys, "logLevel", mustBeString);
  let errorLimit = getFlag(options, keys, "errorLimit", mustBeInteger);
  if (color) flags.push(`--color=${color}`);
  else if (isTTY2) flags.push(`--color=true`);
  flags.push(`--log-level=${logLevel || logLevelDefault}`);
  flags.push(`--error-limit=${errorLimit || 0}`);
}

function pushCommonFlags(flags, options, keys) {
  let target = getFlag(options, keys, "target", mustBeStringOrArray);
  let format = getFlag(options, keys, "format", mustBeString);
  let globalName = getFlag(options, keys, "globalName", mustBeString);
  let minify = getFlag(options, keys, "minify", mustBeBoolean);
  let minifySyntax = getFlag(options, keys, "minifySyntax", mustBeBoolean);
  let minifyWhitespace = getFlag(options, keys, "minifyWhitespace", mustBeBoolean);
  let minifyIdentifiers = getFlag(options, keys, "minifyIdentifiers", mustBeBoolean);
  let charset = getFlag(options, keys, "charset", mustBeString);
  let treeShaking = getFlag(options, keys, "treeShaking", mustBeStringOrBoolean);
  let jsxFactory = getFlag(options, keys, "jsxFactory", mustBeString);
  let jsxFragment = getFlag(options, keys, "jsxFragment", mustBeString);
  let define = getFlag(options, keys, "define", mustBeObject);
  let pure = getFlag(options, keys, "pure", mustBeArray);
  let avoidTDZ = getFlag(options, keys, "avoidTDZ", mustBeBoolean);
  let keepNames = getFlag(options, keys, "keepNames", mustBeBoolean);
  let banner = getFlag(options, keys, "banner", mustBeString);
  let footer = getFlag(options, keys, "footer", mustBeString);

  if (target) flags.push(`--target=${Array.isArray(target) ? target.map(validateTarget).join(",") : validateTarget(target)}`);
  if (format) flags.push(`--format=${format}`);
  if (globalName) flags.push(`--global-name=${globalName}`);
  if (minify) flags.push("--minify");
  if (minifySyntax) flags.push("--minify-syntax");
  if (minifyWhitespace) flags.push("--minify-whitespace");
  if (minifyIdentifiers) flags.push("--minify-identifiers");
  if (charset) flags.push(`--charset=${charset}`);
  if (treeShaking !== void 0 && treeShaking !== true) flags.push(`--tree-shaking=${treeShaking}`);
  if (jsxFactory) flags.push(`--jsx-factory=${jsxFactory}`);
  if (jsxFragment) flags.push(`--jsx-fragment=${jsxFragment}`);
  if (define) {
    for (let key in define) {
      if (key.indexOf("=") >= 0) throw new Error(`Invalid define: ${key}`);
      flags.push(`--define:${key}=${define[key]}`);
    }
  }
  if (pure) pure.forEach(fn => flags.push(`--pure:${fn}`));
  if (avoidTDZ) flags.push(`--avoid-tdz`);
  if (keepNames) flags.push(`--keep-names`);
  if (banner) flags.push(`--banner=${banner}`);
  if (footer) flags.push(`--footer=${footer}`);
}

function flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault) {
  const flags = [];
  const keys = Object.create(null);
  let stdinContents = null;
  let stdinResolveDir = null;
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);

  const sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  const sourcesContent = getFlag(options, keys, "sourcesContent", mustBeBoolean);
  const bundle = getFlag(options, keys, "bundle", mustBeBoolean);
  const splitting = getFlag(options, keys, "splitting", mustBeBoolean);
  const metafile = getFlag(options, keys, "metafile", mustBeString);
  const outfile = getFlag(options, keys, "outfile", mustBeString);
  const outdir = getFlag(options, keys, "outdir", mustBeString);
  const outbase = getFlag(options, keys, "outbase", mustBeString);
  const platform = getFlag(options, keys, "platform", mustBeString);
  const tsconfig = getFlag(options, keys, "tsconfig", mustBeString);
  const resolveExtensions = getFlag(options, keys, "resolveExtensions", mustBeArray);
  const mainFields = getFlag(options, keys, "mainFields", mustBeArray);
  const external = getFlag(options, keys, "external", mustBeArray);
  const loader = getFlag(options, keys, "loader", mustBeObject);
  const outExtension = getFlag(options, keys, "outExtension", mustBeObject);
  const publicPath = getFlag(options, keys, "publicPath", mustBeString);
  const inject = getFlag(options, keys, "inject", mustBeArray);
  const entryPoints = getFlag(options, keys, "entryPoints", mustBeArray);
  const stdin = getFlag(options, keys, "stdin", mustBeObject);
  const write = getFlag(options, keys, "write", mustBeBoolean) || writeDefault;
  const incremental = getFlag(options, keys, "incremental", mustBeBoolean) === true;
  const plugins = getFlag(options, keys, "plugins", mustBeArray);

  if (sourcemap) flags.push(`--sourcemap${sourcemap === true ? "" : `=${sourcemap}`}`);
  if (sourcesContent !== void 0) flags.push(`--sources-content=${sourcesContent}`);
  if (bundle) flags.push("--bundle");
  if (splitting) flags.push("--splitting");
  if (metafile) flags.push(`--metafile=${metafile}`);
  if (outfile) flags.push(`--outfile=${outfile}`);
  if (outdir) flags.push(`--outdir=${outdir}`);
  if (outbase) flags.push(`--outbase=${outbase}`);
  if (platform) flags.push(`--platform=${platform}`);
  if (tsconfig) flags.push(`--tsconfig=${tsconfig}`);
  if (resolveExtensions) {
    const values = resolveExtensions.map(value => {
      if (value.indexOf(",") >= 0) throw new Error(`Invalid resolve extension: ${value}`);
      return value.toString();
    });
    flags.push(`--resolve-extensions=${values.join(",")}`);
  }
  if (publicPath) flags.push(`--public-path=${publicPath}`);
  if (mainFields) {
    const values = mainFields.map(value => {
      if (value.indexOf(",") >= 0) throw new Error(`Invalid main field: ${value}`);
      return value.toString();
    });
    flags.push(`--main-fields=${values.join(",")}`);
  }
  if (external) external.forEach(name => flags.push(`--external:${name}`));
  if (inject) inject.forEach(path => flags.push(`--inject:${path}`));
  if (loader) {
    for (let ext in loader) {
      if (ext.indexOf("=") >= 0) throw new Error(`Invalid loader extension: ${ext}`);
      flags.push(`--loader:${ext}=${loader[ext]}`);
    }
  }
  if (outExtension) {
    for (let ext in outExtension) {
      if (ext.indexOf("=") >= 0) throw new Error(`Invalid out extension: ${ext}`);
      flags.push(`--out-extension:${ext}=${outExtension[ext]}`);
    }
  }
  if (entryPoints) {
    entryPoints.forEach(entryPoint => {
      if (entryPoint.startsWith("-")) throw new Error(`Invalid entry point: ${entryPoint}`);
      flags.push(entryPoint.toString());
    });
  }
  if (stdin) {
    const stdinKeys = Object.create(null);
    const contents = getFlag(stdin, stdinKeys, "contents", mustBeString);
    const resolveDir = getFlag(stdin, stdinKeys, "resolveDir", mustBeString);
    const sourcefile = getFlag(stdin, stdinKeys, "sourcefile", mustBeString);
    const loader2 = getFlag(stdin, stdinKeys, "loader", mustBeString);
    
    if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
    if (loader2) flags.push(`--loader=${loader2}`);
    if (resolveDir) stdinResolveDir = resolveDir;
    stdinContents = contents || "";
  }

  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  return { flags, write, plugins, stdinContents, stdinResolveDir, incremental };
}

function flagsForTransformOptions(callName, options, isTTY2, logLevelDefault) {
  const flags = [];
  const keys = Object.create(null);
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);

  const sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  const tsconfigRaw = getFlag(options, keys, "tsconfigRaw", mustBeStringOrObject);
  const sourcefile = getFlag(options, keys, "sourcefile", mustBeString);
  const loader = getFlag(options, keys, "loader", mustBeString);

  if (sourcemap) flags.push(`--sourcemap=${sourcemap === true ? "external" : sourcemap}`);
  if (tsconfigRaw) flags.push(`--tsconfig-raw=${tsconfigRaw instanceof String ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
  if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
  if (loader) flags.push(`--loader=${loader}`);

  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  return flags;
}

// Channel and service creation for inter-process communication
function createChannel(streamIn) {
  // Map to hold callbacks for pending requests
  const responseCallbacks = new Map();
  // Map to hold callbacks for plugins
  const pluginCallbacks = new Map();
  // Map to hold callbacks for serving
  const serveCallbacks = new Map();

  let nextServeID = 0;
  let isClosed = false;
  let nextRequestID = 0;
  let nextBuildKey = 0;
  let stdout = new Uint8Array(16 * 1024);
  let stdoutUsed = 0;

  const readFromStdout = (chunk) => {
    let limit = stdoutUsed + chunk.length;
    if (limit > stdout.length) {
      let swap = new Uint8Array(limit * 2);
      swap.set(stdout);
      stdout = swap;
    }
    stdout.set(chunk, stdoutUsed);
    stdoutUsed += chunk.length;

    let offset = 0;
    while (offset + 4 <= stdoutUsed) {
      let length = readUInt32LE(stdout, offset);
      if (offset + 4 + length > stdoutUsed) {
        break;
      }
      offset += 4;
      handleIncomingPacket(stdout.slice(offset, offset + length));
      offset += length;
    }
    if (offset > 0) {
      stdout.set(stdout.slice(offset));
      stdoutUsed -= offset;
    }
  };

  const afterClose = () => {
    isClosed = true;
    for (let callback of responseCallbacks.values()) {
      callback('The service was stopped', null);
    }
    responseCallbacks.clear();
    for (let callbacks of serveCallbacks.values()) {
      callbacks.onWait('The service was stopped');
    }
    serveCallbacks.clear();
  };

  const sendRequest = (value, callback) => {
    if (isClosed) return callback('The service is no longer running', null);
    let id = nextRequestID++;
    responseCallbacks.set(id, callback);
    streamIn.writeToStdin(encodePacket({ id, isRequest: true, value }));
  };

  const sendResponse = (id, value) => {
    if (isClosed) throw new Error('The service is no longer running');
    streamIn.writeToStdin(encodePacket({ id, isRequest: false, value }));
  };

  const handleRequest = (id, request) => __async(this, null, function* () {
    try {
      switch (request.command) {
        case 'resolve':
        case 'load': {
          let callback = pluginCallbacks.get(request.key);
          sendResponse(id, yield callback(request));
          break;
        }
        case 'serve-request': {
          let callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks?.onRequest) callbacks.onRequest(request.args);
          break;
        }
        case 'serve-wait': {
          let callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks) callbacks.onWait(request.error);
          break;
        }
        default: throw new Error(`Invalid command: ${request.command}`);
      }
    } catch (e) {
      sendResponse(id, { errors: [yield extractErrorMessageV8(e, streamIn)] });
    }
  });

  const handleIncomingPacket = (bytes) => {
    if (isFirstPacket) {
      isFirstPacket = false;
      const binaryVersion = String.fromCharCode(...bytes);
      if (binaryVersion !== '0.8.28') {
        throw new Error(
          `Cannot start service: Host version "${'0.8.28'}" does not match binary version ${JSON.stringify(binaryVersion)}`
        );
      }
      return;
    }
    const packet = decodePacket(bytes);
    if (packet.isRequest) {
      handleRequest(packet.id, packet.value);
    } else {
      const callback = responseCallbacks.get(packet.id);
      responseCallbacks.delete(packet.id);
      if (packet.value.error) callback(packet.value.error, {});
      else callback(null, packet.value);
    }
  };

  const handlePlugins = (plugins, request, buildKey) => {
    if (streamIn.isSync) throw new Error('Cannot use plugins in synchronous API calls');
    const onResolveCallbacks = {};
    const onLoadCallbacks = {};
    let nextCallbackID = 0;
    let i = 0;

    request.plugins = [];
    for (let item of plugins) {
      let keys = {};
      if (typeof item !== 'object') throw new Error(`Plugin at index ${i} must be an object`);
      let name = getFlag(item, keys, 'name', mustBeString);
      let setup = getFlag(item, keys, 'setup', mustBeFunction);
      if (!name) throw new Error(`Plugin at index ${i} is missing a name`);
      if (!setup) throw new Error(`[${name}] Plugin is missing a setup function`);
      checkForInvalidFlags(item, keys, `on plugin ${JSON.stringify(name)}`);

      const plugin = {
        name,
        onResolve: [],
        onLoad: []
      };
      setup({
        onResolve(options, callback) {
          const keys2 = {};
          const filter = getFlag(options, keys2, 'filter', mustBeRegExp);
          const namespace = getFlag(options, keys2, 'namespace', mustBeString);
          if (!filter) throw new Error(`[${plugin.name}] onResolve() call is missing a filter`);

          const id = nextCallbackID++;
          onResolveCallbacks[id] = { name, callback };
          plugin.onResolve.push({ id, filter: filter.source, namespace: namespace || '' });
          checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${JSON.stringify(name)}`);
        },
        onLoad(options, callback) {
          const keys2 = {};
          const filter = getFlag(options, keys2, 'filter', mustBeRegExp);
          const namespace = getFlag(options, keys2, 'namespace', mustBeString);
          if (!filter) throw new Error(`[${plugin.name}] onLoad() call is missing a filter`);

          const id = nextCallbackID++;
          onLoadCallbacks[id] = { name, callback };
          plugin.onLoad.push({ id, filter: filter.source, namespace: namespace || '' });
          checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${JSON.stringify(name)}`);
        }
      });
      request.plugins.push(plugin);
    }

    pluginCallbacks.set(buildKey, (request) => __async(this, null, function* () {
      switch (request.command) {
        case 'resolve': {
          let response = {};
          for (let id of request.ids) {
            try {
              const { name, callback } = onResolveCallbacks[id];
              const result = yield callback({
                path: request.path,
                importer: request.importer,
                namespace: request.namespace,
                resolveDir: request.resolveDir
              });
              if (result) {
                if (typeof result !== 'object')
                  throw new Error(`Expected onResolve() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                response.id = id;
                response.pluginName = getFlag(result, keys, 'pluginName', mustBeString);
                response.path = getFlag(result, keys, 'path', mustBeString);
                response.namespace = getFlag(result, keys, 'namespace', mustBeString);
                response.external = getFlag(result, keys, 'external', mustBeBoolean);
                response.errors = sanitizeMessages(getFlag(result, keys, 'errors', mustBeArray), 'errors');
                response.warnings = sanitizeMessages(getFlag(result, keys, 'warnings', mustBeArray), 'warnings');
                checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${JSON.stringify(name)}`);
                break;
              }
            } catch (e) {
              return { id, errors: [yield extractErrorMessageV8(e, streamIn)] };
            }
          }
          return response;
        }
        case 'load': {
          let response = {};
          for (let id of request.ids) {
            try {
              const { name, callback } = onLoadCallbacks[id];
              const result = yield callback({ path: request.path, namespace: request.namespace });
              if (result) {
                if (typeof result !== 'object')
                  throw new Error(`Expected onLoad() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                response.id = id;
                response.pluginName = getFlag(result, keys, 'pluginName', mustBeString);
                response.contents = getFlag(result, keys, 'contents', mustBeStringOrUint8Array);
                response.resolveDir = getFlag(result, keys, 'resolveDir', mustBeString);
                response.loader = getFlag(result, keys, 'loader', mustBeString);
                response.errors = sanitizeMessages(getFlag(result, keys, 'errors', mustBeArray), 'errors');
                response.warnings = sanitizeMessages(getFlag(result, keys, 'warnings', mustBeArray), 'warnings');
                checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${JSON.stringify(name)}`);
                break;
              }
            } catch (e) {
              return { id, errors: [yield extractErrorMessageV8(e, streamIn)] };
            }
          }
          return response;
        }
        default: throw new Error(`Invalid command: ${request.command}`);
      }
    }));

    return () => pluginCallbacks.delete(buildKey);
  };

  const buildServeData = (options, request) => {
    const keys = {};
    const port = getFlag(options, keys, 'port', mustBeInteger);
    const host = getFlag(options, keys, 'host', mustBeString);
    const onRequest = getFlag(options, keys, 'onRequest', mustBeFunction);

    const serveID = nextServeID++;
    const serveData = {
      serveID,
      wait: new Promise((resolve, reject) => (serveCallbacks.set(serveID, { onRequest, onWait: (error) => error ? reject(new Error(error)) : resolve() }))),
      stop() { sendRequest({ command: 'serve-stop', serveID }, () => { }); }
    };

    request.serve = { serveID, port, host };
    checkForInvalidFlags(options, keys, 'in serve() call');
    return serveData;
  };

  return {
    readFromStdout,
    afterClose,
    service: {
      buildOrServe(callName, serveOptions, options, isTTY2, callback) {
        const logLevelDefault = "info";
        let key = nextBuildKey++;
        let writeDefault = !streamIn.isBrowser;
        const { flags, write, plugins, stdinContents, stdinResolveDir, incremental } = flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault);
        const request = { command: 'build', key, flags, write, stdinContents, stdinResolveDir, incremental };
        const serveData = serveOptions ? buildServeData(serveOptions, request) : null;
        const pluginCleanup = plugins && plugins.length > 0 && handlePlugins(plugins, request, key);

        const buildResponseToResult = (response, cb) => {
          const { errors, warnings } = response;
          const result = { warnings };
          if (errors.length > 0) return cb(failureErrorWithLog('Build failed', errors, warnings), null);
          if (response.outputFiles) result.outputFiles = response.outputFiles.map(convertOutputFiles);
          if (response.rebuildID !== undefined && !rebuild) {
            rebuild = createRebuildCallback(response.rebuildID, key, pluginCleanup);
          }
          return cb(null, result);
        };

        if (!write && streamIn.isBrowser) throw new Error('Cannot enable "write" in the browser');
        if (incremental && streamIn.isSync) throw new Error('Cannot use "incremental" with a synchronous build');

        const createRebuildCallback = (rebuildID, buildKey, cleanup) => {
          let isDisposed = false;
          const rebuild = () => new Promise((resolve, reject) => {
            if (isDisposed || isClosed) throw new Error('Cannot rebuild');
            sendRequest({ command: 'rebuild', rebuildID }, (err, res) => {
              err ? reject(err) : buildResponseToResult(res, (error, result) => error ? reject(error) : resolve(result));
            });
          });
          rebuild.dispose = () => {
            if (!isDisposed) {
              isDisposed = true;
              if (cleanup) cleanup();
              sendRequest({ command: 'rebuild-dispose', rebuildID }, () => { });
            }
          };
          return rebuild;
        };

        try {
          sendRequest(request, (error, response) => {
            if (error) return callback(new Error(error), null);
            if (serveData) {
              const { port, host } = response;
              callback(null, { port, host, wait: serveData.wait, stop: serveData.stop });
            } else {
              if (pluginCleanup && !incremental) pluginCleanup();
              buildResponseToResult(response, callback);
            }
          });
        } catch (e) {
          const flags = [];
          try {
            pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
          } catch (e2) { }
          sendRequest({ command: 'error', flags, error: extractErrorMessageV8(e, streamIn) }, () => {
            callback(e, null);
          });
        }
      },
      transform(callName, input, options, isTTY2, fs2, callback) {
        const logLevelDefault = 'silent';
        input = input.toString();
        
        const start = (inputPath) => {
          try {
            const flags = flagsForTransformOptions(callName, options, isTTY2, logLevelDefault);
            const request = {
              command: 'transform',
              flags,
              inputFS: inputPath !== null,
              input: inputPath ?? input
            };
            sendRequest(request, (error, response) => {
              if (error) return callback(new Error(error), null);
              const { errors, warnings } = response;

              if (errors.length > 0) return callback(failureErrorWithLog('Transform failed', errors, warnings), null);

              const result = { warnings, code: response.code, map: response.map };
              if (!response.codeFS && !response.mapFS) return callback(null, result);

              let outstanding = 1;
              const next = () => --outstanding === 0 && callback(null, result);
              if (response.codeFS) {
                outstanding++;
                fs2.readFile(response.code, (err, contents) => {
                  if (err) return callback(err, null);
                  result.code = contents;
                  next();
                });
              }
              if (response.mapFS) {
                outstanding++;
                fs2.readFile(response.map, (err, contents) => {
                  if (err) return callback(err, null);
                  result.map = contents;
                  next();
                });
              }
              next();
            });
          } catch (e) {
            const flags = [];
            try {
              pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
            } catch (e2) { }
            sendRequest({ command: 'error', flags, error: extractErrorMessageV8(e, streamIn) }, () => {
              callback(e, null);
            });
          }
        };

        if (input.length > 1024 * 1024) {
          const next = start;
          start = () => fs2.writeFile(input, next);
        }
        start(null);
      }
    }
  };
}

// Error handling and message extraction
function extractErrorMessageV8(e, streamIn) {
  let text = 'Internal error';
  let location = null;

  try {
    text = (e?.message || e) + "";
  } catch (e2) { }

  try {
    const stack = e.stack + "";
    const lines = stack.split("\n", 3);
    const at = "    at ";

    if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1]?.startsWith(at)) {
      let line = lines[1].slice(at.length);
      while (true) {
        let match = /^\S+ \((.*)\)$/.exec(line);
        if (match) {
          line = match[1];
          continue;
        }
        match = /^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(line);
        if (match) {
          line = match[1];
          continue;
        }
        match = /^(\S+):(\d+):(\d+)$/.exec(line);
        if (match) {
          const contents = streamIn.readFileSync(match[1], "utf8");
          const lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
          location = {
            file: match[1],
            namespace: "file",
            line: +match[2],
            column: +match[3] - 1,
            length: 0,
            lineText: `${lineText}\n${lines.slice(1).join("\n")}`
          };
        }
        break;
      }
    }
  } catch (e2) { }

  return { text, location };
}

function failureErrorWithLog(text, errors, warnings) {
  const limit = 5;
  const summary = errors.length < 1 ? '' : 
    ` with ${errors.length} error${errors.length < 2 ? '' : 's'}:` +
    errors.slice(0, limit + 1).map((e, i) => {
      if (i === limit) return '\n...';
      if (!e.location) return `\nerror: ${e.text}`;
      const { file, line, column } = e.location;
      return `\n${file}:${line}:${column}: error: ${e.text}`;
    }).join('');
  
  const error = new Error(`${text}${summary}`);
  error.errors = errors;
  error.warnings = warnings;
  return error;
}

function sanitizeMessages(messages, property) {
  return messages.map((message, index) => {
    const keys = {};
    const text = getFlag(message, keys, 'text', mustBeString);
    const location = getFlag(message, keys, 'location', mustBeObjectOrNull);
    checkForInvalidFlags(message, keys, `in element ${index} of "${property}"`);

    const locationClone = location ? {
      file: getFlag(location, {}, 'file', mustBeString) || '',
      namespace: getFlag(location, {}, 'namespace', mustBeString) || '',
      line: getFlag(location, {}, 'line', mustBeInteger) || 0,
      column: getFlag(location, {}, 'column', mustBeInteger) || 0,
      length: getFlag(location, {}, 'length', mustBeInteger) || 0,
      lineText: getFlag(location, {}, 'lineText', mustBeString) || ''
    } : null;

    return { text: text || '', location: locationClone };
  });
}

function convertOutputFiles({ path: filePath, contents }) {
  let text = null;
  return {
    path: filePath,
    contents,
    get text() {
      if (text === null) text = decodeUTF8(contents);
      return text;
    }
  };
}

// Reference-counted services to manage multiple instances of the service
function referenceCountedService(getWd, startService) {
  const entries = new Map();

  return (options) => __async(this, null, function* () {
    const cwd = getWd();
    const optionsJSON = JSON.stringify(options || {});
    const key = `${optionsJSON} ${cwd}`;
    let didStop = false;
    let entry = entries.get(key);
    let checkWasStopped = () => { if (didStop) throw new Error('The service was stopped'); };
    let isLastStop = () => {
      if (!didStop) {
        didStop = true;
        if (--entry.refCount === 0) {
          entries.delete(key);
          return true;
        }
      }
      return false;
    };

    if (entry === undefined) {
      entry = { promise: startService(JSON.parse(optionsJSON)), refCount: 0 };
      entries.set(key, entry);
    }

    ++entry.refCount;
    try {
      const service = yield entry.promise;
      return {
        build: (options) => {
          checkWasStopped();
          return service.build(options);
        },
        serve(serveOptions, buildOptions) {
          checkWasStopped();
          return service.serve(serveOptions, buildOptions);
        },
        transform(input, options) {
          checkWasStopped();
          return service.transform(input, options);
        },
        stop() {
          if (isLastStop()) {
            service.stop();
          }
        }
      };
    } catch (e) {
      isLastStop();
      throw e;
    }
  });
}

// Service-related code to handle async or sync execution using command line
function startService() {
  return referenceCountedService(() => process.cwd(), (options) => {
    options = validateServiceOptions(options || {});
    if (options.wasmURL) throw new Error(`The "wasmURL" option only works in the browser`);
    if (options.worker) throw new Error(`The "worker" option only works in the browser`);

    const [command, args] = esbuildCommandAndArgs();
    const child = spawn(command, args.concat(`--service=${version}`), {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: ["pipe", "pipe", "inherit"]
    });

    const { readFromStdout, afterClose, service } = createChannel({
      writeToStdin(bytes) { child.stdin.write(bytes); },
      readFileSync: fs.readFileSync,
      isSync: false,
      isBrowser: false
    });

    child.stdout.on("data", readFromStdout);
    child.stdout.on("end", afterClose);

    return Promise.resolve({
      build: (options) => new Promise((resolve, reject) =>
        service.buildOrServe('build', null, options, isTTY(), (err, res) => err ? reject(err) : resolve(res))),
      serve: (serveOptions, buildOptions) => {
        if (!serveOptions || typeof serveOptions !== "object") throw new Error('The first argument must be an object');
        return new Promise((resolve, reject) =>
          service.buildOrServe('serve', serveOptions, buildOptions, isTTY(), (err, res) => err ? reject(err) : resolve(res)));
      },
      transform: (input, options) => {
        return new Promise((resolve, reject) =>
          service.transform('transform', input + "", options || {}, isTTY(), {
            readFile(tempFile, callback) {
              try {
                fs.readFile(tempFile, "utf8", (err, contents) => {
                  try {
                    fs.unlink(tempFile, () => callback(err, contents));
                  } catch (e) {
                    callback(err, contents);
                  }
                });
              } catch (err) {
                callback(err, null);
              }
            },
            writeFile(contents, callback) {
              let tempFile = randomFileName();
              try {
                fs.writeFile(tempFile, contents, (err) => err ? callback(null) : callback(tempFile));
              } catch (e) {
                callback(null);
              }
            }
          }, (err, res) => err ? reject(err) : resolve(res)));
      },
      stop() { child.kill(); }
    });
  });
}

function runServiceSync(callback) {
  const [command, args] = esbuildCommandAndArgs();
  let stdin = new Uint8Array();
  const { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      if (stdin.length) throw new Error("Must run at most one command");
      stdin = bytes;
    },
    isSync: true,
    isBrowser: false
  });

  callback(service);

  const stdout = execFileSync(command, args.concat(`--service=${version}`), {
    cwd: process.cwd(),
    windowsHide: true,
    input: stdin,
    maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024
  });

  readFromStdout(stdout);
  afterClose();
}

const esbuildCommandAndArgs = () => {
  if (process.env.ESBUILD_BINARY_PATH) {
    return [path.resolve(process.env.ESBUILD_BINARY_PATH), []];
  }
  if (process.platform === "win32") {
    return [path.join(__dirname, "..", "esbuild.exe"), []];
  }
  const pathForYarn2 = path.join(__dirname, "..", "esbuild");
  if (fs.existsSync(pathForYarn2)) {
    return [pathForYarn2, []];
  }
  return [path.join(__dirname, "..", "bin", "esbuild"), []];
};

const isTTY = () => tty.isatty(2);

const version = "0.8.28";

// Exported functions for API usage
const build = (options) => {
  return startService().then(service =>
    service.build(options).then(result => {
      if (result.rebuild) {
        const oldDispose = result.rebuild.dispose;
        result.rebuild.dispose = () => {
          oldDispose();
          service.stop();
        };
      } else {
        service.stop();
      }
      return result;
    }).catch(error => {
      service.stop();
      throw error;
    }));
};

const serve = (serveOptions, buildOptions) => {
  return startService().then(service => service.serve(serveOptions, buildOptions).then(result => {
    result.wait.then(service.stop, service.stop);
    return result;
  }).catch(error => {
    service.stop();
    throw error;
  }))
};

const transform = (input, options) => {
  return startService().then(service => {
    const promise = service.transform(input + '', options);
    promise.then(service.stop, service.stop);
    return promise;
  });
};

const buildSync = (options) => {
  let result;
  runServiceSync(service =>
    service.buildOrServe('buildSync', null, options, isTTY(), (err, res) => {
      if (err) throw err;
      result = res;
    }));
  return result;
};

const transformSync = (input, options) => {
  let result;
  runServiceSync(service =>
    service.transform('transformSync', input + '', options || {}, isTTY(), {
      readFile(tempFile, callback) {
        try {
          const contents = fs.readFileSync(tempFile, "utf8");
          try {
            fs.unlinkSync(tempFile);
          } catch (e) { }
          callback(null, contents);
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          let tempFile = randomFileName();
          fs.writeFileSync(tempFile, contents);
          callback(tempFile);
        } catch (e) {
          callback(null);
        }
      }
    }, (err, res) => {
      if (err) throw err;
      result = res;
    }));
  return result;
};

function randomFileName() {
  return path.join(os.tmpdir(), `esbuild-${crypto.randomBytes(32).toString('hex')}`);
}

// Exports
__export(exports, {
  build,
  buildSync,
  serve,
  startService,
  transform,
  transformSync,
  version
});

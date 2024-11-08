const { defineProperty, keys, create } = Object;
const { setTimeout, clearTimeout } = global;
const { process, Promise, Error, Uint8Array, RegExp, JSON, Symbol, TextEncoder, TextDecoder, Buffer, require } = global;
const __defProp = defineProperty;
const __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
const __export = (target, all) => {
  __markAsModule(target);
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
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
    const step = (result) => {
      return result.done
        ? resolve(result.value)
        : Promise.resolve(result.value).then(fulfilled, rejected);
    };
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// lib/node.ts
__export(exports, {
  build: () => build,
  buildSync: () => buildSync,
  serve: () => serve,
  startService: () => startService,
  transform: () => transform,
  transformSync: () => transformSync,
  version: () => version,
});

// lib/stdio_protocol.ts
function encodePacket(packet) {
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
    } else if (Array.isArray(value)) {
      bb.write8(5);
      bb.write32(value.length);
      for (const item of value) {
        visit(item);
      }
    } else {
      const keys = Object.keys(value);
      bb.write8(6);
      bb.write32(keys.length);
      for (const key of keys) {
        bb.write(encodeUTF8(key));
        visit(value[key]);
      }
    }
  };
  const bb = new ByteBuffer();
  bb.write32(0);
  bb.write32(packet.id << 1 | +!packet.isRequest);
  visit(packet.value);
  writeUInt32LE(bb.buf, bb.len - 4, 0);
  return bb.buf.subarray(0, bb.len);
}

function decodePacket(bytes) {
  const visit = () => {
    switch (bb.read8()) {
      case 0:
        return null;
      case 1:
        return !!bb.read8();
      case 2:
        return bb.read32();
      case 3:
        return decodeUTF8(bb.read());
      case 4:
        return bb.read();
      case 5: {
        const count = bb.read32();
        const value = [];
        for (let i = 0; i < count; i++) {
          value.push(visit());
        }
        return value;
      }
      case 6: {
        const count = bb.read32();
        const value = {};
        for (let i = 0; i < count; i++) {
          value[decodeUTF8(bb.read())] = visit();
        }
        return value;
      }
      default:
        throw new Error('Invalid packet');
    }
  };
  const bb = new ByteBuffer(bytes);
  const id = bb.read32();
  const isRequest = (id & 1) === 0;
  id >>>= 1;
  const value = visit();
  if (bb.ptr !== bytes.length) {
    throw new Error('Invalid packet');
  }
  return { id, isRequest, value };
}

class ByteBuffer {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }
  _write(delta) {
    if (this.len + delta > this.buf.length) {
      const clone = new Uint8Array((this.len + delta) * 2);
      clone.set(this.buf);
      this.buf = clone;
    }
    this.len += delta;
    return this.len - delta;
  }
  write8(value) {
    const offset = this._write(1);
    this.buf[offset] = value;
  }
  write32(value) {
    const offset = this._write(4);
    writeUInt32LE(this.buf, value, offset);
  }
  write(bytes) {
    const offset = this._write(4 + bytes.length);
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
    const length = this.read32();
    const bytes = new Uint8Array(length);
    const ptr = this._read(bytes.length);
    bytes.set(this.buf.subarray(ptr, ptr + length));
    return bytes;
  }
}

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

function readUInt32LE(buffer, offset) {
  return buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24;
}

function writeUInt32LE(buffer, value, offset) {
  buffer[offset++] = value;
  buffer[offset++] = value >> 8;
  buffer[offset++] = value >> 16;
  buffer[offset++] = value >> 24;
}

// lib/common.ts
function validateTarget(target) {
  target += '';
  if (target.includes(',')) throw new Error(`Invalid target: ${target}`);
  return target;
}

const mustBeBoolean = (value) => typeof value === 'boolean' ? null : 'a boolean';
const mustBeString = (value) => typeof value === 'string' ? null : 'a string';
const mustBeRegExp = (value) => value instanceof RegExp ? null : 'a RegExp object';
const mustBeInteger = (value) => typeof value === 'number' && value === (value | 0) ? null : 'an integer';
const mustBeFunction = (value) => typeof value === 'function' ? null : 'a function';
const mustBeArray = (value) => Array.isArray(value) ? null : 'an array';
const mustBeObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'an object';
const mustBeObjectOrNull = (value) => typeof value === 'object' && !Array.isArray(value) ? null : 'an object or null';
const mustBeStringOrBoolean = (value) => typeof value === 'string' || typeof value === 'boolean' ? null : 'a string or a boolean';
const mustBeStringOrObject = (value) => typeof value === 'string' || typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'a string or an object';
const mustBeStringOrArray = (value) => typeof value === 'string' || Array.isArray(value) ? null : 'a string or an array';
const mustBeStringOrUint8Array = (value) => typeof value === 'string' || value instanceof Uint8Array ? null : 'a string or a Uint8Array';

function getFlag(object, keys, key, mustBeFn) {
  const value = object[key];
  keys[key + ''] = true;
  if (value === undefined) return undefined;
  const mustBe = mustBeFn(value);
  if (mustBe !== null) throw new Error(`"${key}" must be ${mustBe}`);
  return value;
}

function checkForInvalidFlags(object, keys, where) {
  for (const key in object) {
    if (!(key in keys)) {
      throw new Error(`Invalid option ${where}: "${key}"`);
    }
  }
}

function validateServiceOptions(options) {
  const keys = create(null);
  const wasmURL = getFlag(options, keys, 'wasmURL', mustBeString);
  const worker = getFlag(options, keys, 'worker', mustBeBoolean);
  checkForInvalidFlags(options, keys, 'in startService() call');
  return {
    wasmURL,
    worker,
  };
}

function pushLogFlags(flags, options, keys, isTTY, logLevelDefault) {
  const color = getFlag(options, keys, 'color', mustBeBoolean);
  const logLevel = getFlag(options, keys, 'logLevel', mustBeString);
  const errorLimit = getFlag(options, keys, 'errorLimit', mustBeInteger);
  if (color) flags.push(`--color=${color}`);
  else if (isTTY) flags.push('--color=true');
  flags.push(`--log-level=${logLevel || logLevelDefault}`);
  flags.push(`--error-limit=${errorLimit || 0}`);
}

function pushCommonFlags(flags, options, keys) {
  const target = getFlag(options, keys, 'target', mustBeStringOrArray);
  const format = getFlag(options, keys, 'format', mustBeString);
  const globalName = getFlag(options, keys, 'globalName', mustBeString);
  const minify = getFlag(options, keys, 'minify', mustBeBoolean);
  const minifySyntax = getFlag(options, keys, 'minifySyntax', mustBeBoolean);
  const minifyWhitespace = getFlag(options, keys, 'minifyWhitespace', mustBeBoolean);
  const minifyIdentifiers = getFlag(options, keys, 'minifyIdentifiers', mustBeBoolean);
  const charset = getFlag(options, keys, 'charset', mustBeString);
  const treeShaking = getFlag(options, keys, 'treeShaking', mustBeStringOrBoolean);
  const jsxFactory = getFlag(options, keys, 'jsxFactory', mustBeString);
  const jsxFragment = getFlag(options, keys, 'jsxFragment', mustBeString);
  const define = getFlag(options, keys, 'define', mustBeObject);
  const pure = getFlag(options, keys, 'pure', mustBeArray);
  const avoidTDZ = getFlag(options, keys, 'avoidTDZ', mustBeBoolean);
  const keepNames = getFlag(options, keys, 'keepNames', mustBeBoolean);
  const banner = getFlag(options, keys, 'banner', mustBeString);
  const footer = getFlag(options, keys, 'footer', mustBeString);

  if (target) {
    if (Array.isArray(target)) flags.push(`--target=${Array.from(target).map(validateTarget).join(',')}`);
    else flags.push(`--target=${validateTarget(target)}`);
  }
  if (format) flags.push(`--format=${format}`);
  if (globalName) flags.push(`--global-name=${globalName}`);
  if (minify) flags.push('--minify');
  if (minifySyntax) flags.push('--minify-syntax');
  if (minifyWhitespace) flags.push('--minify-whitespace');
  if (minifyIdentifiers) flags.push('--minify-identifiers');
  if (charset) flags.push(`--charset=${charset}`);
  if (treeShaking !== undefined && treeShaking !== true) flags.push(`--tree-shaking=${treeShaking}`);
  if (jsxFactory) flags.push(`--jsx-factory=${jsxFactory}`);
  if (jsxFragment) flags.push(`--jsx-fragment=${jsxFragment}`);
  if (define) {
    for (const key in define) {
      if (key.includes('=')) throw new Error(`Invalid define: ${key}`);
      flags.push(`--define:${key}=${define[key]}`);
    }
  }
  if (pure) for (const fn of pure) flags.push(`--pure:${fn}`);
  if (avoidTDZ) flags.push('--avoid-tdz');
  if (keepNames) flags.push('--keep-names');
  if (banner) flags.push(`--banner=${banner}`);
  if (footer) flags.push(`--footer=${footer}`);
}

function flagsForBuildOptions(callName, options, isTTY, logLevelDefault, writeDefault) {
  let { flags, keys, stdinContents, stdinResolveDir, write, incremental, plugins } = initializeBuildOptions();

  pushLogFlags(flags, options, keys, isTTY, logLevelDefault);
  pushCommonFlags(flags, options, keys);

  let sourcemap = getFlag(options, keys, 'sourcemap', mustBeStringOrBoolean);
  let sourcesContent = getFlag(options, keys, 'sourcesContent', mustBeBoolean);
  let bundle = getFlag(options, keys, 'bundle', mustBeBoolean);
  let splitting = getFlag(options, keys, 'splitting', mustBeBoolean);
  let metafile = getFlag(options, keys, 'metafile', mustBeString);
  let outfile = getFlag(options, keys, 'outfile', mustBeString);
  let outdir = getFlag(options, keys, 'outdir', mustBeString);
  let outbase = getFlag(options, keys, 'outbase', mustBeString);
  let platform = getFlag(options, keys, 'platform', mustBeString);
  let tsconfig = getFlag(options, keys, 'tsconfig', mustBeString);
  let resolveExtensions = getFlag(options, keys, 'resolveExtensions', mustBeArray);
  let mainFields = getFlag(options, keys, 'mainFields', mustBeArray);
  let external = getFlag(options, keys, 'external', mustBeArray);
  let loader = getFlag(options, keys, 'loader', mustBeObject);
  let outExtension = getFlag(options, keys, 'outExtension', mustBeObject);
  let publicPath = getFlag(options, keys, 'publicPath', mustBeString);
  let inject = getFlag(options, keys, 'inject', mustBeArray);
  let entryPoints = getFlag(options, keys, 'entryPoints', mustBeArray);
  let stdin = getFlag(options, keys, 'stdin', mustBeObject);
  write = write ?? writeDefault;
  incremental = getFlag(options, keys, 'incremental', mustBeBoolean) === true;
  plugins = getFlag(options, keys, 'plugins', mustBeArray);

  if (sourcemap) flags.push(`--sourcemap${sourcemap === true ? '' : `=${sourcemap}`}`);
  if (sourcesContent !== undefined) flags.push(`--sources-content=${sourcesContent}`);
  if (bundle) flags.push('--bundle');
  if (splitting) flags.push('--splitting');
  if (metafile) flags.push(`--metafile=${metafile}`);
  if (outfile) flags.push(`--outfile=${outfile}`);
  if (outdir) flags.push(`--outdir=${outdir}`);
  if (outbase) flags.push(`--outbase=${outbase}`);
  if (platform) flags.push(`--platform=${platform}`);
  if (tsconfig) flags.push(`--tsconfig=${tsconfig}`);
  if (resolveExtensions) flags.push(`--resolve-extensions=${resolveExtensions.join(',')}`);
  if (publicPath) flags.push(`--public-path=${publicPath}`);
  if (mainFields) flags.push(`--main-fields=${mainFields.join(',')}`);
  if (external) for (const name of external) flags.push(`--external:${name}`);
  if (inject) for (const path of inject) flags.push(`--inject:${path}`);
  if (loader) setupLoaderFlags(loader, keys, flags);
  if (outExtension) setupOutExtensionFlags(outExtension, keys, flags);

  if (stdin) {
    let stdinKeys = create(null);
    let contents = getFlag(stdin, stdinKeys, 'contents', mustBeString);
    let resolveDir = getFlag(stdin, stdinKeys, 'resolveDir', mustBeString);
    let sourcefile = getFlag(stdin, stdinKeys, 'sourcefile', mustBeString);
    let loader = getFlag(stdin, stdinKeys, 'loader', mustBeString);

    if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
    if (loader) flags.push(`--loader=${loader}`);
    if (resolveDir) stdinResolveDir = resolveDir + '';
    stdinContents = contents ? contents + '' : '';
  }

  return { flags, write, plugins, stdinContents, stdinResolveDir, incremental };
}

function flagsForTransformOptions(callName, options, isTTY, logLevelDefault) {
  const flags = [];
  const keys = create(null);
  pushLogFlags(flags, options, keys, isTTY, logLevelDefault);
  pushCommonFlags(flags, options, keys);

  const sourcemap = getFlag(options, keys, 'sourcemap', mustBeStringOrBoolean);
  const tsconfigRaw = getFlag(options, keys, 'tsconfigRaw', mustBeStringOrObject);
  const sourcefile = getFlag(options, keys, 'sourcefile', mustBeString);
  const loader = getFlag(options, keys, 'loader', mustBeString);

  if (sourcemap) flags.push(`--sourcemap=${sourcemap === true ? 'external' : sourcemap}`);
  if (tsconfigRaw) flags.push(`--tsconfig-raw=${typeof tsconfigRaw === 'string' ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
  if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
  if (loader) flags.push(`--loader=${loader}`);

  return flags;
}

function createChannel(streamIn) {
  const responseCallbacks = new Map();
  const pluginCallbacks = new Map();
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
      const swap = new Uint8Array(limit * 2);
      swap.set(stdout);
      stdout = swap;
    }
    stdout.set(chunk, stdoutUsed);
    stdoutUsed += chunk.length;
    let offset = 0;
    while (offset + 4 <= stdoutUsed) {
      const length = readUInt32LE(stdout, offset);
      if (offset + 4 + length > stdoutUsed) break;
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
    responseCallbacks.forEach((callback) => {
      callback('The service was stopped', null);
    });
    responseCallbacks.clear();
    serveCallbacks.forEach((callbacks) => {
      callbacks.onWait('The service was stopped');
    });
    serveCallbacks.clear();
  };

  const sendRequest = (value, callback) => {
    if (isClosed) return callback('The service is no longer running', null);
    const id = nextRequestID++;
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
        case 'resolve': {
          const callback = pluginCallbacks.get(request.key);
          sendResponse(id, yield callback(request));
          break;
        }
        case 'load': {
          const callback = pluginCallbacks.get(request.key);
          sendResponse(id, yield callback(request));
          break;
        }
        case 'serve-request': {
          const callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks && callbacks.onRequest) callbacks.onRequest(request.args);
          break;
        }
        case 'serve-wait': {
          const callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks) callbacks.onWait(request.error);
          break;
        }
        default:
          throw new Error(`Invalid command: ${request.command}`);
      }
    } catch (e) {
      sendResponse(id, { errors: [yield extractErrorMessageV8(e, streamIn)] });
    }
  });

  let isFirstPacket = true;

  const handleIncomingPacket = (bytes) => {
    if (isFirstPacket) {
      isFirstPacket = false;
      const binaryVersion = String.fromCharCode(...bytes);
      if (binaryVersion !== '0.8.28') {
        throw new Error(`Cannot start service: Host version "0.8.28" does not match binary version ${JSON.stringify(binaryVersion)}`);
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

    for (const item of plugins) {
      const keys = {};
      if (typeof item !== 'object') throw new Error(`Plugin at index ${i} must be an object`);
      const name = getFlag(item, keys, 'name', mustBeString);
      const setup = getFlag(item, keys, 'setup', mustBeFunction);
      if (typeof name !== 'string' || name === '') throw new Error(`Plugin at index ${i} is missing a name`);
      if (typeof setup !== 'function') throw new Error(`[${name}] Plugin is missing a setup function`);
      checkForInvalidFlags(item, keys, `on plugin ${JSON.stringify(name)}`);

      const plugin = {
        name,
        onResolve: [],
        onLoad: [],
      };
      i++;

      setup({
        onResolve(options, callback) {
          const keys = {};
          const filter = getFlag(options, keys, 'filter', mustBeRegExp);
          const namespace = getFlag(options, keys, 'namespace', mustBeString);
          checkForInvalidFlags(options, keys, `in onResolve() call for plugin ${JSON.stringify(name)}`);
          if (filter == null) throw new Error(`[${plugin.name}] onResolve() call is missing a filter`);

          const id = nextCallbackID++;
          onResolveCallbacks[id] = { name, callback };
          plugin.onResolve.push({ id, filter: filter.source, namespace: namespace || '' });
        },
        onLoad(options, callback) {
          const keys = {};
          const filter = getFlag(options, keys, 'filter', mustBeRegExp);
          const namespace = getFlag(options, keys, 'namespace', mustBeString);
          checkForInvalidFlags(options, keys, `in onLoad() call for plugin ${JSON.stringify(name)}`);
          if (filter == null) throw new Error(`[${plugin.name}] onLoad() call is missing a filter`);

          const id = nextCallbackID++;
          onLoadCallbacks[id] = { name, callback };
          plugin.onLoad.push({ id, filter: filter.source, namespace: namespace || '' });
        },
      });

      request.plugins.push(plugin);
    }

    pluginCallbacks.set(buildKey, (request) => __async(this, null, function* () {
      switch (request.command) {
        case 'resolve': {
          const response = {};
          for (const id of request.ids) {
            try {
              const { name, callback } = onResolveCallbacks[id];
              const result = yield callback({
                path: request.path,
                importer: request.importer,
                namespace: request.namespace,
                resolveDir: request.resolveDir,
              });
              if (result != null) {
                if (typeof result !== 'object') throw new Error(`Expected onResolve() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                assignResultToObject(result, keys, response, name, ['pluginName', 'path', 'namespace', 'external', 'errors', 'warnings']);
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
          const response = {};
          for (const id of request.ids) {
            try {
              const { name, callback } = onLoadCallbacks[id];
              const result = yield callback({
                path: request.path,
                namespace: request.namespace,
              });
              if (result != null) {
                if (typeof result !== 'object') throw new Error(`Expected onLoad() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                assignResultToObject(result, keys, response, name, ['pluginName', 'contents', 'resolveDir', 'loader', 'errors', 'warnings']);
                checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${JSON.stringify(name)}`);
                break;
              }
            } catch (e) {
              return { id, errors: [yield extractErrorMessageV8(e, streamIn)] };
            }
          }
          return response;
        }
        default:
          throw new Error(`Invalid command: ${request.command}`);
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
    let onWait;
    const wait = new Promise((resolve, reject) => {
      onWait = (error) => {
        serveCallbacks.delete(serveID);
        if (error !== null) reject(new Error(error));
        else resolve();
      };
    });

    request.serve = { serveID };
    checkForInvalidFlags(options, keys, `in serve() call`);
    if (port !== undefined) request.serve.port = port;
    if (host !== undefined) request.serve.host = host;

    serveCallbacks.set(serveID, {
      onRequest,
      onWait,
    });

    return {
      wait,
      stop() {
        sendRequest({ command: 'serve-stop', serveID }, () => {});
      },
    };
  };

  return {
    readFromStdout,
    afterClose,
    service: {
      buildOrServe(callName, serveOptions, options, isTTY, callback) {
        const logLevelDefault = 'info';
        try {
          const key = nextBuildKey++;
          let writeDefault = !streamIn.isBrowser;
          const { flags, write, plugins, stdinContents, stdinResolveDir, incremental } = flagsForBuildOptions(callName, options, isTTY, logLevelDefault, writeDefault);
          const request = { command: 'build', key, flags, write, stdinContents, stdinResolveDir, incremental };
          const serveData = serveOptions && buildServeData(serveOptions, request);
          const pluginCleanup = plugins && plugins.length > 0 && handlePlugins(plugins, request, key);
          let rebuild;

          const buildResponseToResult = (response, callback) => {
            const { errors, warnings } = response;
            if (errors.length > 0) return callback(failureErrorWithLog('Build failed', errors, warnings), null);

            const result = { warnings };
            if (response.outputFiles) result.outputFiles = response.outputFiles.map(convertOutputFiles);

            if (response.rebuildID !== undefined) {
              if (!rebuild) {
                let isDisposed = false;
                rebuild = () => new Promise((resolve, reject) => {
                  if (isDisposed || isClosed) throw new Error('Cannot rebuild');
                  sendRequest({ command: 'rebuild', rebuildID: response.rebuildID }, (error, response) => {
                    if (error) return callback(new Error(error), null);
                    buildResponseToResult(response, (error, result) => {
                      if (error) reject(error);
                      else resolve(result);
                    });
                  });
                });

                rebuild.dispose = () => {
                  isDisposed = true;
                  if (pluginCleanup) pluginCleanup();
                  sendRequest({ command: 'rebuild-dispose', rebuildID: response.rebuildID }, () => {});
                };
              }
              result.rebuild = rebuild;
            }

            return callback(null, result);
          };

          if (write && streamIn.isBrowser) throw new Error(`Cannot enable "write" in the browser`);
          if (incremental && streamIn.isSync) throw new Error(`Cannot use "incremental" with a synchronous build`);

          sendRequest(request, (error, response) => {
            if (error) return callback(new Error(error), null);
            if (serveData) {
              const serveResponse = response;
              const result = {
                port: serveResponse.port,
                host: serveResponse.host,
                wait: serveData.wait,
                stop: serveData.stop,
              };
              return callback(null, result);
            }
            if (pluginCleanup && !incremental) pluginCleanup();
            return buildResponseToResult(response, callback);
          });
        } catch (e) {
          handleCommandError(e, options, isTTY, logLevelDefault, callback);
        }
      },

      transform(callName, input, options, isTTY, fileSystem, callback) {
        const logLevelDefault = 'silent';
        let start = (inputPath) => {
          try {
            const flags = flagsForTransformOptions(callName, options, isTTY, logLevelDefault);
            const request = { command: 'transform', flags, inputFS: inputPath !== null, input: inputPath !== null ? inputPath : input };

            sendRequest(request, (error, response) => {
              if (error) return callback(new Error(error), null);

              const { errors, warnings } = response;
              let outstanding = 1;
              const next = () => --outstanding === 0 && callback(null, { warnings, code: response.code, map: response.map });

              if (errors.length > 0) return callback(failureErrorWithLog('Transform failed', errors, warnings), null);

              if (response.codeFS) {
                outstanding++;
                fileSystem.readFile(response.code, (err, contents) => {
                  if (err !== null) callback(err, null);
                  else {
                    response.code = contents;
                    next();
                  }
                });
              }
              
              if (response.mapFS) {
                outstanding++;
                fileSystem.readFile(response.map, (err, contents) => {
                  if (err !== null) callback(err, null);
                  else {
                    response.map = contents;
                    next();
                  }
                });
              }

              next();
            });
          } catch (e) {
            handleCommandError(e, options, isTTY, logLevelDefault, callback);
          }
        };

        if (input.length > 1024 * 1024) {
          const next = start;
          start = () => fileSystem.writeFile(input, next);
        }

        start(null);
      },
    },
  };
}

function extractErrorMessageV8(e, streamIn) {
  let text = 'Internal error';
  let location = null;

  try {
    text = (e && e.message || e) + '';
  } catch {
    // Do nothing
  }

  try {
    const stack = e.stack + '';
    const lines = stack.split('\n', 3);
    const at = '    at ';
    if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1].startsWith(at)) {
      let line = lines[1].slice(at.length);
      while (true) {
        let match = /^(\S+):(\d+):(\d+)$/.exec(line);
        if (match) {
          const contents = streamIn.readFileSync(match[1], 'utf8');
          const lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || '';
          location = {
            file: match[1],
            namespace: 'file',
            line: +match[2],
            column: +match[3] - 1,
            length: 0,
            lineText: lineText + '\n' + lines.slice(1).join('\n'),
          };
          break;
        }
        break;
      }
    }
  } catch {
    // Do nothing
  }

  return { text, location };
}

function failureErrorWithLog(text, errors, warnings) {
  let summary = errors.length < 1 ? '' : ` with ${errors.length} error${errors.length < 2 ? '' : 's'}:` +
    errors.slice(0, 5 + 1).map((e, i) => {
      if (i === 5) return '\n...';
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
      file: getFlag(location, keys, 'file', mustBeString) || '',
      namespace: getFlag(location, keys, 'namespace', mustBeString) || '',
      line: getFlag(location, keys, 'line', mustBeInteger) || 0,
      column: getFlag(location, keys, 'column', mustBeInteger) || 0,
      length: getFlag(location, keys, 'length', mustBeInteger) || 0,
      lineText: getFlag(location, keys, 'lineText', mustBeString) || '',
    } : null;

    return { text: text || '', location: locationClone };
  });
}

function convertOutputFiles({ path, contents }) {
  let text = null;
  return {
    path,
    contents,
    get text() {
      if (text === null) text = decodeUTF8(contents);
      return text;
    },
  };
}

function referenceCountedService(getwd, startService) {
  const entries = new Map();
  return (options) => __async(this, null, function* () {
    const cwd = getwd();
    const optionsJSON = JSON.stringify(options || {});
    const key = `${optionsJSON} ${cwd}`;
    let entry = entries.get(key);
    let didStop = false;

    const checkWasStopped = () => {
      if (didStop) throw new Error('The service was stopped');
    };

    const isLastStop = () => {
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
    entry.refCount++;

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
        },
      };
    } catch (e) {
      isLastStop();
      throw e;
    }
  });
}

// lib/node.ts
const child_process = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');
const tty = require('tty');

const esbuildCommandAndArgs = () => {
  if (process.env.ESBUILD_BINARY_PATH) {
    return [path.resolve(process.env.ESBUILD_BINARY_PATH), []];
  }
  if (false) {
    return ['node', [path.join(__dirname, '..', 'bin', 'esbuild')]];
  }
  if (process.platform === 'win32') {
    return [path.join(__dirname, '..', 'esbuild.exe'), []];
  }
  const pathForYarn2 = path.join(__dirname, '..', 'esbuild');
  if (fs.existsSync(pathForYarn2)) {
    return [pathForYarn2, []];
  }
  return [path.join(__dirname, '..', 'bin', 'esbuild'), []];
};

const isTTY = () => tty.isatty(2);
const version = '0.8.28';

const build = (options) => {
  return startService().then((service) => {
    return service.build(options).then((result) => {
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
    }).catch((error) => {
      service.stop();
      throw error;
    });
  });
};

const serve = (serveOptions, buildOptions) => {
  return startService().then((service) => {
    return service.serve(serveOptions, buildOptions).then((result) => {
      result.wait.then(service.stop, service.stop);
      return result;
    }).catch((error) => {
      service.stop();
      throw error;
    });
  });
};

const transform = (input, options) => {
  input = String(input);
  return startService().then((service) => {
    const promise = service.transform(input, options);
    promise.then(service.stop, service.stop);
    return promise;
  });
};

const buildSync = (options) => {
  let result;
  runServiceSync((service) => service.buildOrServe('buildSync', null, options, isTTY(), (err, res) => {
    if (err) throw err;
    result = res;
  }));
  return result;
};

const transformSync = (input, options) => {
  input = String(input);
  let result;
  runServiceSync((service) => service.transform('transformSync', input, options || {}, isTTY(), {
    readFile(tempFile, callback) {
      try {
        const contents = fs.readFileSync(tempFile, 'utf8');
        try {
          fs.unlinkSync(tempFile);
        } catch {}
        callback(null, contents);
      } catch (err) {
        callback(err, null);
      }
    },
    writeFile(contents, callback) {
      try {
        const tempFile = randomFileName();
        fs.writeFileSync(tempFile, contents);
        callback(tempFile);
      } catch {
        callback(null);
      }
    },
  }, (err, res) => {
    if (err) throw err;
    result = res;
  }));
  return result;
};

const startService = referenceCountedService(() => process.cwd(), (options) => {
  options = validateServiceOptions(options || {});
  if (options.wasmURL) throw new Error('The "wasmURL" option only works in the browser');
  if (options.worker) throw new Error('The "worker" option only works in the browser');

  const [command, args] = esbuildCommandAndArgs();
  const child = child_process.spawn(command, args.concat(`--service=${version}`), {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      child.stdin.write(bytes);
    },
    readFileSync: fs.readFileSync,
    isSync: false,
    isBrowser: false,
  });

  child.stdout.on('data', readFromStdout);
  child.stdout.on('end', afterClose);

  return Promise.resolve({
    build: (options) => new Promise((resolve, reject) => {
      service.buildOrServe('build', null, options, isTTY(), (err, res) => (err ? reject(err) : resolve(res)));
    }),
    serve: (serveOptions, buildOptions) => {
      if (!serveOptions || typeof serveOptions !== 'object') throw new Error('The first argument must be an object');
      return new Promise((resolve, reject) => {
        service.buildOrServe('serve', serveOptions, buildOptions, isTTY(), (err, res) => (err ? reject(err) : resolve(res)));
      });
    },
    transform: (input, options) => {
      input = String(input);
      return new Promise((resolve, reject) => {
        service.transform('transform', input, options || {}, isTTY(), {
          readFile(tempFile, callback) {
            try {
              fs.readFile(tempFile, 'utf8', (err, contents) => {
                try {
                  fs.unlink(tempFile, () => callback(err, contents));
                } catch {}
                callback(err, contents);
              });
            } catch (err) {
              callback(err, null);
            }
          },
          writeFile(contents, callback) {
            try {
              const tempFile = randomFileName();
              fs.writeFile(tempFile, contents, (err) => (err !== null ? callback(null) : callback(tempFile)));
            } catch {
              callback(null);
            }
          },
        }, (err, res) => (err ? reject(err) : resolve(res)));
      });
    },
    stop() {
      child.kill();
    }
  });
});

const runServiceSync = (callback) => {
  const [command, args] = esbuildCommandAndArgs();
  let stdin = new Uint8Array();

  const { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      if (stdin.length !== 0) throw new Error('Must run at most one command');
      stdin = bytes;
    },
    isSync: true,
    isBrowser: false,
  });

  callback(service);

  const stdout = child_process.execFileSync(command, args.concat(`--service=${version}`), {
    cwd: process.cwd(),
    windowsHide: true,
    input: stdin,
    maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024,
  });

  readFromStdout(stdout);
  afterClose();
};

const randomFileName = () => {
  return path.join(os.tmpdir(), `esbuild-${crypto.randomBytes(32).toString('hex')}`);
};

function initializeBuildOptions() {
  return { flags: [], keys: create(null), stdinContents: null, stdinResolveDir: null, write: null, incremental: false, plugins: null };
}

function handleCommandError(e, options, isTTY, logLevelDefault, callback) {
  try {
    pushLogFlags([], options, {}, isTTY, logLevelDefault);
  } catch {}
  sendRequest({ command: 'error', flags: [], error: extractErrorMessageV8(e, {}) }, () => {
    callback(e, null);
  });
}

function setupLoaderFlags(loader, keys, flags) {
  for (const ext in loader) {
    if (ext.includes('=')) throw new Error(`Invalid loader extension: ${ext}`);
    flags.push(`--loader:${ext}=${loader[ext]}`);
  }
}

function setupOutExtensionFlags(outExtension, keys, flags) {
  for (const ext in outExtension) {
    if (ext.includes('=')) throw new Error(`Invalid out extension: ${ext}`);
    flags.push(`--out-extension:${ext}=${outExtension[ext]}`);
  }
}

function assignResultToObject(result, keys, response, name, fields) {
  for (const field of fields) {
    const value = getFlag(result, keys, field, getValidator(field));
    if (value !== null) response[field] = field === 'errors' || field === 'warnings' ? sanitizeMessages(value, field) : value;
  }
}

function getValidator(field) {
  switch (field) {
    case 'pluginName': return mustBeString;
    case 'path': return mustBeString;
    case 'namespace': return mustBeString;
    case 'external': return mustBeBoolean;
    case 'errors':
    case 'warnings': return mustBeArray;
    case 'contents': return mustBeStringOrUint8Array;
    case 'resolveDir': return mustBeString;
    case 'loader': return mustBeString;
  }
}

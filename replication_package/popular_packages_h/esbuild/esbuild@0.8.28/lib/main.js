var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (result) => {
      return result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected);
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
  version: () => version
});

// lib/stdio_protocol.ts
function encodePacket(packet) {
  let visit = (value) => {
    if (value === null) {
      bb.write8(0);
    } else if (typeof value === "boolean") {
      bb.write8(1);
      bb.write8(+value);
    } else if (typeof value === "number") {
      bb.write8(2);
      bb.write32(value | 0);
    } else if (typeof value === "string") {
      bb.write8(3);
      bb.write(encodeUTF8(value));
    } else if (value instanceof Uint8Array) {
      bb.write8(4);
      bb.write(value);
    } else if (value instanceof Array) {
      bb.write8(5);
      bb.write32(value.length);
      for (let item of value) {
        visit(item);
      }
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
  let bb = new ByteBuffer();
  bb.write32(0);
  bb.write32(packet.id << 1 | +!packet.isRequest);
  visit(packet.value);
  writeUInt32LE(bb.buf, bb.len - 4, 0);
  return bb.buf.subarray(0, bb.len);
}
function decodePacket(bytes) {
  let visit = () => {
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
        let count = bb.read32();
        let value2 = [];
        for (let i = 0; i < count; i++) {
          value2.push(visit());
        }
        return value2;
      }
      case 6: {
        let count = bb.read32();
        let value2 = {};
        for (let i = 0; i < count; i++) {
          value2[decodeUTF8(bb.read())] = visit();
        }
        return value2;
      }
      default:
        throw new Error("Invalid packet");
    }
  };
  let bb = new ByteBuffer(bytes);
  let id = bb.read32();
  let isRequest = (id & 1) === 0;
  id >>>= 1;
  let value = visit();
  if (bb.ptr !== bytes.length) {
    throw new Error("Invalid packet");
  }
  return {id, isRequest, value};
}
var ByteBuffer = class {
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
      throw new Error("Invalid packet");
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
};
var encodeUTF8;
var decodeUTF8;
if (typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined") {
  let encoder = new TextEncoder();
  let decoder = new TextDecoder();
  encodeUTF8 = (text) => encoder.encode(text);
  decodeUTF8 = (bytes) => decoder.decode(bytes);
} else if (typeof Buffer !== "undefined") {
  encodeUTF8 = (text) => Buffer.from(text);
  decodeUTF8 = (bytes) => Buffer.from(bytes).toString();
} else {
  throw new Error("No UTF-8 codec found");
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
  target += "";
  if (target.indexOf(",") >= 0)
    throw new Error(`Invalid target: ${target}`);
  return target;
}
var mustBeBoolean = (value) => typeof value === "boolean" ? null : "a boolean";
var mustBeString = (value) => typeof value === "string" ? null : "a string";
var mustBeRegExp = (value) => value instanceof RegExp ? null : "a RegExp object";
var mustBeInteger = (value) => typeof value === "number" && value === (value | 0) ? null : "an integer";
var mustBeFunction = (value) => typeof value === "function" ? null : "a function";
var mustBeArray = (value) => Array.isArray(value) ? null : "an array";
var mustBeObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? null : "an object";
var mustBeObjectOrNull = (value) => typeof value === "object" && !Array.isArray(value) ? null : "an object or null";
var mustBeStringOrBoolean = (value) => typeof value === "string" || typeof value === "boolean" ? null : "a string or a boolean";
var mustBeStringOrObject = (value) => typeof value === "string" || typeof value === "object" && value !== null && !Array.isArray(value) ? null : "a string or an object";
var mustBeStringOrArray = (value) => typeof value === "string" || Array.isArray(value) ? null : "a string or an array";
var mustBeStringOrUint8Array = (value) => typeof value === "string" || value instanceof Uint8Array ? null : "a string or a Uint8Array";
function getFlag(object, keys, key, mustBeFn) {
  let value = object[key];
  keys[key + ""] = true;
  if (value === void 0)
    return void 0;
  let mustBe = mustBeFn(value);
  if (mustBe !== null)
    throw new Error(`"${key}" must be ${mustBe}`);
  return value;
}
function checkForInvalidFlags(object, keys, where) {
  for (let key in object) {
    if (!(key in keys)) {
      throw new Error(`Invalid option ${where}: "${key}"`);
    }
  }
}
function validateServiceOptions(options) {
  let keys = Object.create(null);
  let wasmURL = getFlag(options, keys, "wasmURL", mustBeString);
  let worker = getFlag(options, keys, "worker", mustBeBoolean);
  checkForInvalidFlags(options, keys, "in startService() call");
  return {
    wasmURL,
    worker
  };
}
function pushLogFlags(flags, options, keys, isTTY2, logLevelDefault) {
  let color = getFlag(options, keys, "color", mustBeBoolean);
  let logLevel = getFlag(options, keys, "logLevel", mustBeString);
  let errorLimit = getFlag(options, keys, "errorLimit", mustBeInteger);
  if (color)
    flags.push(`--color=${color}`);
  else if (isTTY2)
    flags.push(`--color=true`);
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
  if (target) {
    if (Array.isArray(target))
      flags.push(`--target=${Array.from(target).map(validateTarget).join(",")}`);
    else
      flags.push(`--target=${validateTarget(target)}`);
  }
  if (format)
    flags.push(`--format=${format}`);
  if (globalName)
    flags.push(`--global-name=${globalName}`);
  if (minify)
    flags.push("--minify");
  if (minifySyntax)
    flags.push("--minify-syntax");
  if (minifyWhitespace)
    flags.push("--minify-whitespace");
  if (minifyIdentifiers)
    flags.push("--minify-identifiers");
  if (charset)
    flags.push(`--charset=${charset}`);
  if (treeShaking !== void 0 && treeShaking !== true)
    flags.push(`--tree-shaking=${treeShaking}`);
  if (jsxFactory)
    flags.push(`--jsx-factory=${jsxFactory}`);
  if (jsxFragment)
    flags.push(`--jsx-fragment=${jsxFragment}`);
  if (define) {
    for (let key in define) {
      if (key.indexOf("=") >= 0)
        throw new Error(`Invalid define: ${key}`);
      flags.push(`--define:${key}=${define[key]}`);
    }
  }
  if (pure)
    for (let fn of pure)
      flags.push(`--pure:${fn}`);
  if (avoidTDZ)
    flags.push(`--avoid-tdz`);
  if (keepNames)
    flags.push(`--keep-names`);
  if (banner)
    flags.push(`--banner=${banner}`);
  if (footer)
    flags.push(`--footer=${footer}`);
}
function flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault) {
  var _a;
  let flags = [];
  let keys = Object.create(null);
  let stdinContents = null;
  let stdinResolveDir = null;
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);
  let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  let sourcesContent = getFlag(options, keys, "sourcesContent", mustBeBoolean);
  let bundle = getFlag(options, keys, "bundle", mustBeBoolean);
  let splitting = getFlag(options, keys, "splitting", mustBeBoolean);
  let metafile = getFlag(options, keys, "metafile", mustBeString);
  let outfile = getFlag(options, keys, "outfile", mustBeString);
  let outdir = getFlag(options, keys, "outdir", mustBeString);
  let outbase = getFlag(options, keys, "outbase", mustBeString);
  let platform = getFlag(options, keys, "platform", mustBeString);
  let tsconfig = getFlag(options, keys, "tsconfig", mustBeString);
  let resolveExtensions = getFlag(options, keys, "resolveExtensions", mustBeArray);
  let mainFields = getFlag(options, keys, "mainFields", mustBeArray);
  let external = getFlag(options, keys, "external", mustBeArray);
  let loader = getFlag(options, keys, "loader", mustBeObject);
  let outExtension = getFlag(options, keys, "outExtension", mustBeObject);
  let publicPath = getFlag(options, keys, "publicPath", mustBeString);
  let inject = getFlag(options, keys, "inject", mustBeArray);
  let entryPoints = getFlag(options, keys, "entryPoints", mustBeArray);
  let stdin = getFlag(options, keys, "stdin", mustBeObject);
  let write = (_a = getFlag(options, keys, "write", mustBeBoolean)) != null ? _a : writeDefault;
  let incremental = getFlag(options, keys, "incremental", mustBeBoolean) === true;
  let plugins = getFlag(options, keys, "plugins", mustBeArray);
  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  if (sourcemap)
    flags.push(`--sourcemap${sourcemap === true ? "" : `=${sourcemap}`}`);
  if (sourcesContent !== void 0)
    flags.push(`--sources-content=${sourcesContent}`);
  if (bundle)
    flags.push("--bundle");
  if (splitting)
    flags.push("--splitting");
  if (metafile)
    flags.push(`--metafile=${metafile}`);
  if (outfile)
    flags.push(`--outfile=${outfile}`);
  if (outdir)
    flags.push(`--outdir=${outdir}`);
  if (outbase)
    flags.push(`--outbase=${outbase}`);
  if (platform)
    flags.push(`--platform=${platform}`);
  if (tsconfig)
    flags.push(`--tsconfig=${tsconfig}`);
  if (resolveExtensions) {
    let values = [];
    for (let value of resolveExtensions) {
      value += "";
      if (value.indexOf(",") >= 0)
        throw new Error(`Invalid resolve extension: ${value}`);
      values.push(value);
    }
    flags.push(`--resolve-extensions=${values.join(",")}`);
  }
  if (publicPath)
    flags.push(`--public-path=${publicPath}`);
  if (mainFields) {
    let values = [];
    for (let value of mainFields) {
      value += "";
      if (value.indexOf(",") >= 0)
        throw new Error(`Invalid main field: ${value}`);
      values.push(value);
    }
    flags.push(`--main-fields=${values.join(",")}`);
  }
  if (external)
    for (let name of external)
      flags.push(`--external:${name}`);
  if (inject)
    for (let path2 of inject)
      flags.push(`--inject:${path2}`);
  if (loader) {
    for (let ext in loader) {
      if (ext.indexOf("=") >= 0)
        throw new Error(`Invalid loader extension: ${ext}`);
      flags.push(`--loader:${ext}=${loader[ext]}`);
    }
  }
  if (outExtension) {
    for (let ext in outExtension) {
      if (ext.indexOf("=") >= 0)
        throw new Error(`Invalid out extension: ${ext}`);
      flags.push(`--out-extension:${ext}=${outExtension[ext]}`);
    }
  }
  if (entryPoints) {
    for (let entryPoint of entryPoints) {
      entryPoint += "";
      if (entryPoint.startsWith("-"))
        throw new Error(`Invalid entry point: ${entryPoint}`);
      flags.push(entryPoint);
    }
  }
  if (stdin) {
    let stdinKeys = Object.create(null);
    let contents = getFlag(stdin, stdinKeys, "contents", mustBeString);
    let resolveDir = getFlag(stdin, stdinKeys, "resolveDir", mustBeString);
    let sourcefile = getFlag(stdin, stdinKeys, "sourcefile", mustBeString);
    let loader2 = getFlag(stdin, stdinKeys, "loader", mustBeString);
    checkForInvalidFlags(stdin, stdinKeys, 'in "stdin" object');
    if (sourcefile)
      flags.push(`--sourcefile=${sourcefile}`);
    if (loader2)
      flags.push(`--loader=${loader2}`);
    if (resolveDir)
      stdinResolveDir = resolveDir + "";
    stdinContents = contents ? contents + "" : "";
  }
  return {flags, write, plugins, stdinContents, stdinResolveDir, incremental};
}
function flagsForTransformOptions(callName, options, isTTY2, logLevelDefault) {
  let flags = [];
  let keys = Object.create(null);
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);
  let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  let tsconfigRaw = getFlag(options, keys, "tsconfigRaw", mustBeStringOrObject);
  let sourcefile = getFlag(options, keys, "sourcefile", mustBeString);
  let loader = getFlag(options, keys, "loader", mustBeString);
  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  if (sourcemap)
    flags.push(`--sourcemap=${sourcemap === true ? "external" : sourcemap}`);
  if (tsconfigRaw)
    flags.push(`--tsconfig-raw=${typeof tsconfigRaw === "string" ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
  if (sourcefile)
    flags.push(`--sourcefile=${sourcefile}`);
  if (loader)
    flags.push(`--loader=${loader}`);
  return flags;
}
function createChannel(streamIn) {
  let responseCallbacks = new Map();
  let pluginCallbacks = new Map();
  let serveCallbacks = new Map();
  let nextServeID = 0;
  let isClosed = false;
  let nextRequestID = 0;
  let nextBuildKey = 0;
  let stdout = new Uint8Array(16 * 1024);
  let stdoutUsed = 0;
  let readFromStdout = (chunk) => {
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
  let afterClose = () => {
    isClosed = true;
    for (let callback of responseCallbacks.values()) {
      callback("The service was stopped", null);
    }
    responseCallbacks.clear();
    for (let callbacks of serveCallbacks.values()) {
      callbacks.onWait("The service was stopped");
    }
    serveCallbacks.clear();
  };
  let sendRequest = (value, callback) => {
    if (isClosed)
      return callback("The service is no longer running", null);
    let id = nextRequestID++;
    responseCallbacks.set(id, callback);
    streamIn.writeToStdin(encodePacket({id, isRequest: true, value}));
  };
  let sendResponse = (id, value) => {
    if (isClosed)
      throw new Error("The service is no longer running");
    streamIn.writeToStdin(encodePacket({id, isRequest: false, value}));
  };
  let handleRequest = (id, request) => __async(this, null, function* () {
    try {
      switch (request.command) {
        case "resolve": {
          let callback = pluginCallbacks.get(request.key);
          sendResponse(id, yield callback(request));
          break;
        }
        case "load": {
          let callback = pluginCallbacks.get(request.key);
          sendResponse(id, yield callback(request));
          break;
        }
        case "serve-request": {
          let callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks && callbacks.onRequest)
            callbacks.onRequest(request.args);
          break;
        }
        case "serve-wait": {
          let callbacks = serveCallbacks.get(request.serveID);
          sendResponse(id, {});
          if (callbacks)
            callbacks.onWait(request.error);
          break;
        }
        default:
          throw new Error(`Invalid command: ` + request.command);
      }
    } catch (e) {
      sendResponse(id, {errors: [yield extractErrorMessageV8(e, streamIn)]});
    }
  });
  let isFirstPacket = true;
  let handleIncomingPacket = (bytes) => {
    if (isFirstPacket) {
      isFirstPacket = false;
      let binaryVersion = String.fromCharCode(...bytes);
      if (binaryVersion !== "0.8.28") {
        throw new Error(`Cannot start service: Host version "${"0.8.28"}" does not match binary version ${JSON.stringify(binaryVersion)}`);
      }
      return;
    }
    let packet = decodePacket(bytes);
    if (packet.isRequest) {
      handleRequest(packet.id, packet.value);
    } else {
      let callback = responseCallbacks.get(packet.id);
      responseCallbacks.delete(packet.id);
      if (packet.value.error)
        callback(packet.value.error, {});
      else
        callback(null, packet.value);
    }
  };
  let handlePlugins = (plugins, request, buildKey) => {
    if (streamIn.isSync)
      throw new Error("Cannot use plugins in synchronous API calls");
    let onResolveCallbacks = {};
    let onLoadCallbacks = {};
    let nextCallbackID = 0;
    let i = 0;
    request.plugins = [];
    for (let item of plugins) {
      let keys = {};
      if (typeof item !== "object")
        throw new Error(`Plugin at index ${i} must be an object`);
      let name = getFlag(item, keys, "name", mustBeString);
      let setup = getFlag(item, keys, "setup", mustBeFunction);
      if (typeof name !== "string" || name === "")
        throw new Error(`Plugin at index ${i} is missing a name`);
      if (typeof setup !== "function")
        throw new Error(`[${name}] Plugin is missing a setup function`);
      checkForInvalidFlags(item, keys, `on plugin ${JSON.stringify(name)}`);
      let plugin = {
        name,
        onResolve: [],
        onLoad: []
      };
      i++;
      setup({
        onResolve(options, callback) {
          let keys2 = {};
          let filter = getFlag(options, keys2, "filter", mustBeRegExp);
          let namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${JSON.stringify(name)}`);
          if (filter == null)
            throw new Error(`[${plugin.name}] onResolve() call is missing a filter`);
          let id = nextCallbackID++;
          onResolveCallbacks[id] = {name, callback};
          plugin.onResolve.push({id, filter: filter.source, namespace: namespace || ""});
        },
        onLoad(options, callback) {
          let keys2 = {};
          let filter = getFlag(options, keys2, "filter", mustBeRegExp);
          let namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${JSON.stringify(name)}`);
          if (filter == null)
            throw new Error(`[${plugin.name}] onLoad() call is missing a filter`);
          let id = nextCallbackID++;
          onLoadCallbacks[id] = {name, callback};
          plugin.onLoad.push({id, filter: filter.source, namespace: namespace || ""});
        }
      });
      request.plugins.push(plugin);
    }
    pluginCallbacks.set(buildKey, (request2) => __async(this, null, function* () {
      switch (request2.command) {
        case "resolve": {
          let response = {};
          for (let id of request2.ids) {
            try {
              let {name, callback} = onResolveCallbacks[id];
              let result = yield callback({
                path: request2.path,
                importer: request2.importer,
                namespace: request2.namespace,
                resolveDir: request2.resolveDir
              });
              if (result != null) {
                if (typeof result !== "object")
                  throw new Error(`Expected onResolve() callback in plugin ${JSON.stringify(name)} to return an object`);
                let keys = {};
                let pluginName = getFlag(result, keys, "pluginName", mustBeString);
                let path2 = getFlag(result, keys, "path", mustBeString);
                let namespace = getFlag(result, keys, "namespace", mustBeString);
                let external = getFlag(result, keys, "external", mustBeBoolean);
                let errors = getFlag(result, keys, "errors", mustBeArray);
                let warnings = getFlag(result, keys, "warnings", mustBeArray);
                checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${JSON.stringify(name)}`);
                response.id = id;
                if (pluginName != null)
                  response.pluginName = pluginName;
                if (path2 != null)
                  response.path = path2;
                if (namespace != null)
                  response.namespace = namespace;
                if (external != null)
                  response.external = external;
                if (errors != null)
                  response.errors = sanitizeMessages(errors, "errors");
                if (warnings != null)
                  response.warnings = sanitizeMessages(warnings, "warnings");
                break;
              }
            } catch (e) {
              return {id, errors: [yield extractErrorMessageV8(e, streamIn)]};
            }
          }
          return response;
        }
        case "load": {
          let response = {};
          for (let id of request2.ids) {
            try {
              let {name, callback} = onLoadCallbacks[id];
              let result = yield callback({
                path: request2.path,
                namespace: request2.namespace
              });
              if (result != null) {
                if (typeof result !== "object")
                  throw new Error(`Expected onLoad() callback in plugin ${JSON.stringify(name)} to return an object`);
                let keys = {};
                let pluginName = getFlag(result, keys, "pluginName", mustBeString);
                let contents = getFlag(result, keys, "contents", mustBeStringOrUint8Array);
                let resolveDir = getFlag(result, keys, "resolveDir", mustBeString);
                let loader = getFlag(result, keys, "loader", mustBeString);
                let errors = getFlag(result, keys, "errors", mustBeArray);
                let warnings = getFlag(result, keys, "warnings", mustBeArray);
                checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${JSON.stringify(name)}`);
                response.id = id;
                if (pluginName != null)
                  response.pluginName = pluginName;
                if (contents instanceof Uint8Array)
                  response.contents = contents;
                else if (contents != null)
                  response.contents = encodeUTF8(contents);
                if (resolveDir != null)
                  response.resolveDir = resolveDir;
                if (loader != null)
                  response.loader = loader;
                if (errors != null)
                  response.errors = sanitizeMessages(errors, "errors");
                if (warnings != null)
                  response.warnings = sanitizeMessages(warnings, "warnings");
                break;
              }
            } catch (e) {
              return {id, errors: [yield extractErrorMessageV8(e, streamIn)]};
            }
          }
          return response;
        }
        default:
          throw new Error(`Invalid command: ` + request2.command);
      }
    }));
    return () => pluginCallbacks.delete(buildKey);
  };
  let buildServeData = (options, request) => {
    let keys = {};
    let port = getFlag(options, keys, "port", mustBeInteger);
    let host = getFlag(options, keys, "host", mustBeString);
    let onRequest = getFlag(options, keys, "onRequest", mustBeFunction);
    let serveID = nextServeID++;
    let onWait;
    let wait = new Promise((resolve, reject) => {
      onWait = (error) => {
        serveCallbacks.delete(serveID);
        if (error !== null)
          reject(new Error(error));
        else
          resolve();
      };
    });
    request.serve = {serveID};
    checkForInvalidFlags(options, keys, `in serve() call`);
    if (port !== void 0)
      request.serve.port = port;
    if (host !== void 0)
      request.serve.host = host;
    serveCallbacks.set(serveID, {
      onRequest,
      onWait
    });
    return {
      wait,
      stop() {
        sendRequest({command: "serve-stop", serveID}, () => {
        });
      }
    };
  };
  return {
    readFromStdout,
    afterClose,
    service: {
      buildOrServe(callName, serveOptions, options, isTTY2, callback) {
        const logLevelDefault = "info";
        try {
          let key = nextBuildKey++;
          let writeDefault = !streamIn.isBrowser;
          let {flags, write, plugins, stdinContents, stdinResolveDir, incremental} = flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault);
          let request = {command: "build", key, flags, write, stdinContents, stdinResolveDir, incremental};
          let serve2 = serveOptions && buildServeData(serveOptions, request);
          let pluginCleanup = plugins && plugins.length > 0 && handlePlugins(plugins, request, key);
          let rebuild;
          let buildResponseToResult = (response, callback2) => {
            let errors = response.errors;
            let warnings = response.warnings;
            if (errors.length > 0)
              return callback2(failureErrorWithLog("Build failed", errors, warnings), null);
            let result = {warnings};
            if (response.outputFiles)
              result.outputFiles = response.outputFiles.map(convertOutputFiles);
            if (response.rebuildID !== void 0) {
              if (!rebuild) {
                let isDisposed = false;
                rebuild = () => new Promise((resolve, reject) => {
                  if (isDisposed || isClosed)
                    throw new Error("Cannot rebuild");
                  sendRequest({command: "rebuild", rebuildID: response.rebuildID}, (error2, response2) => {
                    if (error2)
                      return callback2(new Error(error2), null);
                    buildResponseToResult(response2, (error3, result3) => {
                      if (error3)
                        reject(error3);
                      else
                        resolve(result3);
                    });
                  });
                });
                rebuild.dispose = () => {
                  isDisposed = true;
                  if (pluginCleanup)
                    pluginCleanup();
                  sendRequest({command: "rebuild-dispose", rebuildID: response.rebuildID}, () => {
                  });
                };
              }
              result.rebuild = rebuild;
            }
            return callback2(null, result);
          };
          if (write && streamIn.isBrowser)
            throw new Error(`Cannot enable "write" in the browser`);
          if (incremental && streamIn.isSync)
            throw new Error(`Cannot use "incremental" with a synchronous build`);
          sendRequest(request, (error, response) => {
            if (error)
              return callback(new Error(error), null);
            if (serve2) {
              let serveResponse = response;
              let result = {
                port: serveResponse.port,
                host: serveResponse.host,
                wait: serve2.wait,
                stop: serve2.stop
              };
              return callback(null, result);
            }
            if (pluginCleanup && !incremental)
              pluginCleanup();
            return buildResponseToResult(response, callback);
          });
        } catch (e) {
          let flags = [];
          try {
            pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
          } catch (e2) {
          }
          sendRequest({command: "error", flags, error: extractErrorMessageV8(e, streamIn)}, () => {
            callback(e, null);
          });
        }
      },
      transform(callName, input, options, isTTY2, fs2, callback) {
        const logLevelDefault = "silent";
        let start = (inputPath) => {
          try {
            let flags = flagsForTransformOptions(callName, options, isTTY2, logLevelDefault);
            let request = {
              command: "transform",
              flags,
              inputFS: inputPath !== null,
              input: inputPath !== null ? inputPath : input
            };
            sendRequest(request, (error, response) => {
              if (error)
                return callback(new Error(error), null);
              let errors = response.errors;
              let warnings = response.warnings;
              let outstanding = 1;
              let next = () => --outstanding === 0 && callback(null, {warnings, code: response.code, map: response.map});
              if (errors.length > 0)
                return callback(failureErrorWithLog("Transform failed", errors, warnings), null);
              if (response.codeFS) {
                outstanding++;
                fs2.readFile(response.code, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.code = contents;
                    next();
                  }
                });
              }
              if (response.mapFS) {
                outstanding++;
                fs2.readFile(response.map, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.map = contents;
                    next();
                  }
                });
              }
              next();
            });
          } catch (e) {
            let flags = [];
            try {
              pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
            } catch (e2) {
            }
            sendRequest({command: "error", flags, error: extractErrorMessageV8(e, streamIn)}, () => {
              callback(e, null);
            });
          }
        };
        if (input.length > 1024 * 1024) {
          let next = start;
          start = () => fs2.writeFile(input, next);
        }
        start(null);
      }
    }
  };
}
function extractErrorMessageV8(e, streamIn) {
  let text = "Internal error";
  let location = null;
  try {
    text = (e && e.message || e) + "";
  } catch (e2) {
  }
  try {
    let stack = e.stack + "";
    let lines = stack.split("\n", 3);
    let at = "    at ";
    if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1].startsWith(at)) {
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
          let contents = streamIn.readFileSync(match[1], "utf8");
          let lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
          location = {
            file: match[1],
            namespace: "file",
            line: +match[2],
            column: +match[3] - 1,
            length: 0,
            lineText: lineText + "\n" + lines.slice(1).join("\n")
          };
        }
        break;
      }
    }
  } catch (e2) {
  }
  return {text, location};
}
function failureErrorWithLog(text, errors, warnings) {
  let limit = 5;
  let summary = errors.length < 1 ? "" : ` with ${errors.length} error${errors.length < 2 ? "" : "s"}:` + errors.slice(0, limit + 1).map((e, i) => {
    if (i === limit)
      return "\n...";
    if (!e.location)
      return `
error: ${e.text}`;
    let {file, line, column} = e.location;
    return `
${file}:${line}:${column}: error: ${e.text}`;
  }).join("");
  let error = new Error(`${text}${summary}`);
  error.errors = errors;
  error.warnings = warnings;
  return error;
}
function sanitizeMessages(messages, property) {
  let messagesClone = [];
  let index = 0;
  for (const message of messages) {
    let keys = {};
    let text = getFlag(message, keys, "text", mustBeString);
    let location = getFlag(message, keys, "location", mustBeObjectOrNull);
    checkForInvalidFlags(message, keys, `in element ${index} of "${property}"`);
    let locationClone = null;
    if (location != null) {
      let keys2 = {};
      let file = getFlag(location, keys2, "file", mustBeString);
      let namespace = getFlag(location, keys2, "namespace", mustBeString);
      let line = getFlag(location, keys2, "line", mustBeInteger);
      let column = getFlag(location, keys2, "column", mustBeInteger);
      let length = getFlag(location, keys2, "length", mustBeInteger);
      let lineText = getFlag(location, keys2, "lineText", mustBeString);
      checkForInvalidFlags(location, keys2, `in element ${index} of "${property}"`);
      locationClone = {
        file: file || "",
        namespace: namespace || "",
        line: line || 0,
        column: column || 0,
        length: length || 0,
        lineText: lineText || ""
      };
    }
    messagesClone.push({
      text: text || "",
      location: locationClone
    });
    index++;
  }
  return messagesClone;
}
function convertOutputFiles({path: path2, contents}) {
  let text = null;
  return {
    path: path2,
    contents,
    get text() {
      if (text === null)
        text = decodeUTF8(contents);
      return text;
    }
  };
}
function referenceCountedService(getwd, startService2) {
  let entries = new Map();
  return (options) => __async(this, null, function* () {
    let cwd = getwd();
    let optionsJSON = JSON.stringify(options || {});
    let key = `${optionsJSON} ${cwd}`;
    let entry = entries.get(key);
    let didStop = false;
    let checkWasStopped = () => {
      if (didStop) {
        throw new Error("The service was stopped");
      }
    };
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
    if (entry === void 0) {
      entry = {promise: startService2(JSON.parse(optionsJSON)), refCount: 0};
      entries.set(key, entry);
    }
    ++entry.refCount;
    try {
      let service = yield entry.promise;
      return {
        build: (options2) => {
          checkWasStopped();
          return service.build(options2);
        },
        serve(serveOptions, buildOptions) {
          checkWasStopped();
          return service.serve(serveOptions, buildOptions);
        },
        transform(input, options2) {
          checkWasStopped();
          return service.transform(input, options2);
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

// lib/node.ts
var child_process = require("child_process");
var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
var os = require("os");
var tty = require("tty");
var esbuildCommandAndArgs = () => {
  if (process.env.ESBUILD_BINARY_PATH) {
    return [path.resolve(process.env.ESBUILD_BINARY_PATH), []];
  }
  if (false) {
    return ["node", [path.join(__dirname, "..", "bin", "esbuild")]];
  }
  if (process.platform === "win32") {
    return [path.join(__dirname, "..", "esbuild.exe"), []];
  }
  let pathForYarn2 = path.join(__dirname, "..", "esbuild");
  if (fs.existsSync(pathForYarn2)) {
    return [pathForYarn2, []];
  }
  return [path.join(__dirname, "..", "bin", "esbuild"), []];
};
var isTTY = () => tty.isatty(2);
var version = "0.8.28";
var build = (options) => {
  return startService().then((service) => {
    return service.build(options).then((result) => {
      if (result.rebuild) {
        let old = result.rebuild.dispose;
        result.rebuild.dispose = () => {
          old();
          service.stop();
        };
      } else
        service.stop();
      return result;
    }, (error) => {
      service.stop();
      throw error;
    });
  });
};
var serve = (serveOptions, buildOptions) => {
  return startService().then((service) => {
    return service.serve(serveOptions, buildOptions).then((result) => {
      result.wait.then(service.stop, service.stop);
      return result;
    }, (error) => {
      service.stop();
      throw error;
    });
  });
};
var transform = (input, options) => {
  input += "";
  return startService().then((service) => {
    let promise = service.transform(input, options);
    promise.then(service.stop, service.stop);
    return promise;
  });
};
var buildSync = (options) => {
  let result;
  runServiceSync((service) => service.buildOrServe("buildSync", null, options, isTTY(), (err, res) => {
    if (err)
      throw err;
    result = res;
  }));
  return result;
};
var transformSync = (input, options) => {
  input += "";
  let result;
  runServiceSync((service) => service.transform("transformSync", input, options || {}, isTTY(), {
    readFile(tempFile, callback) {
      try {
        let contents = fs.readFileSync(tempFile, "utf8");
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
        }
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
    if (err)
      throw err;
    result = res;
  }));
  return result;
};
var startService = referenceCountedService(() => process.cwd(), (options) => {
  options = validateServiceOptions(options || {});
  if (options.wasmURL)
    throw new Error(`The "wasmURL" option only works in the browser`);
  if (options.worker)
    throw new Error(`The "worker" option only works in the browser`);
  let [command, args] = esbuildCommandAndArgs();
  let child = child_process.spawn(command, args.concat(`--service=${"0.8.28"}`), {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: ["pipe", "pipe", "inherit"]
  });
  let {readFromStdout, afterClose, service} = createChannel({
    writeToStdin(bytes) {
      child.stdin.write(bytes);
    },
    readFileSync: fs.readFileSync,
    isSync: false,
    isBrowser: false
  });
  child.stdout.on("data", readFromStdout);
  child.stdout.on("end", afterClose);
  return Promise.resolve({
    build: (options2) => new Promise((resolve, reject) => service.buildOrServe("build", null, options2, isTTY(), (err, res) => err ? reject(err) : resolve(res))),
    serve: (serveOptions, buildOptions) => {
      if (serveOptions === null || typeof serveOptions !== "object")
        throw new Error("The first argument must be an object");
      return new Promise((resolve, reject) => service.buildOrServe("serve", serveOptions, buildOptions, isTTY(), (err, res) => err ? reject(err) : resolve(res)));
    },
    transform: (input, options2) => {
      input += "";
      return new Promise((resolve, reject) => service.transform("transform", input, options2 || {}, isTTY(), {
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
          try {
            let tempFile = randomFileName();
            fs.writeFile(tempFile, contents, (err) => err !== null ? callback(null) : callback(tempFile));
          } catch (e) {
            callback(null);
          }
        }
      }, (err, res) => err ? reject(err) : resolve(res)));
    },
    stop() {
      child.kill();
    }
  });
});
var runServiceSync = (callback) => {
  let [command, args] = esbuildCommandAndArgs();
  let stdin = new Uint8Array();
  let {readFromStdout, afterClose, service} = createChannel({
    writeToStdin(bytes) {
      if (stdin.length !== 0)
        throw new Error("Must run at most one command");
      stdin = bytes;
    },
    isSync: true,
    isBrowser: false
  });
  callback(service);
  let stdout = child_process.execFileSync(command, args.concat(`--service=${"0.8.28"}`), {
    cwd: process.cwd(),
    windowsHide: true,
    input: stdin,
    maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024
  });
  readFromStdout(stdout);
  afterClose();
};
var randomFileName = () => {
  return path.join(os.tmpdir(), `esbuild-${crypto.randomBytes(32).toString("hex")}`);
};

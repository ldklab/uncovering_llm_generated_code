const { execFileSync, spawn } = require("child_process");
const { randomBytes } = require("crypto");
const { join } = require("path");
const { readFileSync, writeFileSync, readFile, unlink, unlinkSync } = require("fs");
const { tmpdir } = require("os");
const { isatty } = require("tty");

const __defProp = Object.defineProperty;
const __markAsModule = target => __defProp(target, "__esModule", { value: true });
const __export = (target, all) => {
  __markAsModule(target);
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __async = (__this, __args, generator) => {
  return new Promise((resolve, reject) => {
    const step = result =>
      result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected);

    const fulfilled = value => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };

    const rejected = value => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };

    step((generator = generator.apply(__this, __args)).next());
  });
};

__export(exports, {
  build: () => build,
  buildSync: () => buildSync,
  serve: () => serve,
  startService: () => startService,
  transform: () => transform,
  transformSync: () => transformSync,
  version: () => version,
});

class ByteBuffer {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }

  _write(delta) {
    if (this.len + delta > this.buf.length) {
      const clonedBuf = new Uint8Array((this.len + delta) * 2);
      clonedBuf.set(this.buf);
      this.buf = clonedBuf;
    }
    this.len += delta;
    return this.len - delta;
  }
  
  write8(value) {
    this.buf[this._write(1)] = value;
  }

  write32(value) {
    writeUInt32LE(this.buf, value, this._write(4));
  }

  write(bytes) {
    const offset = this._write(4 + bytes.length);
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
    const length = this.read32();
    const bytes = new Uint8Array(length);
    const ptr = this._read(bytes.length);
    bytes.set(this.buf.subarray(ptr, ptr + length));
    return bytes;
  }
}

const encodeUTF8 = typeof TextEncoder !== "undefined" ? text => new TextEncoder().encode(text) : Buffer.from;
const decodeUTF8 = typeof TextDecoder !== "undefined" ? bytes => new TextDecoder().decode(bytes) : bytes => Buffer.from(bytes).toString();

function encodePacket(packet) {
  const bb = new ByteBuffer();
  bb.write32(0);
  bb.write32(packet.id << 1 | (packet.isRequest ? 0 : 1));
  
  const visit = value => {
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
    } else if (Array.isArray(value)) {
      bb.write8(5);
      bb.write32(value.length);
      value.forEach(visit);
    } else {
      const keys = Object.keys(value);
      bb.write8(6);
      bb.write32(keys.length);
      keys.forEach(key => {
        bb.write(encodeUTF8(key));
        visit(value[key]);
      });
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
  
  const visit = () => {
    switch (bb.read8()) {
      case 0: return null;
      case 1: return !!bb.read8();
      case 2: return bb.read32();
      case 3: return decodeUTF8(bb.read());
      case 4: return bb.read();
      case 5: {
        const count = bb.read32();
        const arr = [];
        for (let i = 0; i < count; ++i) arr.push(visit());
        return arr;
      }
      case 6: {
        const count = bb.read32();
        const obj = {};
        for (let i = 0; i < count; ++i) obj[decodeUTF8(bb.read())] = visit();
        return obj;
      }
      default: throw new Error("Invalid packet");
    }
  };

  const value = visit();
  if (bb.ptr !== bytes.length) throw new Error("Invalid packet");
  return { id: id >>> 1, isRequest, value };
}

function writeUInt32LE(buffer, value, offset) {
  buffer[offset++] = value;
  buffer[offset++] = value >> 8;
  buffer[offset++] = value >> 16;
  buffer[offset++] = value >> 24;
}

function readUInt32LE(buffer, offset) {
  return buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24;
}

function referenceCountedService(getcwd, startSvc) {
  const entries = new Map();

  return options =>
    new Promise((resolve, reject) => {
      const cwd = getcwd();
      const optionsJSON = JSON.stringify(options || {});
      const key = `${optionsJSON} ${cwd}`;
      let entry = entries.get(key);
      let didStop = false;

      const checkWasStopped = () => {
        if (didStop) throw new Error("The service was stopped");
      };

      const isServiceLastStop = () => {
        if (!didStop) {
          didStop = true;
          if (--entry.refCount === 0) {
            entries.delete(key);
            return true;
          }
        }
        return false;
      };

      if (!entry) {
        entry = { promise: startSvc(JSON.parse(optionsJSON)), refCount: 0 };
        entries.set(key, entry);
      }

      ++entry.refCount;
      entry.promise.then(
        service => resolve({
          build: opts => {
            checkWasStopped();
            return service.build(opts);
          },
          serve: (serveOpts, buildOpts) => {
            checkWasStopped();
            return service.serve(serveOpts, buildOpts);
          },
          transform: (input, options2) => {
            checkWasStopped();
            return service.transform(input, options2);
          },
          stop: () => {
            if (isServiceLastStop()) service.stop();
          },
        }),
        reject
      );
    });
}

function createServiceChannel(streamIn) {
  const responseCallbacks = new Map();
  const pluginCallbacks = new Map();
  const serveCallbacks = new Map();
  let nextServeID = 0;
  let isClosed = false;
  let nextRequestID = 0;
  let nextBuildKey = 0;
  let stdout = new Uint8Array(16 * 1024);
  let stdoutUsed = 0;

  const readFromStdout = chunk => {
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
    responseCallbacks.forEach(callback => callback("The service was stopped", null));
    responseCallbacks.clear();
    serveCallbacks.forEach(cb => cb.onWait("The service was stopped"));
    serveCallbacks.clear();
  };

  const sendRequest = (value, callback) => {
    if (isClosed) return callback("The service is no longer running", null);
    const id = nextRequestID++;
    responseCallbacks.set(id, callback);
    streamIn.writeToStdin(encodePacket({ id, isRequest: true, value }));
  };

  const sendResponse = (id, value) => {
    if (isClosed) throw new Error("The service is no longer running");
    streamIn.writeToStdin(encodePacket({ id, isRequest: false, value }));
  };

  const handleRequest = (id, request) => {
    (async () => {
      try {
        switch (request.command) {
          case "resolve": {
            const callback = pluginCallbacks.get(request.key);
            sendResponse(id, await callback(request));
            break;
          }
          case "load": {
            const callback = pluginCallbacks.get(request.key);
            sendResponse(id, await callback(request));
            break;
          }
          case "serve-request": {
            const callbacks = serveCallbacks.get(request.serveID);
            sendResponse(id, {});
            callbacks?.onRequest?.(request.args);
            break;
          }
          case "serve-wait": {
            const callbacks = serveCallbacks.get(request.serveID);
            sendResponse(id, {});
            callbacks?.onWait?.(request.error);
            break;
          }
          default:
            throw new Error(`Invalid command: ` + request.command);
        }
      } catch (e) {
        sendResponse(id, { errors: [await extractErrorMessageV8(e, streamIn)] });
      }
    })();
  };

  let isFirstPacket = true;
  const handleIncomingPacket = bytes => {
    if (isFirstPacket) {
      isFirstPacket = false;
      const binaryVersion = String.fromCharCode(...bytes);
      if (binaryVersion !== "0.8.28") {
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
    if (streamIn.isSync) throw new Error("Cannot use plugins in synchronous API calls");

    const onResolveCallbacks = {};
    const onLoadCallbacks = {};
    let nextCallbackID = 0;
    let i = 0;

    request.plugins = [];

    for (const item of plugins) {
      const keys = {};
      if (typeof item !== "object") throw new Error(`Plugin at index ${i} must be an object`);
      const name = getFlag(item, keys, "name", mustBeString);
      const setup = getFlag(item, keys, "setup", mustBeFunction);
      if (typeof name !== "string" || name === "") throw new Error(`Plugin at index ${i} is missing a name`);
      if (typeof setup !== "function") throw new Error(`[${name}] Plugin is missing a setup function`);
      checkForInvalidFlags(item, keys, `on plugin ${JSON.stringify(name)}`);
      const plugin = { name, onResolve: [], onLoad: [] };
      i++;

      setup({
        onResolve(options, callback) {
          const keys2 = {};
          const filter = getFlag(options, keys2, "filter", mustBeRegExp);
          const namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${JSON.stringify(name)}`);
          if (!filter) throw new Error(`[${plugin.name}] onResolve() call is missing a filter`);
          const id = nextCallbackID++;
          onResolveCallbacks[id] = { name, callback };
          plugin.onResolve.push({ id, filter: filter.source, namespace: namespace || "" });
        },
        onLoad(options, callback) {
          const keys2 = {};
          const filter = getFlag(options, keys2, "filter", mustBeRegExp);
          const namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${JSON.stringify(name)}`);
          if (!filter) throw new Error(`[${plugin.name}] onLoad() call is missing a filter`);
          const id = nextCallbackID++;
          onLoadCallbacks[id] = { name, callback };
          plugin.onLoad.push({ id, filter: filter.source, namespace: namespace || "" });
        }
      });

      request.plugins.push(plugin);
    }

    pluginCallbacks.set(buildKey, async request2 => {
      switch (request2.command) {
        case "resolve": {
          const response = {};
          for (const id of request2.ids) {
            try {
              const { name, callback } = onResolveCallbacks[id];
              const result = await callback({
                path: request2.path,
                importer: request2.importer,
                namespace: request2.namespace,
                resolveDir: request2.resolveDir
              });
              if (result !== null) {
                if (typeof result !== "object") throw new Error(`Expected onResolve() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                const pluginName = getFlag(result, keys, "pluginName", mustBeString);
                const path = getFlag(result, keys, "path", mustBeString);
                const namespace = getFlag(result, keys, "namespace", mustBeString);
                const external = getFlag(result, keys, "external", mustBeBoolean);
                const errors = getFlag(result, keys, "errors", mustBeArray);
                const warnings = getFlag(result, keys, "warnings", mustBeArray);
                checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${JSON.stringify(name)}`);
                response.id = id;
                if (pluginName != null) response.pluginName = pluginName;
                if (path != null) response.path = path;
                if (namespace != null) response.namespace = namespace;
                if (external != null) response.external = external;
                if (errors != null) response.errors = sanitizeMessages(errors, "errors");
                if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings");
                break;
              }
            } catch (e) {
              return { id, errors: [await extractErrorMessageV8(e, streamIn)] };
            }
          }
          return response;
        }
        case "load": {
          const response = {};
          for (const id of request2.ids) {
            try {
              const { name, callback } = onLoadCallbacks[id];
              const result = await callback({
                path: request2.path,
                namespace: request2.namespace
              });
              if (result !== null) {
                if (typeof result !== "object") throw new Error(`Expected onLoad() callback in plugin ${JSON.stringify(name)} to return an object`);
                const keys = {};
                const pluginName = getFlag(result, keys, "pluginName", mustBeString);
                const contents = getFlag(result, keys, "contents", mustBeStringOrUint8Array);
                const resolveDir = getFlag(result, keys, "resolveDir", mustBeString);
                const loader = getFlag(result, keys, "loader", mustBeString);
                const errors = getFlag(result, keys, "errors", mustBeArray);
                const warnings = getFlag(result, keys, "warnings", mustBeArray);
                checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${JSON.stringify(name)}`);
                response.id = id;
                if (pluginName != null) response.pluginName = pluginName;
                if (contents instanceof Uint8Array) response.contents = contents;
                else if (contents != null) response.contents = encodeUTF8(contents);
                if (resolveDir != null) response.resolveDir = resolveDir;
                if (loader != null) response.loader = loader;
                if (errors != null) response.errors = sanitizeMessages(errors, "errors");
                if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings");
                break;
              }
            } catch (e) {
              return { id, errors: [await extractErrorMessageV8(e, streamIn)] };
            }
          }
          return response;
        }
        default:
          throw new Error(`Invalid command: ` + request2.command);
      }
    });

    return () => pluginCallbacks.delete(buildKey);
  };

  const buildServeData = (options, request) => {
    const keys = {};
    const port = getFlag(options, keys, "port", mustBeInteger);
    const host = getFlag(options, keys, "host", mustBeString);
    const onRequest = getFlag(options, keys, "onRequest", mustBeFunction);
    const serveID = nextServeID++;
    let onWait;
    const wait = new Promise((resolve, reject) => {
      onWait = error => {
        serveCallbacks.delete(serveID);
        if (error !== null) reject(new Error(error));
        else resolve();
      };
    });

    request.serve = { serveID };
    checkForInvalidFlags(options, keys, `in serve() call`);
    if (port !== undefined) request.serve.port = port;
    if (host !== undefined) request.serve.host = host;

    serveCallbacks.set(serveID, { onRequest, onWait });

    return {
      wait,
      stop() {
        sendRequest({ command: "serve-stop", serveID }, () => {});
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
          const key = nextBuildKey++;
          const writeDefault = !streamIn.isBrowser;
          const { flags, write, plugins, stdinContents, stdinResolveDir, incremental } = flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault);
          const request = { command: "build", key, flags, write, stdinContents, stdinResolveDir, incremental };
          const serveData = serveOptions && buildServeData(serveOptions, request);
          const pluginCleanup = plugins && plugins.length > 0 && handlePlugins(plugins, request, key);
          let rebuild;

          const buildResponseToResult = (response, callback2) => {
            const { errors, warnings } = response;
            if (errors.length > 0) return callback2(failureErrorWithLog("Build failed", errors, warnings), null);
            const result = { warnings };

            if (response.outputFiles) result.outputFiles = response.outputFiles.map(convertOutputFiles);

            if (response.rebuildID !== undefined) {
              if (!rebuild) {
                let isDisposed = false;
                rebuild = () => {
                  if (isDisposed || isClosed) throw new Error("Cannot rebuild");
                  return new Promise((resolve, reject) => {
                    sendRequest({ command: "rebuild", rebuildID: response.rebuildID }, (error2, response2) => {
                      if (error2) return callback2(new Error(error2), null);
                      buildResponseToResult(response2, (error3, result3) => {
                        if (error3) reject(error3);
                        else resolve(result3);
                      });
                    });
                  });
                };

                rebuild.dispose = () => {
                  isDisposed = true;
                  if (pluginCleanup) pluginCleanup();
                  sendRequest({ command: "rebuild-dispose", rebuildID: response.rebuildID }, () => {});
                };
              }
              result.rebuild = rebuild;
            }
            return callback2(null, result);
          };

          if (write && streamIn.isBrowser) throw new Error(`Cannot enable "write" in the browser`);
          if (incremental && streamIn.isSync) throw new Error(`Cannot use "incremental" with a synchronous build`);

          sendRequest(request, (error, response) => {
            if (error) return callback(new Error(error), null);
            if (serveData) {
              return callback(null, { port: response.port, host: response.host, wait: serveData.wait, stop: serveData.stop });
            }
            if (pluginCleanup && !incremental) pluginCleanup();
            return buildResponseToResult(response, callback);
          });
        } catch (e) {
          const flags = [];
          try {
            pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
          } catch (e2) {}

          sendRequest({ command: "error", flags, error: extractErrorMessageV8(e, streamIn)}, () => {
            callback(e, null);
          });
        }
      },
      transform(callName, input, options, isTTY2, fs2, callback) {
        const logLevelDefault = "silent";
        let start = inputPath => {
          try {
            const flags = flagsForTransformOptions(callName, options, isTTY2, logLevelDefault);
            const request = { command: "transform", flags, inputFS: inputPath !== null, input: inputPath !== null ? inputPath : input };

            sendRequest(request, (error, response) => {
              if (error) return callback(new Error(error), null);

              const { errors, warnings } = response;
              if (errors.length > 0) return callback(failureErrorWithLog("Transform failed", errors, warnings), null);

              let outstanding = 1;
              const next = () => --outstanding === 0 && callback(null, { warnings, code: response.code, map: response.map });

              if (response.codeFS) {
                outstanding++;
                fs2.readFile(response.code, (err, contents) => {
                  if (err !== null) callback(err, null);
                  else {
                    response.code = contents;
                    next();
                  }
                });
              }

              if (response.mapFS) {
                outstanding++;
                fs2.readFile(response.map, (err, contents) => {
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
            const flags = [];
            try {
              pushLogFlags(flags, options, {}, isTTY2, logLevelDefault);
            } catch (e2) {}

            sendRequest({ command: "error", flags, error: extractErrorMessageV8(e, streamIn)}, () => {
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

function extractErrorMessageV8(e, streamIn) {
  let text = String(e && e.message) || "Internal error";
  let location = null;

  try {
    const stack = String(e.stack);
    const lines = stack.split("\n", 3);
    const at = "    at ";

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
          const lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
          location = {
            file: match[1],
            namespace: "file",
            line: +match[2],
            column: +match[3] - 1,
            length: 0,
            lineText,
          };
        }
        break;
      }
    }
  } catch (e2) {}

  return { text, location };
}

function failureErrorWithLog(text, errors, warnings) {
  const limit = 5;
  const summary = errors.length < 1 ? "" : ` with ${errors.length} error${errors.length < 2 ? "" : "s"}:` +
    errors.slice(0, limit + 1).map((e, i) => {
      if (i === limit) return "\n...";
      if (!e.location) return `\nerror: ${e.text}`;
      const { file, line, column } = e.location;
      return `\n${file}:${line}:${column}: error: ${e.text}`;
    }).join("");

  const error = new Error(`${text}${summary}`);
  error.errors = errors;
  error.warnings = warnings;
  return error;
}

function sanitizeMessages(messages, property) {
  return messages.map((message, index) => {
    const keys = {};
    const text = getFlag(message, keys, "text", mustBeString);
    const location = getFlag(message, keys, "location", mustBeObjectOrNull);
    
    checkForInvalidFlags(message, keys, `in element ${index} of "${property}"`);
    
    let locationClone = null;
    if (location !== null) {
      const locKeys = {};
      const file = getFlag(location, locKeys, "file", mustBeString);
      const namespace = getFlag(location, locKeys, "namespace", mustBeString);
      const line = getFlag(location, locKeys, "line", mustBeInteger);
      const column = getFlag(location, locKeys, "column", mustBeInteger);
      const length = getFlag(location, locKeys, "length", mustBeInteger);
      const lineText = getFlag(location, locKeys, "lineText", mustBeString);

      checkForInvalidFlags(location, locKeys, `in element ${index} of "${property}"`);
      locationClone = {
        file: file || "",
        namespace: namespace || "",
        line: line || 0,
        column: column || 0,
        length: length || 0,
        lineText: lineText || "",
      };
    }

    return { text: text || "", location: locationClone };
  });
}

function convertOutputFiles({ path, contents }) {
  return {
    path,
    contents,
    get text() {
      return decodeUTF8(contents);
    },
  };
}

function validateServiceOptions(options) {
  const keys = {};
  const wasmURL = getFlag(options, keys, "wasmURL", mustBeString);
  const worker = getFlag(options, keys, "worker", mustBeBoolean);
  
  checkForInvalidFlags(options, keys, "in startService() call");
  return { wasmURL, worker };
}

const version = "0.8.28";

const isTTY = () => isatty(2);

function startService() {
  return referenceCountedService(
    () => process.cwd(),
    options => {
      validateServiceOptions(options || {});

      const [command, args] = esbuildCommandAndArgs();
      const child = spawn(command, args.concat(`--service=${version}`), {
        cwd: process.cwd(),
        windowsHide: true,
        stdio: ["pipe", "pipe", "inherit"],
      });

      const { readFromStdout, afterClose, service } = createServiceChannel({
        writeToStdin: bytes => child.stdin.write(bytes),
        readFileSync,
        isSync: false,
        isBrowser: false,
      });

      child.stdout.on("data", readFromStdout);
      child.stdout.on("end", afterClose);

      return Promise.resolve({
        build: options => new Promise((resolve, reject) =>
          service.buildOrServe("build", null, options, isTTY(), (err, res) =>
            err ? reject(err) : resolve(res)
          )
        ),

        serve: (serveOpts, buildOpts) => {
          if (!serveOpts || typeof serveOpts !== "object") throw new Error("The first argument must be an object");

          return new Promise((resolve, reject) =>
            service.buildOrServe("serve", serveOpts, buildOpts, isTTY(), (err, res) =>
              err ? reject(err) : resolve(res)
            )
          );
        },

        transform: (input, options) => {
          input = String(input);
          
          return new Promise((resolve, reject) => {
            service.transform("transform", input, options || {}, isTTY(), {
              readFile(tempFile, callback) {
                try {
                  readFile(tempFile, "utf8", (err, contents) => {
                    try {
                      unlink(tempFile, () => callback(err, contents));
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
                  const tempFile = randomFileName();
                  writeFileSync(tempFile, contents);
                  callback(tempFile);
                } catch (e) {
                  callback(null);
                }
              }
            }, (err, res) => err ? reject(err) : resolve(res));
          });
        },

        stop() {
          child.kill();
        },
      });
    }
  );
}

const randomFileName = () => join(tmpdir(), `esbuild-${randomBytes(32).toString("hex")}`);

function runServiceSync(callback) {
  const [command, args] = esbuildCommandAndArgs();
  let stdin = new Uint8Array();
  const { readFromStdout, afterClose, service } = createServiceChannel({
    writeToStdin(bytes) {
      if (stdin.length !== 0) throw new Error("Must run at most one command");
      stdin = bytes;
    },
    isSync: true,
    isBrowser: false,
  });

  callback(service);

  const stdout = execFileSync(command, args.concat(`--service=${version}`), {
    cwd: process.cwd(),
    windowsHide: true,
    input: stdin,
    maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024,
  });

  readFromStdout(stdout);
  afterClose();
}

const build = options => {
  return startService().then(service =>
    service.build(options).then(
      result => {
        if (result.rebuild) {
          const old = result.rebuild.dispose;
          result.rebuild.dispose = () => {
            old();
            service.stop();
          };
        } else {
          service.stop();
        }
        return result;
      },
      error => {
        service.stop();
        throw error;
      }
    )
  );
};

const serve = (serveOptions, buildOptions) => {
  return startService().then(service =>
    service.serve(serveOptions, buildOptions).then(
      result => {
        result.wait.then(service.stop, service.stop);
        return result;
      },
      error => {
        service.stop();
        throw error;
      }
    )
  );
};

const transform = (input, options) => {
  input = String(input);
  return startService().then(service => {
    const promise = service.transform(input, options);
    promise.then(service.stop, service.stop);
    return promise;
  });
};

const buildSync = options => {
  let result;
  
  runServiceSync(service => {
    service.buildOrServe("buildSync", null, options, isTTY(), (err, res) => {
      if (err) throw err;
      result = res;
    });
  });

  return result;
};

const transformSync = (input, options) => {
  input = String(input);
  let result;

  runServiceSync(service => {
    service.transform("transformSync", input, options || {}, isTTY(), {
      readFile(tempFile, callback) {
        try {
          const contents = readFileSync(tempFile, "utf8");
          unlinkSync(tempFile);
          callback(null, contents);
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          const tempFile = randomFileName();
          writeFileSync(tempFile, contents);
          callback(tempFile);
        } catch (e) {
          callback(null);
        }
      },
    }, (err, res) => {
      if (err) throw err;
      result = res;
    });
  });

  return result;
};

// Replace esbuildCommandAndArgs with equivalent mechanism
const esbuildCommandAndArgs = () => {
  const binPath = join(__dirname, "..", "bin", "esbuild");
  if (process.env.ESBUILD_BINARY_PATH) return [resolve(process.env.ESBUILD_BINARY_PATH), []];
  if (process.platform === "win32") return [binPath + ".exe", []];
  return [binPath, []];
};

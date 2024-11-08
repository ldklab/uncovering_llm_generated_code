const { SourceMapConsumer } = require('source-map');
const path = require('path');
const bufferFrom = require('buffer-from');

let fs;
try {
  fs = require('fs');
  if (!fs.existsSync || !fs.readFileSync) {
    fs = null;
  }
} catch (err) {}

function dynamicRequire(mod, request) {
  return mod.require(request);
}

let errorFormatterInstalled = false;
let uncaughtShimInstalled = false;
let emptyCacheBetweenOperations = false;
let environment = "auto";

let fileContentsCache = {};
let sourceMapCache = {};
const reSourceMap = /^data:application\/json[^,]+base64,/;

const retrieveFileHandlers = [];
const retrieveMapHandlers = [];

function isInBrowser() {
  if (environment === "browser") return true;
  if (environment === "node") return false;
  return (typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') && !(window.require && window.module && window.process && window.process.type === "renderer");
}

function hasGlobalProcessEventEmitter() {
  return (typeof process === 'object') && (process !== null) && (typeof process.on === 'function');
}

function globalProcessVersion() {
  return (typeof process === 'object') && (process !== null) ? process.version : '';
}

function globalProcessStderr() {
  return (typeof process === 'object') && (process !== null) ? process.stderr : null;
}

function globalProcessExit(code) {
  if ((typeof process === 'object') && (process !== null) && (typeof process.exit === 'function')) {
    return process.exit(code);
  }
}

function handlerExec(list) {
  return function(arg) {
    for (let i = 0; i < list.length; i++) {
      const ret = list[i](arg);
      if (ret) {
        return ret;
      }
    }
    return null;
  };
}

let retrieveFile = handlerExec(retrieveFileHandlers);

retrieveFileHandlers.push(function(absolutePath) {
  absolutePath = absolutePath.trim();
  if (/^file:/.test(absolutePath)) {
    absolutePath = absolutePath.replace(/file:\/\/\/(\w:)?/, protocol => protocol ? '' : '/');
  }
  if (absolutePath in fileContentsCache) {
    return fileContentsCache[absolutePath];
  }

  let contents = '';
  try {
    if (!fs) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', absolutePath, false);
      xhr.send(null);
      if (xhr.readyState === 4 && xhr.status === 200) {
        contents = xhr.responseText;
      }
    } else if (fs.existsSync(absolutePath)) {
      contents = fs.readFileSync(absolutePath, 'utf8');
    }
  } catch (error) {}

  return fileContentsCache[absolutePath] = contents;
});

function supportRelativeURL(file, url) {
  if (!file) return url;
  const dir = path.dirname(file);
  const match = /^\w+:\/\/[^\/]*/.exec(dir);
  const protocol = match ? match[0] : '';
  const startPath = dir.slice(protocol.length);
  if (protocol && /^\/\w\:/.test(startPath)) {
    protocol += '/';
    return protocol + path.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
  }
  return protocol + path.resolve(dir.slice(protocol.length), url);
}

function retrieveSourceMapURL(source) {
  let fileData;

  if (isInBrowser()) {
     try {
       const xhr = new XMLHttpRequest();
       xhr.open('GET', source, false);
       xhr.send(null);
       fileData = xhr.readyState === 4 ? xhr.responseText : null;

       const sourceMapHeader = xhr.getResponseHeader("SourceMap") || xhr.getResponseHeader("X-SourceMap");
       if (sourceMapHeader) {
         return sourceMapHeader;
       }
     } catch (e) {}
  }

  fileData = retrieveFile(source);
  const re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
  let lastMatch, match;
  while (match = re.exec(fileData)) lastMatch = match;
  if (!lastMatch) return null;
  return lastMatch[1];
}

let retrieveSourceMap = handlerExec(retrieveMapHandlers);
retrieveMapHandlers.push(function(source) {
  const sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) return null;

  let sourceMapData;
  if (reSourceMap.test(sourceMappingURL)) {
    const rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
    sourceMapData = bufferFrom(rawData, "base64").toString();
    sourceMappingURL = source;
  } else {
    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
    sourceMapData = retrieveFile(sourceMappingURL);
  }

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: sourceMapData
  };
});

function mapSourcePosition(position) {
  let sourceMap = sourceMapCache[position.source];
  if (!sourceMap) {
    const urlAndMap = retrieveSourceMap(position.source);
    if (urlAndMap) {
      sourceMap = sourceMapCache[position.source] = {
        url: urlAndMap.url,
        map: new SourceMapConsumer(urlAndMap.map)
      };

      if (sourceMap.map.sourcesContent) {
        sourceMap.map.sources.forEach((source, i) => {
          const contents = sourceMap.map.sourcesContent[i];
          if (contents) {
            const url = supportRelativeURL(sourceMap.url, source);
            fileContentsCache[url] = contents;
          }
        });
      }
    } else {
      sourceMap = sourceMapCache[position.source] = {
        url: null,
        map: null
      };
    }
  }

  if (sourceMap && sourceMap.map && typeof sourceMap.map.originalPositionFor === 'function') {
    const originalPosition = sourceMap.map.originalPositionFor(position);
    if (originalPosition.source !== null) {
      originalPosition.source = supportRelativeURL(sourceMap.url, originalPosition.source);
      return originalPosition;
    }
  }

  return position;
}

function mapEvalOrigin(origin) {
  let match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
  if (match) {
    const position = mapSourcePosition({
      source: match[2],
      line: +match[3],
      column: match[4] - 1
    });
    return 'eval at ' + match[1] + ' (' + position.source + ':' + position.line + ':' + (position.column + 1) + ')';
  }

  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
  if (match) {
    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
  }

  return origin;
}

function CallSiteToString() {
  let fileName;
  let fileLocation = "";
  if (this.isNative()) {
    fileLocation = "native";
  } else {
    fileName = this.getScriptNameOrSourceURL();
    if (!fileName && this.isEval()) {
      fileLocation = this.getEvalOrigin();
      fileLocation += ", ";
    }

    if (fileName) {
      fileLocation += fileName;
    } else {
      fileLocation += "<anonymous>";
    }
    const lineNumber = this.getLineNumber();
    if (lineNumber != null) {
      fileLocation += ":" + lineNumber;
      const columnNumber = this.getColumnNumber();
      if (columnNumber) {
        fileLocation += ":" + columnNumber;
      }
    }
  }

  let line = "";
  const functionName = this.getFunctionName();
  let addSuffix = true;
  const isConstructor = this.isConstructor();
  const isMethodCall = !(this.isToplevel() || isConstructor);
  if (isMethodCall) {
    let typeName = this.getTypeName();
    if (typeName === "[object Object]") {
      typeName = "null";
    }
    const methodName = this.getMethodName();
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += typeName + ".";
      }
      line += functionName;
      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
        line += " [as " + methodName + "]";
      }
    } else {
      line += typeName + "." + (methodName || "<anonymous>");
    }
  } else if (isConstructor) {
    line += "new " + (functionName || "<anonymous>");
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
    addSuffix = false;
  }
  if (addSuffix) {
    line += " (" + fileLocation + ")";
  }
  return line;
}

function cloneCallSite(frame) {
  const object = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(name => {
    object[name] = /^(?:is|get)/.test(name) ? () => frame[name].call(frame) : frame[name];
  });
  object.toString = CallSiteToString;
  return object;
}

function wrapCallSite(frame, state) {
  if (state === undefined) {
    state = { nextPosition: null, curPosition: null };
  }
  if (frame.isNative()) {
    state.curPosition = null;
    return frame;
  }

  const source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    let line = frame.getLineNumber();
    let column = frame.getColumnNumber() - 1;

    const noHeader = /^v(10\.1[6-9]|10\.[2-9][0-9]|10\.[0-9]{3,}|1[2-9]\d*|[2-9]\d|\d{3,}|11\.11)/;
    const headerLength = noHeader.test(globalProcessVersion()) ? 0 : 62;
    if (line === 1 && column > headerLength && !isInBrowser() && !frame.isEval()) {
      column -= headerLength;
    }

    const position = mapSourcePosition({
      source,
      line,
      column
    });
    state.curPosition = position;
    frame = cloneCallSite(frame);
    frame.getFunctionName = function() {
      if (state.nextPosition == null) {
        return this.getFunctionName();
      }
      return state.nextPosition.name || this.getFunctionName();
    };
    frame.getFileName = function() { return position.source; };
    frame.getLineNumber = function() { return position.line; };
    frame.getColumnNumber = function() { return position.column + 1; };
    frame.getScriptNameOrSourceURL = function() { return position.source; };
    return frame;
  }

  const origin = frame.isEval() && frame.getEvalOrigin();
  if (origin) {
    const newOrigin = mapEvalOrigin(origin);
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = function() { return newOrigin; };
    return frame;
  }

  return frame;
}

function prepareStackTrace(error, stack) {
  if (emptyCacheBetweenOperations) {
    fileContentsCache = {};
    sourceMapCache = {};
  }

  const name = error.name || 'Error';
  const message = error.message || '';
  const errorString = name + ": " + message;

  const state = { nextPosition: null, curPosition: null };
  const processedStack = [];
  for (let i = stack.length - 1; i >= 0; i--) {
    processedStack.push('\n    at ' + wrapCallSite(stack[i], state));
    state.nextPosition = state.curPosition;
  }
  state.curPosition = state.nextPosition = null;
  return errorString + processedStack.reverse().join('');
}

function getErrorSource(error) {
  const match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
  if (match) {
    const source = match[1];
    const line = +match[2];
    const column = +match[3];

    let contents = fileContentsCache[source];

    if (!contents && fs && fs.existsSync(source)) {
      try {
        contents = fs.readFileSync(source, 'utf8');
      } catch (er) {
        contents = '';
      }
    }

    if (contents) {
      const code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
      if (code) {
        return source + ':' + line + '\n' + code + '\n' +
          new Array(column).join(' ') + '^';
      }
    }
  }
  return null;
}

function printErrorAndExit(error) {
  const source = getErrorSource(error);

  const stderr = globalProcessStderr();
  if (stderr && stderr._handle && stderr._handle.setBlocking) {
    stderr._handle.setBlocking(true);
  }

  if (source) {
    console.error();
    console.error(source);
  }

  console.error(error.stack);
  globalProcessExit(1);
}

function shimEmitUncaughtException() {
  const origEmit = process.emit;

  process.emit = function(type) {
    if (type === 'uncaughtException') {
      const hasStack = (arguments[1] && arguments[1].stack);
      const hasListeners = (this.listeners(type).length > 0);

      if (hasStack && !hasListeners) {
        return printErrorAndExit(arguments[1]);
      }
    }

    return origEmit.apply(this, arguments);
  };
}

const originalRetrieveFileHandlers = retrieveFileHandlers.slice(0);
const originalRetrieveMapHandlers = retrieveMapHandlers.slice(0);

exports.wrapCallSite = wrapCallSite;
exports.getErrorSource = getErrorSource;
exports.mapSourcePosition = mapSourcePosition;
exports.retrieveSourceMap = retrieveSourceMap;

exports.install = function(options = {}) {
  if (options.environment) {
    environment = options.environment;
    if (!["node", "browser", "auto"].includes(environment)) {
      throw new Error(`environment ${environment} was unknown. Available options are {auto, browser, node}`);
    }
  }

  if (options.retrieveFile) {
    if (options.overrideRetrieveFile) {
      retrieveFileHandlers.length = 0;
    }
    retrieveFileHandlers.unshift(options.retrieveFile);
  }

  if (options.retrieveSourceMap) {
    if (options.overrideRetrieveSourceMap) {
      retrieveMapHandlers.length = 0;
    }
    retrieveMapHandlers.unshift(options.retrieveSourceMap);
  }

  if (options.hookRequire && !isInBrowser()) {
    const Module = dynamicRequire(module, 'module');
    const $compile = Module.prototype._compile;

    if (!$compile.__sourceMapSupport) {
      Module.prototype._compile = function(content, filename) {
        fileContentsCache[filename] = content;
        sourceMapCache[filename] = undefined;
        return $compile.call(this, content, filename);
      };

      Module.prototype._compile.__sourceMapSupport = true;
    }
  }

  if (!emptyCacheBetweenOperations && options.emptyCacheBetweenOperations !== undefined) {
    emptyCacheBetweenOperations = options.emptyCacheBetweenOperations;
  }

  if (!errorFormatterInstalled) {
    errorFormatterInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;
  }

  if (!uncaughtShimInstalled && hasGlobalProcessEventEmitter()) {
    const installHandler = options.handleUncaughtExceptions !== undefined ? options.handleUncaughtExceptions : true;

    try {
      const worker_threads = dynamicRequire(module, 'worker_threads');
      if (!worker_threads.isMainThread) {
        // Do not install handler
        return;
      }
    } catch(e) {}

    if (installHandler) {
      uncaughtShimInstalled = true;
      shimEmitUncaughtException();
    }
  }
};

exports.resetRetrieveHandlers = function() {
  retrieveFileHandlers.length = 0;
  retrieveMapHandlers.length = 0;

  retrieveFileHandlers = originalRetrieveFileHandlers.slice(0);
  retrieveMapHandlers = originalRetrieveMapHandlers.slice(0);

  retrieveSourceMap = handlerExec(retrieveMapHandlers);
  retrieveFile = handlerExec(retrieveFileHandlers);
};

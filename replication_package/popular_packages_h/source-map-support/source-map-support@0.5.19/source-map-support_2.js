const { SourceMapConsumer } = require('source-map');
const path = require('path');
let fs;

try {
  fs = require('fs');
  if (!fs.existsSync || !fs.readFileSync) fs = null;
} catch (err) {}

const bufferFrom = require('buffer-from');

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
let retrieveFileHandlers = [];
let retrieveMapHandlers = [];

function isInBrowser() {
  if (environment === "browser") return true;
  if (environment === "node") return false;
  return (typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') &&
    !(window.require && window.module && window.process && window.process.type === "renderer");
}

function hasGlobalProcessEventEmitter() {
  return typeof process === 'object' && process !== null && typeof process.on === 'function';
}

function handlerExec(list) {
  return function(arg) {
    for (let i = 0; i < list.length; i++) {
      const ret = list[i](arg);
      if (ret) return ret;
    }
    return null;
  };
}

let retrieveFile = handlerExec(retrieveFileHandlers);

retrieveFileHandlers.push(function(path) {
  path = path.trim();
  if (/^file:/.test(path)) {
    path = path.replace(/file:\/\/\/(\w:)?/, (protocol, drive) => drive ? '' : '/');
  }
  if (path in fileContentsCache) return fileContentsCache[path];

  let contents = '';
  try {
    if (!fs) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', path, false);
      xhr.send(null);
      if (xhr.readyState === 4 && xhr.status === 200) contents = xhr.responseText;
    } else if (fs.existsSync(path)) contents = fs.readFileSync(path, 'utf8');
  } catch (er) {}

  return fileContentsCache[path] = contents;
});

function supportRelativeURL(file, url) {
  if (!file) return url;
  const dir = path.dirname(file);
  const match = /^\w+:\/\/[^\/]*/.exec(dir);
  const protocol = match ? match[0] : '';
  const startPath = dir.slice(protocol.length);
  if (protocol && /^\/\w\:/.test(startPath)) {
    return protocol + '/' + path.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
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
      if (sourceMapHeader) return sourceMapHeader;
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

  if (!sourceMapData) return null;

  return { url: sourceMappingURL, map: sourceMapData };
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
      sourceMap = sourceMapCache[position.source] = { url: null, map: null };
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
  if (match) return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';

  return origin;
}

function CallSiteToString() {
  let fileLocation = this.isNative() ? "native" : (this.getScriptNameOrSourceURL() || (this.isEval() ? this.getEvalOrigin() + ", " : "<anonymous>"));
  const lineNumber = this.getLineNumber();
  if (lineNumber != null) fileLocation += ":" + lineNumber + (this.getColumnNumber() ? ":" + this.getColumnNumber() : "");
  
  let line = "";
  const functionName = this.getFunctionName();
  const isConstructor = this.isConstructor();
  const isMethodCall = !(this.isToplevel() || isConstructor);
  
  if (isMethodCall) {
    let typeName = this.getTypeName() === "[object Object]" ? "null" : this.getTypeName();
    const methodName = this.getMethodName();
    if (functionName) {
      if (typeName && !functionName.startsWith(typeName)) line += typeName + ".";
      line += functionName;
      if (methodName && !functionName.endsWith("." + methodName)) line += " [as " + methodName + "]";
    } else {
      line += typeName + "." + (methodName || "<anonymous>");
    }
  } else if (isConstructor) {
    line += "new " + (functionName || "<anonymous>");
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
  }

  return line ? line + " (" + fileLocation + ")" : line;
}

function cloneCallSite(frame) {
  const object = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(name => {
    object[name] = /^(?:is|get)/.test(name) ? () => frame[name].call(frame) : frame[name];
  });
  object.toString = CallSiteToString;
  return object;
}

function wrapCallSite(frame, state = { nextPosition: null, curPosition: null }) {
  if(frame.isNative()) return frame;
  const source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    let line = frame.getLineNumber();
    let column = frame.getColumnNumber() - 1;

    if (line === 1 && column > 62 && !isInBrowser() && !frame.isEval()) {
      column -= 62;
    }

    const position = mapSourcePosition({ source, line, column });
    state.curPosition = position;
    frame = cloneCallSite(frame);
    frame.getFileName = () => position.source;
    frame.getLineNumber = () => position.line;
    frame.getColumnNumber = () => position.column + 1;
    frame.getScriptNameOrSourceURL = () => position.source;
    return frame;
  }

  const origin = frame.isEval() && frame.getEvalOrigin();
  if (origin) {
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = () => mapEvalOrigin(origin);
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
    const [_, source, line, column] = match;
    let contents = fileContentsCache[source];

    if (!contents && fs && fs.existsSync(source)) {
      try {
        contents = fs.readFileSync(source, 'utf8');
      } catch (er) {}
    }

    if (contents) {
      const code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
      if (code) {
        return source + ':' + line + '\n' + code + '\n' + ' '.repeat(column) + '^';
      }
    }
  }
  return null;
}

function printErrorAndExit(error) {
  const source = getErrorSource(error);

  if (process.stderr._handle && process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking(true);
  }

  if (source) {
    console.error();
    console.error(source);
  }

  console.error(error.stack);
  process.exit(1);
}

function shimEmitUncaughtException() {
  const origEmit = process.emit;

  process.emit = function(type) {
    if (type === 'uncaughtException') {
      const hasStack = (arguments[1] && arguments[1].stack);
      const hasListeners = (this.listeners(type).length > 0);

      if (hasStack && !hasListeners) return printErrorAndExit(arguments[1]);
    }

    return origEmit.apply(this, arguments);
  };
}

const originalRetrieveFileHandlers = [...retrieveFileHandlers];
const originalRetrieveMapHandlers = [...retrieveMapHandlers];

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
    if (options.overrideRetrieveFile) retrieveFileHandlers.length = 0;
    retrieveFileHandlers.unshift(options.retrieveFile);
  }

  if (options.retrieveSourceMap) {
    if (options.overrideRetrieveSourceMap) retrieveMapHandlers.length = 0;
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

  if (!emptyCacheBetweenOperations) {
    emptyCacheBetweenOperations = options.emptyCacheBetweenOperations || false;
  }

  if (!errorFormatterInstalled) {
    errorFormatterInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;
  }

  if (!uncaughtShimInstalled) {
    let installHandler = options.handleUncaughtExceptions !== undefined ? options.handleUncaughtExceptions : true;

    try {
      const worker_threads = dynamicRequire(module, 'worker_threads');
      if (!worker_threads.isMainThread) installHandler = false;
    } catch(e) {}

    if (installHandler && hasGlobalProcessEventEmitter()) {
      uncaughtShimInstalled = true;
      shimEmitUncaughtException();
    }
  }
};

exports.resetRetrieveHandlers = function() {
  retrieveFileHandlers.length = 0;
  retrieveMapHandlers.length = 0;

  retrieveFileHandlers = [...originalRetrieveFileHandlers];
  retrieveMapHandlers = [...originalRetrieveMapHandlers];

  retrieveSourceMap = handlerExec(retrieveMapHandlers);
  retrieveFile = handlerExec(retrieveFileHandlers);
};

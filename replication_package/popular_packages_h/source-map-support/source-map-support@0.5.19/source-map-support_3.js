const { SourceMapConsumer } = require('source-map');
const path = require('path');
const bufferFrom = require('buffer-from');

let fs;
try {
  fs = require('fs');
  if (!fs.existsSync || !fs.readFileSync) {
    fs = null;
  }
} catch {}

let errorFormatterInstalled = false;
let uncaughtShimInstalled = false;
let emptyCacheBetweenOperations = false;
let environment = "auto";

const fileContentsCache = {};
const sourceMapCache = {};
const reSourceMap = /^data:application\/json[^,]+base64,/;

const retrieveFileHandlers = [];
const retrieveMapHandlers = [];

function dynamicRequire(mod, request) {
  return mod.require(request);
}

function isInBrowser() {
  if (environment === "browser") return true;
  if (environment === "node") return false;
  return (typeof window !== 'undefined' && typeof XMLHttpRequest === 'function' && !(window.require && window.module && window.process && window.process.type === "renderer"));
}

function hasGlobalProcessEventEmitter() {
  return (typeof process === 'object' && process !== null && typeof process.on === 'function');
}

function handlerExec(list) {
  return function(arg) {
    for (const item of list) {
      const ret = item(arg);
      if (ret) return ret;
    }
    return null;
  };
}

const retrieveFile = handlerExec(retrieveFileHandlers);

retrieveFileHandlers.push(function(filePath) {
  filePath = filePath.trim();
  if (/^file:/.test(filePath)) {
    filePath = filePath.replace(/file:\/\/\/(\w:)?/, (protocol, drive) => drive ? '' : '/');
  }

  if (fileContentsCache[filePath]) {
    return fileContentsCache[filePath];
  }

  let contents = '';
  try {
    if (!fs) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', filePath, false);
      xhr.send(null);
      if (xhr.readyState === 4 && xhr.status === 200) {
        contents = xhr.responseText;
      }
    } else if (fs.existsSync(filePath)) {
      contents = fs.readFileSync(filePath, 'utf8');
    }
  } catch {}

  return fileContentsCache[filePath] = contents;
});

function supportRelativeURL(base, relative) {
  if (!base) return relative;
  const dir = path.dirname(base);
  const match = /^\w+:\/\/[^\/]*/.exec(dir);
  const protocol = match ? match[0] : '';
  const startPath = dir.slice(protocol.length);
  if (protocol && /^\/\w\:/.test(startPath)) {
    return protocol + '/' + path.resolve(dir.slice(protocol.length), relative).replace(/\\/g, '/');
  }
  return protocol + path.resolve(dir.slice(protocol.length), relative);
}

function retrieveSourceMapURL(source) {
  if (isInBrowser()) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', source, false);
      xhr.send(null);
      const header = xhr.getResponseHeader("SourceMap") || xhr.getResponseHeader("X-SourceMap");
      if (header) return header;
    } catch {}
  }

  const fileData = retrieveFile(source);
  const re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
  let lastMatch;
  let match;
  while ((match = re.exec(fileData))) lastMatch = match;
  if (!lastMatch) return null;
  return lastMatch[1];
}

const retrieveSourceMap = handlerExec(retrieveMapHandlers);
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
    return `eval at ${match[1]} (${position.source}:${position.line}:${position.column + 1})`;
  }

  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
  if (match) return `eval at ${match[1]} (${mapEvalOrigin(match[2])})`;
  
  return origin;
}

function CallSiteToString() {
  let fileLocation = '';
  if (this.isNative()) {
    fileLocation = 'native';
  } else {
    let fileName = this.getScriptNameOrSourceURL();
    if (!fileName && this.isEval()) {
      fileLocation = `${this.getEvalOrigin()}, `;
    }
    if (fileName) {
      fileLocation += fileName;
    } else {
      fileLocation += '<anonymous>';
    }
    const lineNumber = this.getLineNumber();
    if (lineNumber !== null) {
      fileLocation += `:${lineNumber}`;
      const columnNumber = this.getColumnNumber();
      if (columnNumber) fileLocation += `:${columnNumber}`;
    }
  }

  let line = '';
  const functionName = this.getFunctionName();
  const isConstructor = this.isConstructor();
  const isMethodCall = !(this.isToplevel() || isConstructor);

  if (isMethodCall) {
    const typeName = this.getTypeName() === "[object Object]" ? "null" : this.getTypeName();
    const methodName = this.getMethodName();

    if (functionName) {
      if (typeName && !functionName.startsWith(typeName)) {
        line += `${typeName}.`;
      }
      line += functionName;
      if (methodName && !functionName.endsWith(`.${methodName}`)) {
        line += ` [as ${methodName}]`;
      }
    } else {
      line += `${typeName}.${methodName || "<anonymous>"}`;
    }
  } else if (isConstructor) {
    line += `new ${functionName || "<anonymous>"}`;
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
    return line;
  }
  return `${line} (${fileLocation})`;
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
  if(frame.isNative()) {
    state.curPosition = null;
    return frame;
  }

  const source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    let line = frame.getLineNumber();
    let column = frame.getColumnNumber() - 1;

    const noHeader = /^v(10\.1[6-9]|10\.[2-9][0-9]|10\.[0-9]{3,}|1[2-9]\d*|[2-9]\d|\d{3,}|11\.11)/;
    const headerLength = noHeader.test(process.version) ? 0 : 62;
    if (line === 1 && column > headerLength && !isInBrowser() && !frame.isEval()) {
      column -= headerLength;
    }

    const position = mapSourcePosition({ source, line, column });
    state.curPosition = position;
    frame = cloneCallSite(frame);

    frame.getFunctionName = function() {
      return state.nextPosition ? (state.nextPosition.name || frame.getFunctionName()) : frame.getFunctionName();
    };
    frame.getFileName = () => position.source;
    frame.getLineNumber = () => position.line;
    frame.getColumnNumber = () => position.column + 1;
    frame.getScriptNameOrSourceURL = () => position.source;
    return frame;
  }

  if (frame.isEval()) {
    let origin = mapEvalOrigin(frame.getEvalOrigin());
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = () => origin;
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
  const errorString = `${name}: ${message}`;
  const state = { nextPosition: null, curPosition: null };

  const processedStack = stack.map((frame, i) => {
    state.curPosition = stack.length - 1 === i ? null : state.curPosition;
    return `\n    at ${wrapCallSite(frame, state)}`;
  });

  return errorString + processedStack.reverse().join('');
}

function getErrorSource(error) {
  const match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
  if (match) {
    const [_, source, line, column] = match;
    let contents = fileContentsCache[source] || (fs && fs.existsSync(source) ? fs.readFileSync(source, 'utf8') : '');
    const code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
    if (code) {
      return `${source}:${line}\n${code}\n${' '.repeat(column - 1)}^`;
    }
  }
  return null;
}

function printErrorAndExit(error) {
  const source = getErrorSource(error);

  if (process.stderr._handle && process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking(true);
  }
  if (source) console.error(`\n${source}`);

  console.error(error.stack);
  process.exit(1);
}

function shimEmitUncaughtException() {
  const originalEmit = process.emit;

  process.emit = function(type, ...args) {
    if (type === 'uncaughtException' && args[0]?.stack && !this.listeners(type).length) {
      return printErrorAndExit(args[0]);
    }
    return originalEmit.call(this, type, ...args);
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
      throw new Error(`environment ${environment} was unknown.`);
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
    if (!Module.prototype._compile.__sourceMapSupport) {
      const $compile = Module.prototype._compile;
      Module.prototype._compile = function(content, filename) {
        fileContentsCache[filename] = content;
        sourceMapCache[filename] = undefined;
        return $compile.call(this, content, filename);
      };
      Module.prototype._compile.__sourceMapSupport = true;
    }
  }

  if (!emptyCacheBetweenOperations) {
    emptyCacheBetweenOperations = options.emptyCacheBetweenOperations ?? false;
  }

  if (!errorFormatterInstalled) {
    errorFormatterInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;
  }

  if (!uncaughtShimInstalled) {
    const installHandler = options.handleUncaughtExceptions ?? true;
    try {
      const { isMainThread } = dynamicRequire(module, 'worker_threads');
      if (!isMainThread) return;
    } catch {}

    if (installHandler && hasGlobalProcessEventEmitter()) {
      uncaughtShimInstalled = true;
      shimEmitUncaughtException();
    }
  }
};

exports.resetRetrieveHandlers = function() {
  retrieveFileHandlers.length = 0;
  retrieveMapHandlers.length = 0;
  
  for (const handler of originalRetrieveFileHandlers) retrieveFileHandlers.push(handler);
  for (const handler of originalRetrieveMapHandlers) retrieveMapHandlers.push(handler);

  retrieveSourceMap = handlerExec(retrieveMapHandlers);
  retrieveFile = handlerExec(retrieveFileHandlers);
};

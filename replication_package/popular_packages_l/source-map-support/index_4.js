const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

class SourceMapSupport {
  constructor() {
    this.sourceMaps = {};
  }

  loadSourceMap(filePath, mapPath) {
    const mapContent = fs.readFileSync(mapPath, 'utf8');
    this.sourceMaps[filePath] = new SourceMapConsumer(JSON.parse(mapContent));
  }

  mapTrace(stack) {
    return stack.split('\n').map(line => {
      const match = line.match(/\((.*):(\d+):(\d+)\)$/);
      if (!match) return line;
      const [, file, lineNum, colNum] = match;
      const consumer = this.sourceMaps[file];
      if (!consumer) return line;
      const pos = consumer.originalPositionFor({
        line: parseInt(lineNum, 10),
        column: parseInt(colNum, 10)
      });
      if (!pos.source) return line;
      return line.replace(path.basename(file) + `:${lineNum}:${colNum}`, 
                          `${pos.source}:${pos.line}:${pos.column}`);
    }).join('\n');
  }

  install() {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (err, structuredStackTrace) => {
      const stack = originalPrepareStackTrace ? 
        originalPrepareStackTrace(err, structuredStackTrace) :
        structuredStackTrace.map(callSite => `    at ${callSite}`).join('\n');

      return this.mapTrace(stack);
    };
  }
}

const sourceMapSupport = new SourceMapSupport();

function install(options = {}) {
  const defaultOptions = {
    handleUncaughtExceptions: true,
    retrieveSourceMap: null,
    environment: 'auto',
    hookRequire: false
  };

  const finalOptions = { ...defaultOptions, ...options };

  if (finalOptions.retrieveSourceMap) {
    sourceMapSupport.loadSourceMap = finalOptions.retrieveSourceMap;
  }

  sourceMapSupport.install();

  if (finalOptions.handleUncaughtExceptions) {
    process.on('uncaughtException', err => {
      console.error(err.stack);
      process.exit(1);
    });
  }
}

module.exports = {
  install,
  SourceMapSupport
};

const fs = require('fs');
const path = require('path');
const sourceMap = require('source-map');

class SourceMapHandler {
  constructor() {
    this.sourceMaps = {};
  }

  loadMap(filePath, mapFile) {
    const mapData = fs.readFileSync(mapFile, 'utf8');
    const mapConsumer = new sourceMap.SourceMapConsumer(JSON.parse(mapData));
    this.sourceMaps[filePath] = mapConsumer;
  }

  transformStackTrace(trace) {
    return trace.split('\n').map((line) => {
      const match = line.match(/\((.*):(\d+):(\d+)\)$/);
      if (!match) return line;
      const [_, file, lineNum, colNum] = match;
      const consumer = this.sourceMaps[file];
      if (!consumer) return line;
      const origPos = consumer.originalPositionFor({
        line: Number(lineNum),
        column: Number(colNum)
      });
      if (!origPos.source) return line;
      return line.replace(`${path.basename(file)}:${lineNum}:${colNum}`, `${origPos.source}:${origPos.line}:${origPos.column}`);
    }).join('\n');
  }

  apply() {
    const basePrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (error, callSites) => {
      const stack = basePrepareStackTrace
        ? basePrepareStackTrace(error, callSites)
        : callSites.map((callSite) => `    at ${callSite}`).join('\n');

      return this.transformStackTrace(stack);
    };
  }
}

const sourceMapHandler = new SourceMapHandler();

function enable(options = {}) {
  const defaults = {
    handleUncaughtExceptions: true,
    customSourceMapRetrieval: null,
    env: 'auto',
    requireSourcesHook: false
  };

  const settings = { ...defaults, ...options };

  if (settings.customSourceMapRetrieval) {
    sourceMapHandler.loadMap = settings.customSourceMapRetrieval;
  }

  sourceMapHandler.apply();

  if (settings.handleUncaughtExceptions) {
    process.on('uncaughtException', (error) => {
      console.error(error.stack);
      process.exit(1);
    });
  }
}

module.exports = {
  enable,
  SourceMapHandler
};

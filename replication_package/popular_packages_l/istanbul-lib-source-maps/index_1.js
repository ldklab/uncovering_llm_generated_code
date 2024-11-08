// index.js

const debug = require('debug')('istanbuljs');
const { SourceMapConsumer } = require('source-map');

class IstanbulLibSourceMaps {
  constructor() {
    debug('Creating an instance of IstanbulLibSourceMaps');
  }

  async processSourceMap(sourceMapContent) {
    debug('Processing source map');
    
    try {
      const consumer = await new SourceMapConsumer(sourceMapContent);

      const generatedPosition = consumer.generatedPositionFor({
        source: 'source.js',
        line: 1,
        column: 0
      });

      debug('Generated position:', generatedPosition);

      return {
        generatedLine: generatedPosition.line,
        generatedColumn: generatedPosition.column
      };

    } catch (error) {
      debug('Error processing source map:', error);
      throw error;
    } finally {
      if (typeof sourceMapContent.destroy === 'function') {
        sourceMapContent.destroy();
      }
    }
  }
}

module.exports = IstanbulLibSourceMaps;

if (require.main === module) {
  (async () => {
    const sourceMaps = new IstanbulLibSourceMaps();
    const result = await sourceMaps.processSourceMap({
      version: 3,
      file: 'out.js',
      sources: ['foo.js'],
      names: ['src', 'maps', 'are', 'fun'],
      mappings: 'AA,AB;;ABCDE;',
    });
    console.log('Result:', result);
  })();
}

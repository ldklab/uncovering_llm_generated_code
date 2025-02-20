// index.js
const debug = require('debug')('istanbuljs');
const { SourceMapConsumer } = require('source-map');

class SourceMapProcessor {
  constructor() {
    debug('Instance of SourceMapProcessor created');
  }

  async handleSourceMap(content) {
    debug('Begin handling source map');
    let consumer;

    try {
      consumer = await new SourceMapConsumer(content);

      const originalPosition = consumer.generatedPositionFor({
        source: 'source.js',
        line: 1,
        column: 0
      });

      debug('Original position:', originalPosition);

      return {
        generatedLine: originalPosition.line,
        generatedColumn: originalPosition.column
      };

    } catch (err) {
      debug('Failed to process source map:', err);
      throw err;
    } finally {
      if (consumer) {
        if (typeof consumer.destroy === 'function') {
          consumer.destroy();
        }
      }
    }
  }
}

module.exports = SourceMapProcessor;

// Usage example
if (require.main === module) {
  (async () => {
    const processor = new SourceMapProcessor();
    const sourceMapData = {
      version: 3,
      file: 'out.js',
      sources: ['foo.js'],
      names: ['src', 'maps', 'are', 'fun'],
      mappings: 'AA,AB;;ABCDE;',
    };

    try {
      const output = await processor.handleSourceMap(sourceMapData);
      console.log('Output:', output);
    } catch (error) {
      console.error('Error during source map processing:', error);
    }
  })();
}

// index.js
const debug = require('debug')('istanbuljs');
const { SourceMapConsumer } = require('source-map');

class SourceMapProcessor {
  constructor() {
    debug('Creating an instance of SourceMapProcessor');
  }

  async processSourceMap(sourceMapContent) {
    debug('Processing source map');
    try {
      const consumer = await new SourceMapConsumer(sourceMapContent);

      const originalPosition = { source: 'source.js', line: 1, column: 0 };
      const generatedPosition = consumer.generatedPositionFor(originalPosition);
      
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

module.exports = SourceMapProcessor;

// Usage example
if (require.main === module) {
  (async () => {
    const processor = new SourceMapProcessor();
    const sourceMap = {
      version: 3,
      file: 'out.js',
      sources: ['foo.js'],
      names: ['src', 'maps', 'are', 'fun'],
      mappings: 'AA,AB;;ABCDE;',
    };
    
    try {
      const result = await processor.processSourceMap(sourceMap);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  })();
}

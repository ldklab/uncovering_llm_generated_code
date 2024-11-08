const V8ToIstanbul = require('./lib/v8-to-istanbul');

function createV8CoverageTransformer(filePath, codeWrapperLength, sourceFiles, excludeFilePath) {
  // Instantiate a new V8ToIstanbul object with the specified parameters
  return new V8ToIstanbul(filePath, codeWrapperLength, sourceFiles, excludeFilePath);
}

// Export the createV8CoverageTransformer function for external use
module.exports = createV8CoverageTransformer;

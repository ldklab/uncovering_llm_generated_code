// Import the V8ToIstanbul class from a local file
const V8ToIstanbul = require('./lib/v8-to-istanbul');

// Export a function that returns a new instance of V8ToIstanbul
module.exports = function createV8ToIstanbulInstance(path, wrapperLength, sources, excludePath) {
  return new V8ToIstanbul(path, wrapperLength, sources, excludePath);
};

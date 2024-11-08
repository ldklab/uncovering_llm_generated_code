const V8ToIstanbul = require('./lib/v8-to-istanbul');

function createV8ToIstanbulInstance(path, wrapperLength, sources, excludePath) {
  return new V8ToIstanbul(path, wrapperLength, sources, excludePath);
}

module.exports = createV8ToIstanbulInstance;

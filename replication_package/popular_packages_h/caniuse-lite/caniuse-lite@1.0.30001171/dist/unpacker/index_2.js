'use strict';

// Import modules
const { agents } = require('./agents');
const featureModule = require('./feature');
const { features } = require('./features');
const regionModule = require('./region');

// Define interoperability function for CommonJS / ES6 compatibility
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Export selected parts of the modules
Object.defineProperty(exports, "__esModule", { value: true });

Object.defineProperty(exports, 'agents', {
  enumerable: true,
  get: function get() {
    return agents;
  }
});

Object.defineProperty(exports, 'feature', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(featureModule).default;
  }
});

Object.defineProperty(exports, 'features', {
  enumerable: true,
  get: function get() {
    return features;
  }
});

Object.defineProperty(exports, 'region', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(regionModule).default;
  }
});

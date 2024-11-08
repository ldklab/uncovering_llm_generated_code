'use strict';

const vendors = require('./vendors.json');
const env = process.env;

// Exporting an array of vendor names used for testing purposes
Object.defineProperty(exports, '_vendors', {
  value: vendors.map(vendor => vendor.constant)
});

exports.name = null;
exports.isPR = null;

// Iterate through each CI vendor to determine if the code is running within one of them
vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  
  const matchesCI = envs.every(envVar => checkEnv(envVar));
  
  exports[vendor.constant] = matchesCI;

  if (matchesCI) {
    exports.name = vendor.name;
    
    if (typeof vendor.pr === 'string') {
      exports.isPR = !!env[vendor.pr];
    } else if (typeof vendor.pr === 'object') {
      if (vendor.pr.env) {
        exports.isPR = vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
      } else if (vendor.pr.any) {
        exports.isPR = vendor.pr.any.some(prVar => !!env[prVar]);
      } else {
        exports.isPR = checkEnv(vendor.pr);
      }
    } else {
      exports.isPR = null; // Unsupported PR detection
    }
  }
});

// Determines if the script is running in a CI environment using common CI indicators
exports.isCI = Boolean(
  env.CI ||
  env.CONTINUOUS_INTEGRATION ||
  env.BUILD_NUMBER ||
  env.RUN_ID ||
  exports.name
);

// Helper function to verify if specific environment variables match expected conditions
function checkEnv(settings) {
  if (typeof settings === 'string') {
    return !!env[settings];
  }
  return Object.keys(settings).every(key => env[key] === settings[key]);
}

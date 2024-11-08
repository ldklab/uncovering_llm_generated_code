'use strict';

const vendors = require('./vendors.json');
const env = process.env;

// Export an array of vendor constants
exports._vendors = vendors.map(vendor => vendor.constant);

exports.name = null;
exports.isPR = null;

// Loop through each vendor configuration to identify CI environment
vendors.forEach(vendor => {
  const envVariables = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envVariables.every(checkEnv);

  // Set the vendor constant and continue if not in CI environment
  exports[vendor.constant] = isCI;

  if (!isCI) return;

  // Set the vendor name
  exports.name = vendor.name;

  // Determine if the current environment is a pull request
  switch (typeof vendor.pr) {
    case 'string':
      exports.isPR = !!env[vendor.pr];
      break;
    case 'object':
      if ('env' in vendor.pr) {
        exports.isPR = vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
      } else if ('any' in vendor.pr) {
        exports.isPR = vendor.pr.any.some(key => !!env[key]);
      } else {
        exports.isPR = checkEnv(vendor.pr);
      }
      break;
    default:
      exports.isPR = null;
  }
});

// Determine if the current environment is a CI environment
exports.isCI = !!(
  env.CI !== 'false' &&
  (env.BUILD_ID ||
   env.BUILD_NUMBER ||
   env.CI ||
   env.CI_APP_ID ||
   env.CI_BUILD_ID ||
   env.CI_BUILD_NUMBER ||
   env.CI_NAME ||
   env.CONTINUOUS_INTEGRATION ||
   env.RUN_ID ||
   exports.name)
);

// Function to check environment variables according to conditions
function checkEnv(obj) {
  if (typeof obj === 'string') return !!env[obj];

  if ('env' in obj) {
    return env[obj.env] && env[obj.env].includes(obj.includes);
  }
  if ('any' in obj) {
    return obj.any.some(key => !!env[key]);
  }
  return Object.keys(obj).every(key => env[key] === obj[key]);
}

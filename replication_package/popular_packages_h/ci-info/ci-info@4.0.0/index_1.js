'use strict';

const vendors = require('./vendors.json');
const env = process.env;

// For testing purpose: Export list of vendor constants
Object.defineProperty(exports, '_vendors', {
  value: vendors.map(v => v.constant)
});

exports.name = null;
exports.isPR = null;

// Function to evaluate if environment variables match a condition
function checkEnv(obj) {
  if (typeof obj === 'string') return !!env[obj];

  if ('env' in obj) {
    return env[obj.env] && env[obj.env].includes(obj.includes);
  }

  if ('any' in obj) {
    return obj.any.some(k => !!env[k]);
  }

  return Object.keys(obj).every(k => env[k] === obj[k]);
}

// Main logic to evaluate each vendor
vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envs.every(checkEnv);

  exports[vendor.constant] = isCI;

  if (isCI) {
    exports.name = vendor.name;

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
  }
});

// Determine if the environment is any CI
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
  exports.name ||
  false)
);

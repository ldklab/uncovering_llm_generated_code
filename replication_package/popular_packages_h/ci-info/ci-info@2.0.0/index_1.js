'use strict';

const vendors = require('./vendors.json');
const env = process.env;

// Exporting vendor constants for testing
Object.defineProperty(exports, '_vendors', {
  value: vendors.map(vendor => vendor.constant),
});

exports.name = null;
exports.isPR = null;

// Iterate over each vendor to determine CI and PR status
for (const vendor of vendors) {
  const envConditions = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCurrentCI = envConditions.every(checkEnv);

  exports[vendor.constant] = isCurrentCI;

  if (isCurrentCI) {
    exports.name = vendor.name;
    
    if (typeof vendor.pr === 'string') {
      exports.isPR = Boolean(env[vendor.pr]);
    } else if (typeof vendor.pr === 'object') {
      if ('env' in vendor.pr) {
        exports.isPR = vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
      } else if ('any' in vendor.pr) {
        exports.isPR = vendor.pr.any.some(key => Boolean(env[key]));
      } else {
        exports.isPR = checkEnv(vendor.pr);
      }
    } else {
      exports.isPR = null;
    }
  }
}

exports.isCI = Boolean(
  env.CI || 
  env.CONTINUOUS_INTEGRATION || 
  env.BUILD_NUMBER || 
  env.RUN_ID || 
  exports.name
);

function checkEnv(condition) {
  if (typeof condition === 'string') return Boolean(env[condition]);
  return Object.entries(condition).every(([key, value]) => env[key] === value);
}

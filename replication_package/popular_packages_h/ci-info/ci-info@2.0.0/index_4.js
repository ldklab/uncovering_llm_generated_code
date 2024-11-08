'use strict';

const vendors = require('./vendors.json');

const env = process.env;

Object.defineProperty(exports, '_vendors', {
  value: vendors.map(v => v.constant)
});

exports.name = null;
exports.isPR = null;

vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envs.every(checkEnv);

  exports[vendor.constant] = isCI;

  if (isCI) {
    exports.name = vendor.name;

    if (typeof vendor.pr === 'string') {
      exports.isPR = !!env[vendor.pr];
    } else if (typeof vendor.pr === 'object') {
      if ('env' in vendor.pr) {
        exports.isPR = vendor.pr.env in env && env[vendor.pr.env] !== vendor.pr.ne;
      } else if ('any' in vendor.pr) {
        exports.isPR = vendor.pr.any.some(key => !!env[key]);
      } else {
        exports.isPR = checkEnv(vendor.pr);
      }
    } else {
      exports.isPR = null;
    }
  }
});

exports.isCI = !!(
  env.CI ||
  env.CONTINUOUS_INTEGRATION ||
  env.BUILD_NUMBER ||
  env.RUN_ID ||
  exports.name
);

function checkEnv(obj) {
  if (typeof obj === 'string') return !!env[obj];
  return Object.keys(obj).every(k => env[k] === obj[k]);
}

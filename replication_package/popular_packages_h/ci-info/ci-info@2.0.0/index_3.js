'use strict';

const vendors = require('./vendors.json');
const env = process.env;

Object.defineProperty(exports, '_vendors', {
  value: vendors.map(vendor => vendor.constant)
});

exports.name = null;
exports.isPR = null;

vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envs.every(checkEnv);

  exports[vendor.constant] = isCI;

  if (isCI) {
    exports.name = vendor.name;
    exports.isPR = detectPrState(vendor.pr);
  }
});

exports.isCI = Boolean(
  env.CI ||
  env.CONTINUOUS_INTEGRATION ||
  env.BUILD_NUMBER ||
  env.RUN_ID ||
  exports.name
);

function checkEnv(obj) {
  if (typeof obj === 'string') return Boolean(env[obj]);
  return Object.keys(obj).every(key => env[key] === obj[key]);
}

function detectPrState(prConfig) {
  switch (typeof prConfig) {
    case 'string':
      return Boolean(env[prConfig]);
    case 'object':
      if ('env' in prConfig) {
        return env[prConfig.env] !== prConfig.ne;
      }
      if ('any' in prConfig) {
        return prConfig.any.some(key => Boolean(env[key]));
      }
      return checkEnv(prConfig);
    default:
      return null;
  }
}

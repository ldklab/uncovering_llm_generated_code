'use strict';

const vendors = require('./vendors.json');
const env = process.env;

Object.defineProperty(exports, '_vendors', {
  value: vendors.map(v => v.constant)
});

exports.name = null;
exports.isPR = null;
exports.isCI = false;

vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envs.every(checkEnv);

  exports[vendor.constant] = isCI;

  if (isCI) {
    exports.name = vendor.name;
    exports.isPR = determinePRStatus(vendor.pr);
  }
});

exports.isCI = Boolean(shouldFlagAsCI());

function shouldFlagAsCI() {
  return env.CI !== 'false' && (
    env.BUILD_ID ||
    env.BUILD_NUMBER ||
    env.CI ||
    env.CI_APP_ID ||
    env.CI_BUILD_ID ||
    env.CI_BUILD_NUMBER ||
    env.CI_NAME ||
    env.CONTINUOUS_INTEGRATION ||
    env.RUN_ID ||
    exports.name
  );
}

function checkEnv(obj) {
  if (typeof obj === 'string') return Boolean(env[obj]);

  if ('env' in obj) {
    return env[obj.env] && env[obj.env].includes(obj.includes);
  }
  if ('any' in obj) {
    return obj.any.some(key => Boolean(env[key]));
  }
  return Object.keys(obj).every(key => env[key] === obj[key]);
}

function determinePRStatus(prConfig) {
  if (typeof prConfig === 'string') {
    return Boolean(env[prConfig]);
  } else if (typeof prConfig === 'object') {
    if ('env' in prConfig) {
      return prConfig.env in env && env[prConfig.env] !== prConfig.ne;
    } else if ('any' in prConfig) {
      return prConfig.any.some(key => Boolean(env[key]));
    } else {
      return checkEnv(prConfig);
    }
  }
  return null;
}

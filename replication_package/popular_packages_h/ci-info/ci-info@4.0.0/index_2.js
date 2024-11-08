'use strict';

const vendors = require('./vendors.json');

const env = process.env;

// Exported for testing purposes
Object.defineProperty(exports, '_vendors', {
  value: vendors.map(vendor => vendor.constant)
});

exports.name = null;
exports.isPR = null;

// Check each vendor from the list
vendors.forEach(vendor => {
  const envs = Array.isArray(vendor.env) ? vendor.env : [vendor.env];
  const isCI = envs.every(checkEnv);

  exports[vendor.constant] = isCI;

  if (!isCI) return;

  exports.name = vendor.name;

  switch (typeof vendor.pr) {
    case 'string':
      exports.isPR = Boolean(env[vendor.pr]);
      break;
    case 'object':
      exports.isPR = checkPrEnv(vendor.pr, env);
      break;
    default:
      exports.isPR = null;
  }
});

exports.isCI = !!(
  env.CI !== 'false' &&
  (env.BUILD_ID || env.BUILD_NUMBER || env.CI || env.CI_APP_ID ||
   env.CI_BUILD_ID || env.CI_BUILD_NUMBER || env.CI_NAME ||
   env.CONTINUOUS_INTEGRATION || env.RUN_ID || exports.name || false)
);

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

function checkPrEnv(pr, env) {
  if ('env' in pr) {
    return pr.env in env && env[pr.env] !== pr.ne;
  } else if ('any' in pr) {
    return pr.any.some(key => Boolean(env[key]));
  } 
  return checkEnv(pr);
}

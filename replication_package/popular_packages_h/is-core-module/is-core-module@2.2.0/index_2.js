'use strict';

const has = require('has');
const data = require('./core.json');

function specifierIncluded(currentVersion, specifier) {
  const currentParts = currentVersion.split('.').map(Number);
  const [operator, version] = specifier.includes(' ') ? specifier.split(' ') : ['=', specifier];
  const specVersionParts = version.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const currentPart = currentParts[i] || 0;
    const specPart = specVersionParts[i] || 0;
    if (currentPart !== specPart) {
      if (operator === '<') return currentPart < specPart;
      if (operator === '>=') return currentPart >= specPart;
      return false;
    }
  }

  return operator === '>=';
}

function matchesRange(currentVersion, range) {
  const specifiers = range.split(/ ?&& ?/);
  return specifiers.every(specifier => specifierIncluded(currentVersion, specifier));
}

function versionIncluded(nodeVersion, specifierValue) {
  if (typeof specifierValue === 'boolean') return specifierValue;

  const currentVersion = nodeVersion || (process.versions && process.versions.node);

  if (typeof currentVersion !== 'string') {
    throw new TypeError(nodeVersion ? 'A valid node version is required' : 'Unable to determine current node version');
  }

  if (Array.isArray(specifierValue)) {
    return specifierValue.some(range => matchesRange(currentVersion, range));
  }

  return matchesRange(currentVersion, specifierValue);
}

module.exports = function isCore(moduleName, nodeVersion) {
  return has(data, moduleName) && versionIncluded(nodeVersion, data[moduleName]);
};

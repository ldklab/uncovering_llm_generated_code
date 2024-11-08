'use strict';

const hasOwn = require('hasown');

function specifierIncluded(current, specifier) {
  const nodeParts = current.split('.');
  const [op, versionSpecifier] = specifier.includes(' ') ? specifier.split(' ') : ['=', specifier];
  const versionParts = versionSpecifier.split('.');

  for (let i = 0; i < 3; ++i) {
    const cur = parseInt(nodeParts[i] || 0, 10);
    const ver = parseInt(versionParts[i] || 0, 10);
    if (cur === ver) continue;
    if (op === '<') return cur < ver;
    if (op === '>=') return cur >= ver;
    return false;
  }
  return op === '>=';
}

function matchesRange(current, range) {
  const specifiers = range.split(/ ?&& ?/);
  return specifiers.every(specifier => specifierIncluded(current, specifier));
}

function versionIncluded(nodeVersion, specifierValue) {
  if (typeof specifierValue === 'boolean') {
    return specifierValue;
  }

  const current = nodeVersion || process.versions?.node;

  if (typeof current !== 'string') {
    throw new TypeError('Unable to determine a valid node version');
  }

  if (Array.isArray(specifierValue)) {
    return specifierValue.some(range => matchesRange(current, range));
  }

  return matchesRange(current, specifierValue);
}

const data = require('./core.json');

module.exports = function isCore(x, nodeVersion) {
  return hasOwn(data, x) && versionIncluded(nodeVersion, data[x]);
};

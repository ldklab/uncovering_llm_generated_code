'use strict';

const has = require('has');

// Compare current node version with a specifier like ">=8.0.0"
function specifierIncluded(current, specifier) {
  const nodeParts = current.split('.');
  const parts = specifier.split(' ');
  const op = parts.length > 1 ? parts[0] : '=';
  const versionParts = (parts.length > 1 ? parts[1] : parts[0]).split('.');

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

// Checks if the current version satisfies all provided range conditions
function matchesRange(current, range) {
  const specifiers = range.split(/ ?&& ?/);
  if (specifiers.length === 0) return false;

  for (const specifier of specifiers) {
    if (!specifierIncluded(current, specifier)) {
      return false;
    }
  }

  return true;
}

// Determines if the node version satisfies the specifier value criteria
function versionIncluded(nodeVersion, specifierValue) {
  if (typeof specifierValue === 'boolean') return specifierValue;

  const current = nodeVersion ?? process?.versions?.node;

  if (typeof current !== 'string') {
    throw new TypeError(nodeVersion === undefined 
      ? 'Unable to determine current node version' 
      : 'If provided, a valid node version is required');
  }

  if (specifierValue && typeof specifierValue === 'object') {
    for (const range of specifierValue) {
      if (matchesRange(current, range)) {
        return true;
      }
    }
    return false;
  }

  return matchesRange(current, specifierValue);
}

const data = require('./core.json');

// Main function to check if 'x' is a core feature for the node version
module.exports = function isCore(x, nodeVersion) {
  return has(data, x) && versionIncluded(nodeVersion, data[x]);
};

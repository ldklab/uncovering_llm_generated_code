'use strict';

var hasOwn = require('hasown');

/**
 * Determines if a specific version is included based on a specifier.
 * 
 * @param {string} current - The current version of node in 'x.y.z' format.
 * @param {string} specifier - The specified range with comparison operator.
 * @returns {boolean} True if the version matches the specifier criterion.
 */
function specifierIncluded(current, specifier) {
    var nodeParts = current.split('.');
    var parts = specifier.split(' ');
    var op = parts.length > 1 ? parts[0] : '=';
    var versionParts = (parts.length > 1 ? parts[1] : parts[0]).split('.');

    for (var i = 0; i < 3; ++i) {
        var cur = parseInt(nodeParts[i] || 0, 10);
        var ver = parseInt(versionParts[i] || 0, 10);
        if (cur === ver) {
            continue;
        }
        if (op === '<') {
            return cur < ver;
        }
        if (op === '>=') {
            return cur >= ver;
        }
        return false;
    }
    return op === '>=';
}

/**
 * Checks if a current version matches a specified range.
 *
 * @param {string} current - The current node version.
 * @param {string} range - The range of versions specified with logical operators.
 * @returns {boolean} True if the current version matches the range.
 */
function matchesRange(current, range) {
    var specifiers = range.split(/ ?&& ?/);
    if (specifiers.length === 0) {
        return false;
    }
    for (var i = 0; i < specifiers.length; ++i) {
        if (!specifierIncluded(current, specifiers[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Determines if a node version is included based on the specifier value.
 *
 * @param {string} nodeVersion - The version of the node.
 * @param {boolean|object} specifierValue - The specifier that might be a boolean or object.
 * @returns {boolean} - True if the version is included, false otherwise.
 */
function versionIncluded(nodeVersion, specifierValue) {
    if (typeof specifierValue === 'boolean') {
        return specifierValue;
    }

    var current = typeof nodeVersion === 'undefined'
        ? (process.versions && process.versions.node)
        : nodeVersion;

    if (typeof current !== 'string') {
        throw new TypeError(typeof nodeVersion === 'undefined' ? 'Unable to determine current node version' : 'If provided, a valid node version is required');
    }

    if (specifierValue && typeof specifierValue === 'object') {
        for (var i = 0; i < specifierValue.length; ++i) {
            if (matchesRange(current, specifierValue[i])) {
                return true;
            }
        }
        return false;
    }
    return matchesRange(current, specifierValue);
}

var data = require('./core.json');

/**
 * Determines if a node module is a core module for the provided node version.
 *
 * @param {string} x - The module name.
 * @param {string} nodeVersion - The version of the node to check against.
 * @returns {boolean} True if the module is a core module, false otherwise.
 */
module.exports = function isCore(x, nodeVersion) {
    return hasOwn(data, x) && versionIncluded(nodeVersion, data[x]);
};

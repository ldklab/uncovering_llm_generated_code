'use strict';

const has = require('has');

function specifierIncluded(current, specifier) {
	const nodeParts = current.split('.').map(Number);
	const parts = specifier.split(' ');
	const op = parts.length > 1 ? parts[0] : '=';
	const versionParts = parts.length > 1 ? parts[1].split('.').map(Number) : nodeParts;

	for (let i = 0; i < 3; ++i) {
		const cur = nodeParts[i] || 0;
		const ver = versionParts[i] || 0;
		if (cur === ver) continue;
		
		switch (op) {
			case '<':
				return cur < ver;
			case '>=':
				return cur >= ver;
			default:
				return false;
		}
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

	const current = nodeVersion ?? process.versions?.node;
  
	if (typeof current !== 'string') {
		throw new TypeError('A valid node version is required');
	}

	if (Array.isArray(specifierValue)) {
		return specifierValue.some(range => matchesRange(current, range));
	}

	return matchesRange(current, specifierValue);
}

const data = require('./core.json');

module.exports = function isCore(x, nodeVersion) {
	return has(data, x) && versionIncluded(nodeVersion, data[x]);
};

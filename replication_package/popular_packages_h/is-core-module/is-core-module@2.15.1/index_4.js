'use strict';

const hasOwn = require('hasown');

function specifierIncluded(current, specifier) {
	const nodeParts = current.split('.').map(Number);
	const [op, version] = specifier.includes(' ') ? specifier.split(' ') : ['=', specifier];
	const versionParts = version.split('.').map(Number);

	for (let i = 0; i < 3; ++i) {
		const cur = nodeParts[i] || 0;
		const ver = versionParts[i] || 0;
		if (cur !== ver) {
			if (op === '<') return cur < ver;
			if (op === '>=') return cur >= ver;
			return false;
		}
	}
	return op === '>=';
}

function matchesRange(current, range) {
	const specifiers = range.split(/ ?&& ?/).filter(Boolean);
	return specifiers.every(specifier => specifierIncluded(current, specifier));
}

function versionIncluded(nodeVersion, specifierValue) {
	if (typeof specifierValue === 'boolean') return specifierValue;

	const currentVersion = nodeVersion ?? process.versions?.node;

	if (typeof currentVersion !== 'string') {
		throw new TypeError(nodeVersion === undefined
			? 'Unable to determine current node version'
			: 'If provided, a valid node version is required');
	}

	if (Array.isArray(specifierValue)) {
		return specifierValue.some(range => matchesRange(currentVersion, range));
	}
	return matchesRange(currentVersion, specifierValue);
}

const data = require('./core.json');

module.exports = function isCore(moduleName, nodeVersion) {
	return hasOwn(data, moduleName) && versionIncluded(nodeVersion, data[moduleName]);
};

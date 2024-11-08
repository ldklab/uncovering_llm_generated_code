'use strict';

const hasOwn = require('hasown');
const data = require('./core.json');

function specifierIncluded(currentVersion, versionSpecifier) {
	const currentParts = currentVersion.split('.');
	const [op, versionPart] = versionSpecifier.includes(' ') ? versionSpecifier.split(' ') : ['=', versionSpecifier];
	const specifierParts = versionPart.split('.');
	
	for (let i = 0; i < 3; i++) {
		const currentSegment = parseInt(currentParts[i] || 0, 10);
		const specifierSegment = parseInt(specifierParts[i] || 0, 10);
		
		if (currentSegment === specifierSegment) continue;
		
		if (op === '<') return currentSegment < specifierSegment;
		if (op === '>=') return currentSegment >= specifierSegment;
		return false;
	}
	return op === '>=';
}

function matchesRange(currentVersion, range) {
	const specifiers = range.split(/ ?&& ?/);
	return specifiers.every(specifier => specifierIncluded(currentVersion, specifier));
}

function versionIncluded(nodeVersion = process.versions.node, specifier) {
	if (typeof specifier === 'boolean') return specifier;
	if (typeof nodeVersion !== 'string') throw new TypeError('A valid Node.js version is required');
	
	if (Array.isArray(specifier)) {
		return specifier.some(range => matchesRange(nodeVersion, range));
	}
	return matchesRange(nodeVersion, specifier);
}

module.exports = function isCore(moduleName, nodeVersion) {
	return hasOwn(data, moduleName) && versionIncluded(nodeVersion, data[moduleName]);
};

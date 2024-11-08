'use strict';

const { has: hasCanonical, get: getCanonical } = require('unicode-canonical-property-names-ecmascript');
const { has: hasAlias, get: getAlias } = require('unicode-property-aliases-ecmascript');

const matchProperty = function(property) {
	if (hasCanonical(property)) {
		return property;
	}
	if (hasAlias(property)) {
		return getAlias(property);
	}
	throw new Error(`Unknown property: ${ property }`);
};

module.exports = matchProperty;

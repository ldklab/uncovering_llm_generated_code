'use strict';

const canonicalPropertyNames = require('unicode-canonical-property-names-ecmascript');
const propertyNameAliases = require('unicode-property-aliases-ecmascript');

function findCanonicalProperty(property) {
	if (canonicalPropertyNames.has(property)) {
		return property;
	}
	if (propertyNameAliases.has(property)) {
		return propertyNameAliases.get(property);
	}
	throw new Error(`Unknown property: ${ property }`);
}

module.exports = findCanonicalProperty;

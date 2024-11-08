'use strict';

const canonicalProperties = require('unicode-canonical-property-names-ecmascript');
const propertyAliases = require('unicode-property-aliases-ecmascript');

function matchProperty(property) {
    if (canonicalProperties.has(property)) {
        return property;
    }
    const alias = propertyAliases.get(property);
    if (alias) {
        return alias;
    }
    throw new Error(`Unknown property: ${property}`);
}

module.exports = matchProperty;

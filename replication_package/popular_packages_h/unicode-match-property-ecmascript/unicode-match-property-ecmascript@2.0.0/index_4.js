'use strict';

const canonicalProps = require('unicode-canonical-property-names-ecmascript');
const propAliases = require('unicode-property-aliases-ecmascript');

const matchProperty = (property) => {
    if (canonicalProps.has(property)) {
        return property;
    }
    if (propAliases.has(property)) {
        return propAliases.get(property);
    }
    throw new Error(`Unknown property: ${property}`);
};

module.exports = matchProperty;

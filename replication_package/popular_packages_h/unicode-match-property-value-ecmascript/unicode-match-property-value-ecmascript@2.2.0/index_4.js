'use strict';

const propertyToValueMappings = require('./data/mappings.js');

function matchPropertyWithValue(property, value) {
    const aliasToCanonical = propertyToValueMappings.get(property);
    
    if (!aliasToCanonical) {
        throw new Error(`Unknown property \`${property}\`.`);
    }
    
    const canonicalRepresentation = aliasToCanonical.get(value);
    if (canonicalRepresentation) {
        return canonicalRepresentation;
    }
    
    throw new Error(`Unknown value \`${value}\` for property \`${property}\`.`);
}

module.exports = matchPropertyWithValue;

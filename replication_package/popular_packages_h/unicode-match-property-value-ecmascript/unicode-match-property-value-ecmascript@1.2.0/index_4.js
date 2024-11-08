'use strict';

const propertyToValueAliases = require('./data/mappings.js');

const matchPropertyValue = function(property, value) {
    // Retrieve the mapping of aliases to values for the given property.
    const aliasToValueMap = propertyToValueAliases.get(property);

    // If no mapping exists for the given property, throw an error.
    if (!aliasToValueMap) {
        throw new Error(`Unknown property \`${ property }\`.`);
    }

    // Attempt to find the canonical value for the given value from the alias map.
    const canonicalValue = aliasToValueMap.get(value);

    // If a canonical value was found, return it.
    if (canonicalValue) {
        return canonicalValue;
    }

    // If no canonical value was found, throw an error for the unknown value.
    throw new Error(`Unknown value \`${ value }\` for property \`${ property }\`.`);
};

// Export the function to allow it to be imported in other modules.
module.exports = matchPropertyValue;

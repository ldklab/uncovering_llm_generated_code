'use strict';

// Import mapping of property aliases to canonical values from a module
const propertyToValueAliases = require('./data/mappings.js');

// Function to match a property and its alias to a canonical value
const matchPropertyValue = (property, value) => {
    // Get the map of aliases to canonical values for the given property
    const aliasToValue = propertyToValueAliases.get(property);

    // Check if the property is valid
    if (!aliasToValue) {
        throw new Error(`Unknown property \`${property}\`.`);
    }

    // Try to get the canonical value for the provided alias
    const canonicalValue = aliasToValue.get(value);

    // If a canonical value exists, return it
    if (canonicalValue) {
        return canonicalValue;
    }

    // If no canonical value found, throw an error
    throw new Error(`Unknown value \`${value}\` for property \`${property}\`.`);
};

// Export the function for external use
module.exports = matchPropertyValue;

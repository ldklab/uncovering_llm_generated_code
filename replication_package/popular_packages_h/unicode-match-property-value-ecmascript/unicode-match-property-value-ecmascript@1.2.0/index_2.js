'use strict';

// Import the property to value alias mappings from an external file
const propertyToValueAliases = require('./data/mappings.js');

// Define a function to match property values based on mappings
const matchPropertyValue = (property, value) => {
  // Attempt to get the alias map for the provided property
  const aliasToValue = propertyToValueAliases.get(property);

  // If the property is not found, throw an error
  if (!aliasToValue) {
    throw new Error(`Unknown property \`${property}\`.`);
  }

  // Attempt to retrieve the canonical value from the alias map
  const canonicalValue = aliasToValue.get(value);

  // If a canonical value is found, return it
  if (canonicalValue) {
    return canonicalValue;
  }

  // If the value is not found, throw an error
  throw new Error(`Unknown value \`${value}\` for property \`${property}\`.`);
};

// Export the function as a module
module.exports = matchPropertyValue;

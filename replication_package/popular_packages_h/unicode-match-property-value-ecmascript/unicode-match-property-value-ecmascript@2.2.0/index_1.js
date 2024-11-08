'use strict';

// Import the mapping data
const propertyToValueAliases = require('./data/mappings.js');

// Function to match a property-value pair
function matchPropertyValue(property, value) {
	// Retrieve alias to canonical value mapping for the given property
	const aliasToCanonical = propertyToValueAliases.get(property);

	// If no mapping exists for the property, throw an error
	if (!aliasToCanonical) {
		throw new Error(`Unknown property \`${property}\`.`);
	}

	// Retrieve the canonical value for the given alias value
	const canonicalValue = aliasToCanonical.get(value);

	// If the alias value maps to a canonical value, return it
	if (canonicalValue) {
		return canonicalValue;
	}

	// If the value does not exist, throw an error
	throw new Error(`Unknown value \`${value}\` for property \`${property}\`.`);
}

// Export the function
module.exports = matchPropertyValue;

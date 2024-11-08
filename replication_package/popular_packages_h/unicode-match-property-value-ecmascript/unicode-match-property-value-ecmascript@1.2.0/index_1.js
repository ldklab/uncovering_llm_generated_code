'use strict';

// Import the mappings of property-to-value aliases from an external module.
const propertyToValueAliases = require('./data/mappings.js');

/**
 * This function attempts to find the canonical value for a given property-value pair.
 * If the property is unknown or the value for that property is unknown, an error is thrown.
 *
 * @param {string} property - The property for which the value alias is being matched.
 * @param {string} value - The alias value to be matched with a canonical value.
 * @returns {string} - The canonical value corresponding to the alias.
 * @throws Will throw an error if the property or value is unknown.
 */
const matchPropertyValue = function(property, value) {
	// Retrieve the map of alias-to-canonical values for the given property.
	const aliasToValue = propertyToValueAliases.get(property);

	// If there's no mapping for the property, throw an error.
	if (!aliasToValue) {
		throw new Error(`Unknown property \`${property}\`.`);
	}

	// Check and return the canonical value for the provided alias.
	const canonicalValue = aliasToValue.get(value);
	if (canonicalValue) {
		return canonicalValue;
	}

	// If the alias value is not found, throw an error.
	throw new Error(`Unknown value \`${value}\` for property \`${property}\`.`);
};

// Export the function for use in other modules.
module.exports = matchPropertyValue;

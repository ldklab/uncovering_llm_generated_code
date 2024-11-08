'use strict';

var callBound = require('call-bind/callBound');
var toBooleanString = callBound('Boolean.prototype.toString');
var toObjectString = callBound('Object.prototype.toString');

function canConvertToBoolean(value) {
	try {
		toBooleanString(value);
		return true;
	} catch (error) {
		return false;
	}
}

const BOOLEAN_CLASS_STRING = '[object Boolean]';
const supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isBoolean(value) {
	if (typeof value === 'boolean') {
		return true; // Primitive booleans
	}
	if (value === null || typeof value !== 'object') {
		return false; // Non-object, non-boolean primitives
	}
	if (supportsToStringTag && Symbol.toStringTag in value) {
		return canConvertToBoolean(value); // Handle exotic objects with toStringTag
	}
	return toObjectString(value) === BOOLEAN_CLASS_STRING; // Standard object class check
};

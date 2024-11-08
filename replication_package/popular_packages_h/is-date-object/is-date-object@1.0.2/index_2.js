'use strict';

const getDayMethod = Date.prototype.getDay;
const attemptGetDayCall = function(value) {
	try {
		getDayMethod.call(value);
		return true;
	} catch (error) {
		return false;
	}
};

const toStringMethod = Object.prototype.toString;
const expectedDateClass = '[object Date]';
const supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	// Use method-based verification if toStringTag symbol is supported
	return supportsToStringTag ? attemptGetDayCall(value) : toStringMethod.call(value) === expectedDateClass;
};

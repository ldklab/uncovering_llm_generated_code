'use strict';

const getDay = Date.prototype.getDay;

const canInvokeGetDay = (value) => {
	try {
		getDay.call(value);
		return true;
	} catch {
		return false;
	}
};

const toStringRepresentation = Object.prototype.toString;
const expectedDateClassString = '[object Date]';
const supportsToStringTag = require('has-tostringtag/shams')();

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if (supportsToStringTag) {
		return canInvokeGetDay(value);
	}
	return toStringRepresentation.call(value) === expectedDateClassString;
};

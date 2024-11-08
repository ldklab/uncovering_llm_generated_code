'use strict';

const getDay = Date.prototype.getDay;

function canCallGetDayOn(value) {
	try {
		getDay.call(value);
		return true;
	} catch {
		return false;
	}
}

const toString = Object.prototype.toString;
const dateTag = '[object Date]';
const supportsToStringTag = require('has-tostringtag/shams')();

function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	return supportsToStringTag ? canCallGetDayOn(value) : toString.call(value) === dateTag;
}

module.exports = isDateObject;

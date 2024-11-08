'use strict';

function tryDateGetDayCall(value) {
	try {
		Date.prototype.getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
}

const toStr = Object.prototype.toString;
const dateClass = '[object Date]';
const hasToStringTag = require('has-tostringtag/shams')();

function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if (hasToStringTag) {
		return tryDateGetDayCall(value);
	}
	return toStr.call(value) === dateClass;
}

module.exports = isDateObject;

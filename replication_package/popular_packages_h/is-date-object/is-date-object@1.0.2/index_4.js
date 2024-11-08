'use strict';

const getDayMethod = Date.prototype.getDay;

function canCallGetDayMethod(value) {
	try {
		getDayMethod.call(value);
		return true;
	} catch (e) {
		return false;
	}
}

const objectToString = Object.prototype.toString;
const dateString = '[object Date]';

const supportsSymbolToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if (supportsSymbolToStringTag) {
		return canCallGetDayMethod(value);
	}
	return objectToString.call(value) === dateString;
}

module.exports = isDateObject;

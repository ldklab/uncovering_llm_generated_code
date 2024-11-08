'use strict';

const strValue = String.prototype.valueOf;
const tryStringObject = (value) => {
	try {
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

const toStr = Object.prototype.toString;
const strClass = '[object String]';
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isString(value) {
	if (typeof value === 'string') {
		return true;
	}

	if (typeof value !== 'object') {
		return false;
	}

	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};

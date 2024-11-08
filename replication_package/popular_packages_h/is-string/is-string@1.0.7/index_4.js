'use strict';

var strValue = String.prototype.valueOf;
var testStringObject = function(value) {
	try {
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var objectToString = Object.prototype.toString;
var stringClass = '[object String]';
var supportsToStringTag = require('has-tostringtag/shams')();

module.exports = function isString(value) {
	if (typeof value === 'string') {
		return true;
	}
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if (supportsToStringTag) {
		return testStringObject(value);
	}
	return objectToString.call(value) === stringClass;
};

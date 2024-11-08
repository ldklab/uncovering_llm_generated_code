'use strict';

var numToStr = Number.prototype.toString;

function isNumberLike(value) {
	try {
		numToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
}

var toString = Object.prototype.toString;
var numClassString = '[object Number]';
var supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isNumberObject(value) {
	if (typeof value === 'number') {
		return true; // It's a primitive number
	}
	if (typeof value !== 'object') {
		return false; // Cannot be a Number object if it's not an object
	}
	
	// Determine if it's a Number object
	if (supportsToStringTag) {
		return isNumberLike(value);
	}
	
	return toString.call(value) === numClassString;
};

'use strict';

const numToStr = Number.prototype.toString;
const tryNumberObject = (value) => {
	try {
		numToStr.call(value);
		return true;
	} catch {
		return false;
	}
};

const toStr = Object.prototype.toString;
const numClass = '[object Number]';
const hasToStringTag = require('has-tostringtag/shams')();

module.exports = function isNumberObject(value) {
	if (typeof value === 'number') {
		return true;
	}
	if (typeof value !== 'object') {
		return false;
	}
	return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
};
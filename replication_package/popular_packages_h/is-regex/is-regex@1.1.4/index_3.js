'use strict';

const callBound = require('call-bind/callBound');
const hasToStringTag = require('has-tostringtag/shams')();
let hasOwnProperty;
let execRegex;
let regexMarker;
let badStringifierObj;

if (hasToStringTag) {
	hasOwnProperty = callBound('Object.prototype.hasOwnProperty');
	execRegex = callBound('RegExp.prototype.exec');
	regexMarker = {};

	const throwError = function () {
		throw regexMarker;
	};
	badStringifierObj = {
		toString: throwError,
		valueOf: throwError
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		badStringifierObj[Symbol.toPrimitive] = throwError;
	}
}

const objectToString = callBound('Object.prototype.toString');
const getObjectPropertyDescriptor = Object.getOwnPropertyDescriptor;
const regexString = '[object RegExp]';

module.exports = hasToStringTag
	? function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const descriptor = getObjectPropertyDescriptor(value, 'lastIndex');
		const hasLastIndexProp = descriptor && hasOwnProperty(descriptor, 'value');
		if (!hasLastIndexProp) {
			return false;
		}

		try {
			execRegex(value, badStringifierObj);
		} catch (e) {
			return e === regexMarker;
		}
	}
	: function isRegex(value) {
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return objectToString(value) === regexString;
	};

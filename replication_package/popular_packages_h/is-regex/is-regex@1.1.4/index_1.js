'use strict';

const callBound = require('call-bind/callBound');
const hasToStringTag = require('has-tostringtag/shams')();
let hasProperty;
let execRegex;
let regexCheckMarker;
let invalidStringifier;

if (hasToStringTag) {
	hasProperty = callBound('Object.prototype.hasOwnProperty');
	execRegex = callBound('RegExp.prototype.exec');
	regexCheckMarker = {};

	const throwMarker = function () {
		throw regexCheckMarker;
	};

	invalidStringifier = {
		toString: throwMarker,
		valueOf: throwMarker
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		invalidStringifier[Symbol.toPrimitive] = throwMarker;
	}
}

const objectToString = callBound('Object.prototype.toString');
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const regexTypeString = '[object RegExp]';

module.exports = hasToStringTag
	? function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const descriptor = getPropertyDescriptor(value, 'lastIndex');
		const hasLastIndexProperty = descriptor && hasProperty(descriptor, 'value');
		if (!hasLastIndexProperty) {
			return false;
		}

		try {
			execRegex(value, invalidStringifier);
		} catch (error) {
			return error === regexCheckMarker;
		}
	}
	: function isRegex(value) {
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return objectToString(value) === regexTypeString;
	};

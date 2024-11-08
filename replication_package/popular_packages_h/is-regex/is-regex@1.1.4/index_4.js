'use strict';

const callBound = require('call-bind/callBound');
const hasToStringTag = require('has-tostringtag/shams')();

let has;
let executeRegExp;
let regexExceptionMarker;
let invalidStringifier;

if (hasToStringTag) {
	has = callBound('Object.prototype.hasOwnProperty');
	executeRegExp = callBound('RegExp.prototype.exec');
	regexExceptionMarker = {};

	const throwRegexException = function () {
		throw regexExceptionMarker;
	};
	invalidStringifier = {
		toString: throwRegexException,
		valueOf: throwRegexException
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		invalidStringifier[Symbol.toPrimitive] = throwRegexException;
	}
}

const objectToString = callBound('Object.prototype.toString');
const getObjectPropertyDescriptor = Object.getOwnPropertyDescriptor;
const classOfRegex = '[object RegExp]';

module.exports = hasToStringTag
	? function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const descriptor = getObjectPropertyDescriptor(value, 'lastIndex');
		const hasLastIndexBoolean = descriptor && has(descriptor, 'value');
		if (!hasLastIndexBoolean) {
			return false;
		}

		try {
			executeRegExp(value, invalidStringifier);
		} catch (error) {
			return error === regexExceptionMarker;
		}
	}
	: function isRegex(value) {
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return objectToString(value) === classOfRegex;
	};

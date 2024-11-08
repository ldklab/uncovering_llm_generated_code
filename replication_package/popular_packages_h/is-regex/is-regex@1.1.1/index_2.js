'use strict';

const hasSymbols = require('has-symbols')();
const hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';
let hasOwnProperty;
let regexExec;
let isRegexMarker;
let badStringifier;

if (hasToStringTag) {
	hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
	regexExec = Function.call.bind(RegExp.prototype.exec);
	isRegexMarker = {};

	const throwRegexMarker = () => {
		throw isRegexMarker;
	};
	badStringifier = {
		toString: throwRegexMarker,
		valueOf: throwRegexMarker
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		badStringifier[Symbol.toPrimitive] = throwRegexMarker;
	}
}

const toStr = Object.prototype.toString;
const gOPD = Object.getOwnPropertyDescriptor;
const regexClass = '[object RegExp]';

module.exports = hasToStringTag
	? function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const descriptor = gOPD(value, 'lastIndex');
		const hasLastIndexDataProperty = descriptor && hasOwnProperty(descriptor, 'value');
		if (!hasLastIndexDataProperty) {
			return false;
		}

		try {
			regexExec(value, badStringifier);
		} catch (e) {
			return e === isRegexMarker;
		}
	}
	: function isRegex(value) {
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return toStr.call(value) === regexClass;
	};

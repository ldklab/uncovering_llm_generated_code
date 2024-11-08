'use strict';

const forEach = require('foreach');
const availableTypedArrays = require('available-typed-arrays');
const callBound = require('call-bind/callBound');
const hasSymbols = require('has-symbols')();
const getOwnPropertyDescriptor = require('es-abstract/helpers/getOwnPropertyDescriptor');
const { getPrototypeOf } = Object;

const $toString = callBound('Object.prototype.toString');
const $indexOf = callBound('Array.prototype.indexOf', true) || function(array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
const $slice = callBound('String.prototype.slice');
const hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

const typedArrays = availableTypedArrays();
let toStrTags = {};

if (hasToStringTag && getOwnPropertyDescriptor && getPrototypeOf) {
	forEach(typedArrays, (typedArray) => {
		const arr = new global[typedArray]();
		if (!(Symbol.toStringTag in arr)) {
			throw new EvalError(`${typedArray} is missing Symbol.toStringTag!`);
		}
		let proto = getPrototypeOf(arr);
		let descriptor = getOwnPropertyDescriptor(proto, Symbol.toStringTag);
		if (!descriptor) {
			const superProto = getPrototypeOf(proto);
			descriptor = getOwnPropertyDescriptor(superProto, Symbol.toStringTag);
		}
		toStrTags[typedArray] = descriptor.get;
	});
}

const tryTypedArrays = (value) => {
	let isTypedArray = false;
	forEach(toStrTags, (getter, typedArray) => {
		if (!isTypedArray) {
			try {
				isTypedArray = getter.call(value) === typedArray;
			} catch {}
		}
	});
	return isTypedArray;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') return false;
	if (!hasToStringTag) {
		const tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!getOwnPropertyDescriptor) return false;
	return tryTypedArrays(value);
};

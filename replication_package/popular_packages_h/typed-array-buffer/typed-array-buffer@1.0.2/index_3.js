'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isTypedArray = require('is-typed-array');

// Attempt to call the `buffer` property directly from TypedArray prototype, with a fallback mechanism.
const getTypedArrayBuffer = callBound('TypedArray.prototype.buffer', true);

// Module exports: a function to retrieve the buffer of a TypedArray
module.exports = getTypedArrayBuffer || function extractTypedArrayBuffer(typedArray) {
	if (!isTypedArray(typedArray)) {
		throw new $TypeError('Not a Typed Array');
	}
	return typedArray.buffer;
};

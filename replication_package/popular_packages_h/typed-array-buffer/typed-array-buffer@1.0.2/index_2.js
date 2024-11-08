'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bind/callBound');
var isTypedArray = require('is-typed-array');

var getTypedArrayBuffer = callBound('TypedArray.prototype.buffer', true);

function retrieveBuffer(x) {
	if (!isTypedArray(x)) {
		throw new $TypeError('Not a Typed Array');
	}
	return x.buffer;
}

module.exports = getTypedArrayBuffer || retrieveBuffer;

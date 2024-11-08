'use strict';

const callBound = require('call-bind/callBound');
const getByteLength = callBound('ArrayBuffer.prototype.byteLength', true);

const isArrayBuffer = require('is-array-buffer');

module.exports = function byteLength(buffer) {
	if (!isArrayBuffer(buffer)) {
		return NaN;
	}
	return getByteLength ? getByteLength(buffer) : buffer.byteLength;
};

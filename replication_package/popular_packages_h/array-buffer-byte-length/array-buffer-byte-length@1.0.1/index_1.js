'use strict';

var callBound = require('call-bind/callBound');
var getByteLength = callBound('ArrayBuffer.prototype.byteLength', true);

var isArrayBuffer = require('is-array-buffer');

module.exports = function byteLength(arrayBuffer) {
	if (!isArrayBuffer(arrayBuffer)) {
		return NaN;
	}
	return getByteLength ? getByteLength(arrayBuffer) : arrayBuffer.byteLength;
};

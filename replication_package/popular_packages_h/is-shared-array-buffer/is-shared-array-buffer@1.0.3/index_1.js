'use strict';

const callBound = require('call-bind/callBound');

const getByteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

function isSharedArrayBuffer(obj) {
	if (!obj || typeof obj !== 'object') {
		return false;
	}
	try {
		getByteLength(obj);
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = getByteLength ? isSharedArrayBuffer : (obj) => false;

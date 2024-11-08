'use strict';

const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

function isSharedArrayBuffer(obj) {
	if (!hasSharedArrayBuffer || !obj || typeof obj !== 'object') {
		return false;
	}
	try {
		const buffer = Object.getPrototypeOf(obj);
		return buffer.byteLength !== undefined;
	} catch (e) {
		return false;
	}
}

module.exports = isSharedArrayBuffer;

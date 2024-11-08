'use strict';

var callBound = require('call-bind/callBound');

var $byteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

module.exports = $byteLength
	? function isSharedArrayBuffer(obj) {
		if (!obj || typeof obj !== 'object') {
			return false;
		}
		try {
			$byteLength(obj);
			return true;
		} catch (e) {
			return false;
		}
	}
	: function isSharedArrayBuffer(obj) {
		return false;
	};

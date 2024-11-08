'use strict';

const GetIntrinsic = require('get-intrinsic');

const $ArrayBuffer = GetIntrinsic('%ArrayBuffer%');
const $DataView = GetIntrinsic('%DataView%', true);

const callBound = require('call-bind/callBound');
const $dataViewBuffer = callBound('DataView.prototype.buffer', true);

const isTypedArray = require('is-typed-array');

module.exports = function isDataView(obj) {
	if (!obj || typeof obj !== 'object' || !$DataView || isTypedArray(obj)) {
		return false;
	}

	if ($dataViewBuffer) {
		try {
			$dataViewBuffer(obj);
			return true;
		} catch {
			return false;
		}
	}

	if (
		('getInt8' in obj) &&
		typeof obj.getInt8 === 'function' &&
		obj.getInt8 === new $DataView(new $ArrayBuffer(1)).getInt8
	) {
		return true;
	}

	return false;
};

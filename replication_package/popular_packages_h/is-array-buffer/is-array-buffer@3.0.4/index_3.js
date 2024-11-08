'use strict';

const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const GetIntrinsic = require('get-intrinsic');

// Attempt to get the intrinsic %ArrayBuffer% object if available
const $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);

// Attempt to get the ArrayBuffer.prototype.byteLength property, bound with the context check
const $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);

// Get bound version of Object.prototype.toString
const $toString = callBound('Object.prototype.toString');

// Check if abSlice exists when ArrayBuffers have an own "slice" method in node 0.10 condition
const abSlice = !!$ArrayBuffer && !$byteLength && new $ArrayBuffer(0).slice;
const $abSlice = !!abSlice && callBind(abSlice);

// Export the module
/** @type {import('.')} */
module.exports = $byteLength || $abSlice
	? function isArrayBuffer(obj) {
		// Check if the object is not null and is of the object type
		if (!obj || typeof obj !== 'object') {
			return false;
		}
		try {
			// Checks if the object is an ArrayBuffer by attempting to use its associated methods
			if ($byteLength) {
				$byteLength(obj);
			} else {
				$abSlice(obj, 0);
			}
			return true;
		} catch (e) {
			return false;
		}
	}
	: $ArrayBuffer
		? function isArrayBuffer(obj) {
			// Fallback to use Object.prototype.toString check in older node environments
			return $toString(obj) === '[object ArrayBuffer]';
		}
		: function isArrayBuffer(obj) { // Function if no methods are available
			return false;
		};

'use strict';

// Import necessary modules
var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');
var isTypedArray = require('is-typed-array');

// Get intrinsic ArrayBuffer and DataView constructors
var $ArrayBuffer = GetIntrinsic('%ArrayBuffer%');
var $DataView = GetIntrinsic('%DataView%', true);

// Get the buffer property of DataView if it's available
var $dataViewBuffer = callBound('DataView.prototype.buffer', true);

/**
 * Check if the provided argument is a DataView.
 * 
 * @param {*} x - The argument to check.
 * @returns {boolean} - Returns true if the argument is a DataView, false otherwise.
 */
module.exports = function isDataView(x) {
	// If x is not an object, or there's no DataView support, or x is a typed array, return false
	if (!x || typeof x !== 'object' || !$DataView || isTypedArray(x)) {
		return false;
	}

	// Try accessing the buffer property for older Node.js versions
	if ($dataViewBuffer) {
		try {
			// If buffer property access doesn't throw, x is a DataView
			$dataViewBuffer(x);
			return true;
		} catch (e) {
			// If accessing buffer property throws, x is not a DataView
			return false;
		}
	}

	// Check if x has a getInt8 method similar to DataView
	if (
		('getInt8' in x)
		&& typeof x.getInt8 === 'function'
		&& x.getInt8 === new $DataView(new $ArrayBuffer(1)).getInt8
	) {
		return true;
	}

	// If none of the checks pass, return false
	return false;
};

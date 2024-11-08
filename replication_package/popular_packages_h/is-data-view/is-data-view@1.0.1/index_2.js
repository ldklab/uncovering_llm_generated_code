'use strict';

// Import utility to get intrinsic JavaScript objects
var GetIntrinsic = require('get-intrinsic');

// Get the ArrayBuffer and DataView constructors from the environment
var $ArrayBuffer = GetIntrinsic('%ArrayBuffer%');
var $DataView = GetIntrinsic('%DataView%', true);

// Library to bind functions
var callBound = require('call-bind/callBound');

// Handles differences in DataView properties for older Node.js versions
var $dataViewBuffer = callBound('DataView.prototype.buffer', true);

// Import utility to check if an object is a typed array
var isTypedArray = require('is-typed-array');

/** 
 * Function to determine if a given object is a DataView
 * @param {any} x - The object to check
 * @returns {boolean} - `true` if x is a DataView, `false` otherwise
 */
module.exports = function isDataView(x) {
	// Check if `x` is not an object, if DataView is not available, or if `x` is a typed array, return false
	if (!x || typeof x !== 'object' || !$DataView || isTypedArray(x)) {
		return false;
	}

	// If supported, check the buffer property on the DataView prototype
	if ($dataViewBuffer) {
		try {
			$dataViewBuffer(x);
			return true; // Success indicates `x` is a DataView
		} catch (e) {
			return false; // Failure indicates `x` is not a DataView
		}
	}

	// Alternatively, check that `x` has a `getInt8` method that matches the DataView prototype's `getInt8`
	if (
		('getInt8' in x)
			&& typeof x.getInt8 === 'function'
			&& x.getInt8 === new $DataView(new $ArrayBuffer(1)).getInt8
	) {
		return true;
	}

	// If none of the above checks pass, `x` is not a DataView
	return false;
};

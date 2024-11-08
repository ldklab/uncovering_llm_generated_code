'use strict';

// Importing a custom TypeError to use for throwing errors
var $TypeError = require('es-errors/type');

// Importing a utility to bind the native call to the DataView's byteLength property
var callBound = require('call-bind/callBound');

// Binding the native DataView.prototype.byteLength, allowing graceful degradation if not supported
var $dataViewByteLength = callBound('DataView.prototype.byteLength', true);

// Importing a utility function that checks if a given value is a DataView
var isDataView = require('is-data-view');

// Exporting a function that retrieves the byteLength of a DataView
// For older Node.js versions, fallback to manually fetching byteLength if not configurable
module.exports = $dataViewByteLength || function byteLength(x) {
	// Check if the input is a DataView using isDataView utility
	if (!isDataView(x)) {
		// If not, throw a TypeError
		throw new $TypeError('not a DataView');
	}

	// Return the byteLength property from the DataView object
	return x.byteLength;
};

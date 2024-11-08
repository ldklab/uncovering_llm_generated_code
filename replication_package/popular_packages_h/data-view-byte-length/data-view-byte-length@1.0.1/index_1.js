'use strict';

// Import a custom TypeError from 'es-errors'.
var $TypeError = require('es-errors/type');

// Import a function to call a method in a bound context.
var callBound = require('call-bind/callBound');

// Bind 'byteLength' from DataView prototype, with a fallback to false if unavailable.
var $dataViewByteLength = callBound('DataView.prototype.byteLength', true);

// Import a function that checks if an input is a DataView.
var isDataView = require('is-data-view');

// The main module export: get the byteLength property, or define a manual byteLength function.
module.exports = $dataViewByteLength || function byteLength(x) {
	// Check if the input is a DataView.
	if (!isDataView(x)) {
		// If not, throw a custom TypeError.
		throw new $TypeError('not a DataView');
	}

	// Return the byteLength of the DataView.
	return x.byteLength;
};

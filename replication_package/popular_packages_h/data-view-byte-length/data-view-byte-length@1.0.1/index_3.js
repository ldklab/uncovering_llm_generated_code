'use strict';

// Importing $TypeError from es-errors module.
var $TypeError = require('es-errors/type');

// Importing callBound function from call-bind module for safely calling a method.
var callBound = require('call-bind/callBound');

// Using callBound to get the byteLength getter function from DataView prototype.
var $dataViewByteLength = callBound('DataView.prototype.byteLength', true);

// Importing a utility to check whether a variable is a DataView.
var isDataView = require('is-data-view');

// Exporting a module that checks the byte length of a DataView.
// On older node versions (<= 0.10, < 0.11.4), where DataView's byteLength is a nonconfigurable
// own property rather than a prototype getter, the fallback function is used.
module.exports = $dataViewByteLength || function byteLength(x) {
	// Checking if the input x is not a DataView, throwing a TypeError if it's not.
	if (!isDataView(x)) {
		throw new $TypeError('not a DataView');
	}

	// Returning the byteLength property of the DataView x.
	return x.byteLength;
};

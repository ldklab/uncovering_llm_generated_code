'use strict';

// Importing a custom TypeError module for handling specific error types
var $TypeError = require('es-errors/type');

// Importing a module to safely call methods or properties
var callBound = require('call-bind/callBound');

// Attempting to get a bound reference to DataView.prototype.byteLength if available
var $dataViewByteLength = callBound('DataView.prototype.byteLength', true);

// Importing a utility to check if a given argument is a DataView
var isDataView = require('is-data-view');

/**
 * This module exports a function that attempts to get the byteLength of a DataView.
 * If DataView.prototype.byteLength is available (as a configurable getter), it uses that directly.
 * If not, it falls back to a custom function that checks if the input is a DataView and
 * returns its byteLength, throwing a TypeError if the input is not a DataView.
 */

// module.exports is assigned to either the bound prototype getter or the fallback function
module.exports = $dataViewByteLength || function byteLength(x) {
    // Check if the input is a DataView
    if (!isDataView(x)) {
        // Throw a TypeError if the input is not a DataView
        throw new $TypeError('not a DataView');
    }

    // Return the byteLength property of the DataView
    return x.byteLength;
};

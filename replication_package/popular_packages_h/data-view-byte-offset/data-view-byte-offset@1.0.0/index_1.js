'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bind/callBound');
var isDataView = require('is-data-view');

// Attempt to bind to the DataView.prototype.byteOffset
var $dataViewByteOffset = callBound('DataView.prototype.byteOffset', true);

module.exports = $dataViewByteOffset || function byteOffset(x) {
    // Check if x is a DataView
    if (!isDataView(x)) {
        // Throw a TypeError if x is not a DataView
        throw new $TypeError('not a DataView');
    }
    
    // Return the byteOffset property of the DataView
    return x.byteOffset;
};

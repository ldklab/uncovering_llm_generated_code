'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bind/callBound');
var isDataView = require('is-data-view');

// Tries to call 'byteOffset' directly on DataView prototype, works if available.
var $dataViewByteOffset = callBound('DataView.prototype.byteOffset', true);

/** @type {import('.')} */
module.exports = $dataViewByteOffset || function byteOffset(dataView) {
	if (!isDataView(dataView)) {
		throw new $TypeError('not a DataView');
	}
	return dataView.byteOffset;
};

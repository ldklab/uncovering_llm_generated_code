'use strict';

const { TypeError: $TypeError } = require('es-errors');
const callBound = require('call-bind/callBound');
const isDataView = require('is-data-view');

// Attempt to bind to the existing DataView.prototype.byteOffset if it exists in the environment
const getByteOffset = callBound('DataView.prototype.byteOffset', true);

module.exports = getByteOffset || function byteOffset(dataView) {
    // Check whether the input is indeed a DataView instance
    if (!isDataView(dataView)) {
        throw new $TypeError('The provided value is not a DataView.');
    }

    // Return the byteOffset if dataView is a valid DataView
    return dataView.byteOffset;
};

'use strict';

const CustomTypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isDataView = require('is-data-view');

// Retrieve the buffer property on DataView with a fallback if necessary
const getDataViewBuffer = callBound('DataView.prototype.buffer', true) || function (x) {
    if (!isDataView(x)) {
        throw new CustomTypeError('Argument is not a DataView');
    }
    return x.buffer;
};

module.exports = getDataViewBuffer;

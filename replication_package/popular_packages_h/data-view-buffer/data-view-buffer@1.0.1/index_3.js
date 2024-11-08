'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isDataView = require('is-data-view');

const getBufferFromDataView = callBound('DataView.prototype.buffer', true);

module.exports = getBufferFromDataView || function getDataViewBuffer(dataView) {
    if (!isDataView(dataView)) {
        throw new $TypeError('Provided argument is not a DataView.');
    }
    return dataView.buffer;
};

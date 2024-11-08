'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const $dataViewByteOffset = callBound('DataView.prototype.byteOffset', true);
const isDataView = require('is-data-view');

module.exports = $dataViewByteOffset || function byteOffset(dataView) {
    if (!isDataView(dataView)) {
        throw new $TypeError('The provided value is not a DataView');
    }

    return dataView.byteOffset;
};

'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const isDataView = require('is-data-view');

const $dataViewBuffer = callBound('DataView.prototype.buffer', true);

module.exports = $dataViewBuffer || function dataViewBuffer(dataView) {
    if (!isDataView(dataView)) {
        throw new $TypeError('not a DataView');
    }
    return dataView.buffer;
};

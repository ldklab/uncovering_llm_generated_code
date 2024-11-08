'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bind/callBound');
const $dataViewBuffer = callBound('DataView.prototype.buffer', true);
const isDataView = require('is-data-view');

/** @type {import('.')} */
module.exports = $dataViewBuffer || function getBufferFromDataView(dataViewInstance) {
    if (!isDataView(dataViewInstance)) {
        throw new $TypeError('Argument is not a DataView');
    }
    return dataViewInstance.buffer;
};

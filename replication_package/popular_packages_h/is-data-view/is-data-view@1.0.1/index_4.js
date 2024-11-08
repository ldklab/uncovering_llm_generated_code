'use strict';

var GetIntrinsic = require('get-intrinsic');

var $ArrayBuffer = GetIntrinsic('%ArrayBuffer%');
var $DataView = GetIntrinsic('%DataView%', true);

var callBound = require('call-bind/callBound');
var $dataViewBuffer = callBound('DataView.prototype.buffer', true);

var isTypedArray = require('is-typed-array');

module.exports = function isDataView(x) {
    // Ensure x is an object, DataView is available, and x is not a typed array
    if (!x || typeof x !== 'object' || !$DataView || isTypedArray(x)) {
        return false;
    }

    // Use bound method to detect older Node versions
    if ($dataViewBuffer) {
        try {
            $dataViewBuffer(x);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Check for DataView characteristics without bound method
    if (('getInt8' in x) &&
        typeof x.getInt8 === 'function' &&
        x.getInt8 === new $DataView(new $ArrayBuffer(1)).getInt8) {
        return true;
    }

    return false;
};

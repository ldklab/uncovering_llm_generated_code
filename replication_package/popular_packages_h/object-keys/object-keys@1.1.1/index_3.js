'use strict';

const slice = Array.prototype.slice;
const isArgs = require('./isArguments');

const originalKeys = Object.keys;

function getKeys(o) {
    return originalKeys(o);
}

const keysShim = originalKeys ? getKeys : require('./implementation');

keysShim.shim = function shimObjectKeys() {
    if (originalKeys) {
        const keysWorksWithArguments = (function() {
            const args = originalKeys(arguments);
            return args && args.length === arguments.length;
        }(1, 2));

        if (!keysWorksWithArguments) {
            Object.keys = function keys(object) {
                return isArgs(object) ? originalKeys(slice.call(object)) : originalKeys(object);
            };
        }
    } else {
        Object.keys = keysShim;
    }
    return Object.keys || keysShim;
};

module.exports = keysShim;

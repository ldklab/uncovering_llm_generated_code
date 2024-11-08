'use strict';

const slice = Array.prototype.slice;
const isArgs = require('./isArguments');

const originalObjectKeys = Object.keys;
const keysShim = originalObjectKeys ? function keys(obj) { return originalObjectKeys(obj); } : require('./implementation');

keysShim.shim = function shimObjectKeys() {
    if (Object.keys) {
        const keysWorksWithArguments = (function () {
            const args = Object.keys(arguments);
            return args && args.length === arguments.length;
        }(1, 2));
        
        if (!keysWorksWithArguments) {
            Object.keys = function keys(object) {
                if (isArgs(object)) {
                    return originalObjectKeys(slice.call(object));
                }
                return originalObjectKeys(object);
            };
        }
    } else {
        Object.keys = keysShim;
    }
    return Object.keys || keysShim;
};

module.exports = keysShim;

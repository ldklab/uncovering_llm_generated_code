"use strict";

let originalPromise;

if (typeof global.Promise !== "undefined") {
    originalPromise = global.Promise;
}

const bluebird = require("./promise")();

function restoreOriginalPromise() {
    try {
        if (global.Promise === bluebird) {
            global.Promise = originalPromise;
        }
    } catch (error) {
        // Silently handle any error
    }
    return bluebird;
}

bluebird.noConflict = restoreOriginalPromise;

module.exports = bluebird;

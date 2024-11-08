"use strict";

let originalPromise;

if (typeof Promise !== "undefined") {
    originalPromise = Promise;
}

function restoreOriginalPromise() {
    try {
        if (Promise === bluebirdPromise) {
            Promise = originalPromise;
        }
    } catch (error) {
        // Ignore errors that arise during Promise reassignment
    }
    return bluebirdPromise;
}

const bluebirdPromise = require("./promise")();
bluebirdPromise.noConflict = restoreOriginalPromise;

module.exports = bluebirdPromise;

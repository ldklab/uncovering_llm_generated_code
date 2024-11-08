"use strict";

let originalPromise;

if (typeof Promise !== "undefined") {
    originalPromise = Promise;
}

function restoreNativePromise() {
    try {
        if (Promise === bluebirdPromise) {
            Promise = originalPromise;
        }
    } catch (error) {
        // Handle the error if any occurs during reassignment.
    }
    return bluebirdPromise;
}

const bluebirdPromise = require("./promise")();

bluebirdPromise.noConflict = restoreNativePromise;

module.exports = bluebirdPromise;

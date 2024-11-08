"use strict";

let originalPromise;

if (typeof Promise !== "undefined") {
    originalPromise = Promise;
}

function noConflict() {
    try {
        if (Promise === bluebirdPromise) {
            Promise = originalPromise;
        }
    } catch (error) {
        // Handle any errors silently
    }
    return bluebirdPromise;
}

const bluebirdPromise = require("./promise")();
bluebirdPromise.noConflict = noConflict;

module.exports = bluebirdPromise;

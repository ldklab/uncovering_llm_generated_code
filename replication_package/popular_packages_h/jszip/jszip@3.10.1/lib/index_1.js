"use strict";

/**
 * Representation of a ZIP file in JavaScript.
 * @constructor
 */
function JSZip() {
    if (!(this instanceof JSZip)) {
        return new JSZip();
    }

    if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    }

    // Object to store files with null prototype to avoid prototype interference.
    this.files = Object.create(null);
    this.comment = null;
    this.root = ""; // Track hierarchy level

    // Method to clone current JSZip instance excluding functions
    this.clone = function() {
        const newObj = new JSZip();
        for (let i in this) {
            if (typeof this[i] !== "function") {
                newObj[i] = this[i];
            }
        }
        return newObj;
    };
}

// Extending JSZip prototype and static properties
JSZip.prototype = require("./object");
JSZip.prototype.loadAsync = require("./load");
JSZip.support = require("./support");
JSZip.defaults = require("./defaults");
JSZip.version = "3.10.1";

// Static method for loading content asynchronously
JSZip.loadAsync = function (content, options) {
    return new JSZip().loadAsync(content, options);
};

// External dependencies
JSZip.external = require("./external");

// Exporting the JSZip constructor for external use
module.exports = JSZip;

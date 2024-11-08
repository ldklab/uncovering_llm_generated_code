"use strict";

/**
 * Represents a ZIP file in JavaScript.
 * @constructor
 */
function JSZip() {
    // Ensure the function behaves like a constructor whether called
    // with or without the `new` keyword.
    if (!(this instanceof JSZip)) {
        return new JSZip();
    }

    // Disallow construction with arguments.
    if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    }

    // Initialize an object to store files.
    // Using a null prototype prevents conflicts with object prototype methods.
    this.files = Object.create(null);

    this.comment = null;  // Placeholder for a ZIP file-level comment.
    this.root = "";       // Current folder context in the hierarchy.

    // Define a clone method to create a copy of the JSZip instance.
    this.clone = function() {
        const newObj = new JSZip();
        for (const key in this) {
            if (typeof this[key] !== "function") {
                newObj[key] = this[key];
            }
        }
        return newObj;
    };
}

// Extend the prototype with additional modules.
JSZip.prototype = require("./object");
JSZip.prototype.loadAsync = require("./load");
JSZip.support = require("./support");
JSZip.defaults = require("./defaults");

// Define the version of JSZip.
JSZip.version = "3.10.1";

// Static method for asynchronously loading ZIP content.
JSZip.loadAsync = function (content, options) {
    return new JSZip().loadAsync(content, options);
};

// External dependencies or utilities.
JSZip.external = require("./external");

// Export the JSZip constructor function as a module.
module.exports = JSZip;

'use strict';

/**
 * Represents a zip file in JavaScript.
 * @constructor
 */
function JSZip() {
    // Ensure that the constructor is called correctly with `new`
    if (!(this instanceof JSZip)) {
        return new JSZip();
    }

    // Throw an error if the constructor is called with parameters
    if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    }

    // Initialize properties
    this.files = {};     // Stores the files in the zip
    this.comment = null; // Comment for the zip file
    this.root = "";      // Root path in the hierarchy

    // Method to create a shallow copy of the JSZip instance
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

// Extend the prototype with additional functionalities
JSZip.prototype = require('./object'); // Core functionalities
JSZip.prototype.loadAsync = require('./load'); // Asynchronous loading support
JSZip.support = require('./support'); // Support utilities
JSZip.defaults = require('./defaults'); // Default configuration values

// Static property for version number; issue referenced for context
JSZip.version = "3.5.0";

// Static method to create an instance and load data asynchronously
JSZip.loadAsync = function(content, options) {
    return new JSZip().loadAsync(content, options);
};

// External utilities and exports
JSZip.external = require("./external");
module.exports = JSZip;

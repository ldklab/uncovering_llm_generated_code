'use strict';

// JSZip constructor for handling ZIP files in JavaScript
class JSZip {
    constructor() {
        // Enforce the use of 'new'
        if (!(this instanceof JSZip)) {
            return new JSZip();
        }

        // Prevent using constructor with parameters
        if (arguments.length) {
            throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
        }

        // Initialize files as an empty object
        this.files = {};
        this.comment = null;
        this.root = "";
    }

    // Method to clone a JSZip object
    clone() {
        const newObj = new JSZip();
        for (let key in this) {
            if (typeof this[key] !== "function") {
                newObj[key] = this[key];
            }
        }
        return newObj;
    }

    // Other methods that could be loaded
    async loadAsync(content, options) {
        return require('./load').call(this, content, options);
    }

    // Static properties and methods
    static loadAsync(content, options) {
        return new JSZip().loadAsync(content, options);
    }
}

// Extend JSZip prototype with external methods
JSZip.prototype = require('./object');
JSZip.support = require('./support');
JSZip.defaults = require('./defaults');
JSZip.version = "3.5.0";
JSZip.external = require("./external");

module.exports = JSZip;

'use strict';

/**
 * Representation of a zip file in js
 * @constructor
 */
function JSZip() {
    if (!(this instanceof JSZip)) {
        return new JSZip();
    }

    if (arguments.length) {
        throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
    }

    this.files = {};
    this.comment = null;
    this.root = "";
}

JSZip.prototype.clone = function() {
    const newObj = new JSZip();
    Object.keys(this).forEach(key => {
        if (typeof this[key] !== "function") {
            newObj[key] = this[key];
        }
    });
    return newObj;
};

JSZip.prototype = require('./object');
JSZip.prototype.loadAsync = require('./load');
JSZip.support = require('./support');
JSZip.defaults = require('./defaults');
JSZip.version = "3.5.0";

JSZip.loadAsync = function(content, options) {
    return new JSZip().loadAsync(content, options);
};

JSZip.external = require("./external");
module.exports = JSZip;

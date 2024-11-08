"use strict";

class JSZip {
    constructor() {
        if (!(this instanceof JSZip)) {
            return new JSZip();
        }
        
        if(arguments.length) {
            throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
        }
        
        this.files = Object.create(null);
        this.comment = null;
        this.root = "";
    }

    clone() {
        const newObj = new JSZip();
        for (let key in this) {
            if (typeof this[key] !== "function") {
                newObj[key] = this[key];
            }
        }
        return newObj;
    }

    loadAsync(content, options) {
        return require("./load")(this, content, options);
    }
}

JSZip.prototype = Object.assign(JSZip.prototype, require("./object"));
JSZip.support = require("./support");
JSZip.defaults = require("./defaults");
JSZip.version = "3.10.1";

JSZip.loadAsync = function(content, options) {
    return new JSZip().loadAsync(content, options);
};

JSZip.external = require("./external");

module.exports = JSZip;

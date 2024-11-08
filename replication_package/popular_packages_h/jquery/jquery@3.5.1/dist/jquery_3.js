"use strict";

(function(global) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = function(w) {
            if (!w.document) {
                throw new Error("jQuery requires a window with a document");
            }
            return factory(w, true);
        };
    } else {
        factory(global);
    }

    function factory(window, noGlobal) {
        var jQuery = function(selector, context) {
            return new jQuery.fn.init(selector, context);
        };
        
        jQuery.fn = jQuery.prototype = {
            jquery: version,
            constructor: jQuery,
            length: 0,
            toArray: function() {
                return slice.call(this);
            },
            get: function(num) {
                if (num == null) return slice.call(this);
                return num < 0 ? this[num + this.length] : this[num];
            }
        };
        
        if (typeof noGlobal === 'undefined') {
            window.jQuery = window.$ = jQuery;
        }
        
        return jQuery;
    }
    
    // Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this);

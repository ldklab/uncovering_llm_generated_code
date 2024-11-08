(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    "use strict";

    // Define the jQuery object
    var jQuery = function(selector, context) {
        return new jQuery.fn.init(selector, context);
    };

    // jQuery prototype
    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        jquery: "3.5.1",
        length: 0,

        // Convert the matched set to an array
        toArray: function() {
            return Array.prototype.slice.call(this);
        },

        // Get the Nth element
        get: function(num) {
            return num != null ?
                (num < 0 ? this[num + this.length] : this[num]) :
                Array.prototype.slice.call(this);
        },

        // Implement the identity methods for the matched elements
        push: [].push,
        sort: [].sort,
        splice: [].splice
    };

    // Extend the jQuery object and jQuery prototype
    jQuery.extend = jQuery.fn.extend = function() {
        var options, name, src, copy, target = arguments[0] || {},
            i = 1, length = arguments.length;

        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for ( ; i < length; i++ ) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    // Add jQuery utility functions
    jQuery.extend({
        isFunction: function(obj) {
            return typeof obj === "function" && typeof obj.nodeType !== "number";
        },

        isWindow: function(obj) {
            return obj != null && obj === obj.window;
        },

        each: function(obj, callback) {
            var length, i = 0;

            if (Array.isArray(obj)) {
                length = obj.length;
                for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        }
    });

    // Initialize the library
    return jQuery;

});

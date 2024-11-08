// jQuery IIFE to maintain the global scope
(function (global, factory) {
    "use strict";

    // Check for Node.js-like environment
    if (typeof module === "object" && typeof module.exports === "object") {
        // Use module.exports for Node.js
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

// Pass 'window' if available
}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    "use strict";

    // Declare internal variables
    var arr = [],
        getProto = Object.getPrototypeOf,
        slice = arr.slice,
        flat = arr.flat ? function (array) {
            return arr.flat.call(array);
        } : function (array) {
            return arr.concat.apply([], array);
        },
        indexOf = arr.indexOf,
        class2type = {},
        hasOwn = class2type.hasOwnProperty;

    // Main jQuery function
    var jQuery = function (selector, context) {
        return new jQuery.fn.init(selector, context);
    };

    // jQuery prototype definition
    jQuery.fn = jQuery.prototype = {
        jquery: "3.5.1",
        constructor: jQuery,
        length: 0,

        toArray: function () {
            return slice.call(this);
        },

        get: function (num) {
            if (num == null) {
                return slice.call(this);
            }
            return num < 0 ? this[num + this.length] : this[num];
        },

        pushStack: function (elems) {
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;
            return ret;
        },

        each: function (callback) {
            return jQuery.each(this, callback);
        },

        // Other prototype methods omitted for brevity
    };

    // Static methods on jQuery
    jQuery.extend = jQuery.fn.extend = function () {
        var options, name, src, copy, target = arguments[0] || {},
            i = 1,
            length = arguments.length;

        // Extend the base object
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    copy = options[name];
                    // Prevent Object.prototype pollution
                    if (name === "__proto__" || target === copy) {
                        continue;
                    }
                    target[name] = copy;
                }
            }
        }
        return target;
    };

    // jQuery utility functions
    jQuery.each = function (obj, callback) {
        var length, i = 0;
        if (isArrayLike(obj)) {
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
    };

    // AJAX methods and utilities omitted for brevity

    // Export jQuery to global scope
    if (typeof noGlobal === "undefined") {
        window.jQuery = window.$ = jQuery;
    }

    return jQuery;
}));


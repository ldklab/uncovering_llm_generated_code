(function (global, factory) {
    "use strict";

    // Check if the module is being used in a Node.js-like environment
    if (typeof module === "object" && typeof module.exports === "object") {
        // If there is a window with a document, run the factory and export jQuery
        // Otherwise, expose a factory as module.exports that requires a window
        module.exports = global.document
            ? factory(global, true)
            : function (w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        // If not in a Node.js environment, assume we are in a browser and run the factory function directly
        factory(global);
    }
})(
    typeof window !== "undefined" ? window : this, 
    function (window, noGlobal) {
        "use strict";

        // jQuery initialization and setting up core functionalities

        const jQuery = function (selector, context) {
            return new jQuery.fn.init(selector, context);
        };

        // Define prototype and methods
        jQuery.fn = jQuery.prototype = {
            // Define methods like .each(), .map(), etc.
        };

        // Provide static methods, utilities, and jQuery core features
        jQuery.extend = jQuery.fn.extend = function () {
            // Method implementation
        };

        jQuery.extend({
            // AJAX support, utilities, etc.
        });

        // If noGlobal is not true, attach jQuery to the global object
        if (!noGlobal) {
            window.jQuery = window.$ = jQuery;
        }

        // Return the jQuery function
        return jQuery;
    }
);

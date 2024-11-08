// tslib.js
// Minimal implementation of tslib helper functions

// __extends helper function to simulate classical inheritance in JavaScript
function __extends(d, b) {
    // Extending static properties
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    
    // Constructor function for setting up the prototype chain
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}

// __assign helper function to merge objects
var __assign = function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) {
                t[p] = s[p];
            }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

// Exporting functions to be used in TypeScript-compiled JavaScript
module.exports = {
    __extends: __extends,
    __assign: __assign
};

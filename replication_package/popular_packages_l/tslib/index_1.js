// tslib.js
// Minimal implementation of tslib helper functions

// __extends helper function to simulate classical inheritance in JavaScript
function __extends(child, parent) {
    // Extending static properties
    for (var key in parent) {
        if (Object.prototype.hasOwnProperty.call(parent, key)) {
            child[key] = parent[key];
        }
    }

    // Constructor function for setting up the prototype chain
    function TempConstructor() { this.constructor = child; }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
}

// __assign helper function to merge objects
var __assign = function() {
    __assign = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var property in source) {
                if (Object.prototype.hasOwnProperty.call(source, property)) {
                    target[property] = source[property];
                }
            }
        }
        return target;
    };
    return __assign.apply(this, arguments);
};

// Exporting functions to be used in TypeScript-compiled JavaScript
module.exports = {
    __extends: __extends,
    __assign: __assign
};

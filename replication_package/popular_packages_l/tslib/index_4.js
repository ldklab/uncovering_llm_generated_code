// tslib.js
// Minimal implementation of tslib helper functions

// __extends helper function to simulate classical inheritance in JavaScript
function __extends(child, parent) {
    // Extending static properties
    for (var property in parent) if (parent.hasOwnProperty(property)) child[property] = parent[property];
    
    // Constructor function for setting up the prototype chain
    function Constructor() { this.constructor = child; }
    Constructor.prototype = parent.prototype;
    child.prototype = new Constructor();
}

// __assign helper function to merge objects
var __assign = function() {
    __assign = Object.assign || function(target) {
        for (var source, i = 1, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (var prop in source) if (Object.prototype.hasOwnProperty.call(source, prop)) {
                target[prop] = source[prop];
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

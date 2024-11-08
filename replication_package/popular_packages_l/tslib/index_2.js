// tslib.js
// Minimal implementation of tslib helper functions

// __extends helper function to simulate classical inheritance in JavaScript
function __extends(d, b) {
    // Extending static properties
    for (const p in b) {
        if (b.hasOwnProperty(p)) {
            d[p] = b[p];
        }
    }
    
    // Constructor function for setting up the prototype chain
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
}

// __assign helper function to merge objects
const __assign = (() => {
    const assignFn = Object.assign || ((target, ...sources) => {
        for (const source of sources) {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    });
    
    return function(target, ...sources) {
        return assignFn(target, ...sources);
    };
})();

// Exporting functions to be used in TypeScript-compiled JavaScript
module.exports = {
    __extends,
    __assign
};

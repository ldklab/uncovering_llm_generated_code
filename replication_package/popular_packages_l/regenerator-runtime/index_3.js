// regenerator-runtime/index.js

// This file supports importing the runtime as a module. It sets up a `regeneratorRuntime` 
// object globally if it does not exist. This is needed for supporting generators in JavaScript.

function defineRuntime(global) {
    if (!global.regeneratorRuntime) {
        // Create the regeneratorRuntime object with a mark and wrap function as needed for generators
        global.regeneratorRuntime = {
            // Function to tag a generator function (it just returns the function itself here)
            mark: function(genFun) {
                return genFun;
            },
            // Function to wrap the internal function, not fully implemented here
            wrap: function(innerFn, outerFn, self, tryLocsList) {
                const generator = {};
                return generator;
            }
        };
    }
}

// Check available global context and define regeneratorRuntime
if (typeof globalThis !== "undefined") {
    defineRuntime(globalThis);  // Use globalThis if available (latest and preferred global context)
} else if (typeof window !== "undefined") {
    defineRuntime(window);      // Use window for browsers
} else if (typeof global !== "undefined") {
    defineRuntime(global);      // Use global for Node.js
}

// Export the regeneratorRuntime object so it can be accessed as a module
module.exports = globalThis.regeneratorRuntime;

// regenerator-runtime/runtime.js

// This file makes regeneratorRuntime globally defined by requiring index.js, 
// ensuring the runtime is set up as soon as this module is required.

require('./index');

// regenerator-runtime/path.js

// This file exports the path to runtime.js

const path = require('path');

// Exports an object with the property 'path' which contains the full filepath to runtime.js
exports.path = path.join(__dirname, 'runtime.js');

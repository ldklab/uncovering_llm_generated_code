// regenerator-runtime/index.js

// This module defines a runtime that can be imported in other modules.

function defineRuntime(globalScope) {
    if (!globalScope.regeneratorRuntime) {
        globalScope.regeneratorRuntime = {
            // Prototype for iterator function marking
            mark: function(generatorFunction) {
                return generatorFunction;
            },
            wrap: function(internalFunction, externalFunction, context, locationList) {
                const generator = {}; // Empty object for generator
                return generator;
            }
        };
    }
}

// Determine the appropriate global context to define the runtime
if (typeof globalThis !== "undefined") {
    defineRuntime(globalThis);
} else if (typeof window !== "undefined") {
    defineRuntime(window);
} else if (typeof global !== "undefined") {
    defineRuntime(global);
}

// Export the defined regeneratorRuntime from the global context
module.exports = globalThis.regeneratorRuntime;

// regenerator-runtime/runtime.js

// This module ensures regeneratorRuntime is globally available by requiring the index module.
require('./index');

// regenerator-runtime/path.js

// This module exports the filepath to runtime.js

const path = require('path');

// Export the path to the runtime.js file located in the current directory
exports.path = path.join(__dirname, 'runtime.js');

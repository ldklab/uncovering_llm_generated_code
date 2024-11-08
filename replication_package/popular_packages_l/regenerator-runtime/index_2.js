// regenerator-runtime/index.js

// This file provides a module-based import for the regeneratorRuntime, ensuring its existence globally.

function defineRuntime(global) {
    // Initializes the regeneratorRuntime object in the global scope if it hasn't been defined yet.
    if (!global.regeneratorRuntime) {
        global.regeneratorRuntime = {
            // Facilitates marking a function as a generator.
            mark: function(genFun) {
                return genFun;
            },
            // Creates a generator object, though it currently doesn't include any implementation.
            wrap: function(innerFn, outerFn, self, tryLocsList) {
                const generator = {}; // Empty generator object placeholder.
                return generator;
            }
        };
    }
}

// Determine the global object based on environment (e.g., browser or Node.js) and define regeneratorRuntime.
if (typeof globalThis !== "undefined") {
    defineRuntime(globalThis);
} else if (typeof window !== "undefined") {
    defineRuntime(window);
} else if (typeof global !== "undefined") {
    defineRuntime(global);
}

// Export the defined regeneratorRuntime for module consumers.
module.exports = globalThis.regeneratorRuntime;

// regenerator-runtime/runtime.js

// Require and execute the index module to globally define regeneratorRuntime when this file is imported.
require('./index');

// regenerator-runtime/path.js

// Provides the file path to runtime.js, using Node.js's path module for operations involving file paths.
const path = require('path');

// Exports the constructed path to runtime.js using the directory name of the current file.
exports.path = path.join(__dirname, 'runtime.js');

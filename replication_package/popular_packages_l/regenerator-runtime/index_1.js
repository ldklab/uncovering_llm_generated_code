// regenerator-runtime/index.js

// This script sets up the regeneratorRuntime in the global scope if it isn't already present.
function defineRuntime(global) {
    if (!global.regeneratorRuntime) {
        global.regeneratorRuntime = {
            // A no-op function `mark` which returns the generator function it is passed.
            mark: function (genFun) {
                return genFun;
            },
            // A no-op function `wrap` intended to transform inner generator functions into a generator object.
            wrap: function (innerFn, outerFn, self, tryLocsList) {
                const generator = {};
                return generator;
            }
        };
    }
}

// Define the regeneratorRuntime on the appropriate global object.
if (typeof globalThis !== "undefined") {
    defineRuntime(globalThis);
} else if (typeof window !== "undefined") {
    defineRuntime(window);
} else if (typeof global !== "undefined") {
    defineRuntime(global);
}

// Export the globally defined regeneratorRuntime.
module.exports = globalThis.regeneratorRuntime;

// regenerator-runtime/runtime.js

// Import and execute the script which sets up regeneratorRuntime in the global scope.
require('./index');

// regenerator-runtime/path.js

// Export the filesystem path to the runtime.js file.
const path = require('path');
exports.path = path.join(__dirname, 'runtime.js');

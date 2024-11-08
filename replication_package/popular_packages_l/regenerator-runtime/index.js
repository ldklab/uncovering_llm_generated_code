// regenerator-runtime/index.js

// This file supports importing the runtime as a module.

function defineRuntime(global) {
    if (!global.regeneratorRuntime) {
        global.regeneratorRuntime = {
            // Example iterator implementation
            mark: function(genFun) {
                return genFun;
            },
            wrap: function(innerFn, outerFn, self, tryLocsList) {
                const generator = {};
                return generator;
            }
        };
    }
}

if (typeof globalThis !== "undefined") {
    defineRuntime(globalThis);
} else if (typeof window !== "undefined") {
    defineRuntime(window);
} else if (typeof global !== "undefined") {
    defineRuntime(global);
}

module.exports = globalThis.regeneratorRuntime;

// regenerator-runtime/runtime.js

// This file supports making the regeneratorRuntime globally defined.

require('./index');

// regenerator-runtime/path.js

// This file provides the path to runtime.js

const path = require('path');

exports.path = path.join(__dirname, 'runtime.js');

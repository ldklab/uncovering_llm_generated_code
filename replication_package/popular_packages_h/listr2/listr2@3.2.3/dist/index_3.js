"use strict";

const { defineProperty, getOwnPropertyDescriptor } = Object;
const { hasOwnProperty } = Object.prototype;

// Helper function to create bindings
function createBinding(exports, module, key, alias) {
    alias = alias || key;
    if (!hasOwnProperty.call(exports, alias)) {
        defineProperty(exports, alias, {
            enumerable: true,
            get: () => module[key],
        });
    }
}

// Function to export all properties from a module
function exportAll(module, exports) {
    for (const key in module) {
        if (key !== "default" && !hasOwnProperty.call(exports, key)) {
            createBinding(exports, module, key);
        }
    }
}

// Mark the module exports
defineProperty(exports, "__esModule", { value: true });

// Re-export modules
const modulesToExport = [
    require("./listr"),
    require("./manager"),
    require("./interfaces/index"),
    require("./utils/logger"),
    require("./utils/logger.constants"),
    require("./utils/prompt.interface"),
    require("./utils/prompt"),
];

modulesToExport.forEach(module => exportAll(module, exports));

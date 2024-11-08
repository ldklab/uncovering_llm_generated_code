"use strict";

// Utility function to create bindings
function createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}

// Function to export all modules
function exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) createBinding(exports, m, p);
}

// Export module
Object.defineProperty(exports, "__esModule", { value: true });

// Export functions from various modules
exportStar(require("./stringify.js"), exports);
exportStar(require("./traversal.js"), exports);
exportStar(require("./manipulation.js"), exports);
exportStar(require("./querying.js"), exports);
exportStar(require("./legacy.js"), exports);
exportStar(require("./helpers.js"), exports);
exportStar(require("./feeds.js"), exports);

// Import deprecated methods from `domhandler`
var domhandler = require("domhandler");

/** @deprecated Use these methods from `domhandler` directly. */
Object.defineProperty(exports, "isTag", { enumerable: true, get: function() { return domhandler.isTag; } });
Object.defineProperty(exports, "isCDATA", { enumerable: true, get: function() { return domhandler.isCDATA; } });
Object.defineProperty(exports, "isText", { enumerable: true, get: function() { return domhandler.isText; } });
Object.defineProperty(exports, "isComment", { enumerable: true, get: function() { return domhandler.isComment; } });
Object.defineProperty(exports, "isDocument", { enumerable: true, get: function() { return domhandler.isDocument; } });
Object.defineProperty(exports, "hasChildren", { enumerable: true, get: function() { return domhandler.hasChildren; } });

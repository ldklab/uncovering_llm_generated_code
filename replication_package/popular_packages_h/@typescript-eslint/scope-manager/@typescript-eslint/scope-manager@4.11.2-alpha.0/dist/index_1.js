"use strict";

// Helper function for binding properties
function createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

// Helper function for re-exporting properties
function exportStar(m, exports) {
    for (let p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            createBinding(exports, m, p);
        }
    }
}

// Export specific imports
Object.defineProperty(exports, "__esModule", { value: true });

const analyze_1 = require("./analyze");
createBinding(exports, analyze_1, "analyze");

exportStar(require("./definition"), exports);

const Reference_1 = require("./referencer/Reference");
createBinding(exports, Reference_1, "Reference");

const Visitor_1 = require("./referencer/Visitor");
createBinding(exports, Visitor_1, "Visitor");

const PatternVisitor_1 = require("./referencer/PatternVisitor");
createBinding(exports, PatternVisitor_1, "PatternVisitor");

exportStar(require("./scope"), exports);

const ScopeManager_1 = require("./ScopeManager");
createBinding(exports, ScopeManager_1, "ScopeManager");

exportStar(require("./variable"), exports);

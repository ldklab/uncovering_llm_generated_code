"use strict";

// Helper function for creating bindings between objects
function createBinding(o, m, k, k2 = k) {
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

// Helper function for re-exporting all properties of a module
function exportStar(m, exports) {
    for (const p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) createBinding(exports, m, p);
}

// Define exports object for module
Object.defineProperty(exports, "__esModule", { value: true });

// Export the 'analyze' function from './analyze'
const analyze = require("./analyze");
Object.defineProperty(exports, "analyze", { enumerable: true, get: function () { return analyze.analyze; } });

// Re-export everything from './definition'
exportStar(require("./definition"), exports);

// Export the 'Reference' class from './referencer/Reference'
const Reference_ = require("./referencer/Reference");
Object.defineProperty(exports, "Reference", { enumerable: true, get: function () { return Reference_.Reference; } });

// Export the 'Visitor' class from './referencer/Visitor'
const Visitor_ = require("./referencer/Visitor");
Object.defineProperty(exports, "Visitor", { enumerable: true, get: function () { return Visitor_.Visitor; } });

// Export the 'PatternVisitor' class from './referencer/PatternVisitor'
const PatternVisitor_ = require("./referencer/PatternVisitor");
Object.defineProperty(exports, "PatternVisitor", { enumerable: true, get: function () { return PatternVisitor_.PatternVisitor; } });

// Re-export everything from './scope'
exportStar(require("./scope"), exports);

// Export the 'ScopeManager' class from './ScopeManager'
const ScopeManager_ = require("./ScopeManager");
Object.defineProperty(exports, "ScopeManager", { enumerable: true, get: function () { return ScopeManager_.ScopeManager; } });

// Re-export everything from './variable'
exportStar(require("./variable"), exports);

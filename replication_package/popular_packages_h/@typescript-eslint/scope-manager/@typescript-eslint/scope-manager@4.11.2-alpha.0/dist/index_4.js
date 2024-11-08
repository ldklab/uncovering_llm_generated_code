"use strict";

// Export specific items with getter to maintain reference integrity
Object.defineProperty(exports, "__esModule", { value: true });

const analyze_1 = require("./analyze");
const Reference_1 = require("./referencer/Reference");
const Visitor_1 = require("./referencer/Visitor");
const PatternVisitor_1 = require("./referencer/PatternVisitor");
const ScopeManager_1 = require("./ScopeManager");

// Define specific exports
exports.analyze = analyze_1.analyze;
exports.Reference = Reference_1.Reference;
exports.Visitor = Visitor_1.Visitor;
exports.PatternVisitor = PatternVisitor_1.PatternVisitor;
exports.ScopeManager = ScopeManager_1.ScopeManager;

// Re-export all from specific modules
Object.assign(exports, require("./definition"));
Object.assign(exports, require("./scope"));
Object.assign(exports, require("./variable"));

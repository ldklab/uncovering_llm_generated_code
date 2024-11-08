"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { analyze } = require("./analyze");
exports.analyze = analyze;

const { Reference } = require("./referencer/Reference");
exports.Reference = Reference;

const { Visitor } = require("./referencer/Visitor");
exports.Visitor = Visitor;

const { PatternVisitor } = require("./referencer/PatternVisitor");
exports.PatternVisitor = PatternVisitor;

const { ScopeManager } = require("./ScopeManager");
exports.ScopeManager = ScopeManager;

Object.assign(exports, require("./definition"));
Object.assign(exports, require("./scope"));
Object.assign(exports, require("./variable"));

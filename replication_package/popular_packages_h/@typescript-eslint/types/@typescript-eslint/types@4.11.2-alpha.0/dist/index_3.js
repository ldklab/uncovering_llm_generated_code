"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const astNodeTypes = require("./ast-node-types");
const astTokenTypes = require("./ast-token-types");
const lib = require("./lib");
const parserOptions = require("./parser-options");
const tsEstree = require("./ts-estree");

exports.AST_NODE_TYPES = astNodeTypes.AST_NODE_TYPES;
exports.AST_TOKEN_TYPES = astTokenTypes.AST_TOKEN_TYPES;

Object.keys(lib).forEach(key => {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        exports[key] = lib[key];
    }
});

Object.keys(parserOptions).forEach(key => {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        exports[key] = parserOptions[key];
    }
});

exports.TSESTree = tsEstree;

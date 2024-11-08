"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { AST_NODE_TYPES } = require("./ast-node-types");
const { AST_TOKEN_TYPES } = require("./ast-token-types");
const { TSESTree } = require("./ts-estree");
const libExports = require("./lib");
const parserOptionsExports = require("./parser-options");

exports.AST_NODE_TYPES = AST_NODE_TYPES;
exports.AST_TOKEN_TYPES = AST_TOKEN_TYPES;
exports.TSESTree = { ...TSESTree };

Object.assign(exports, libExports);
Object.assign(exports, parserOptionsExports);

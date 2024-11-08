"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var ast_node_types_1 = require("./ast-node-types");
exports.AST_NODE_TYPES = ast_node_types_1.AST_NODE_TYPES;

var ast_token_types_1 = require("./ast-token-types");
exports.AST_TOKEN_TYPES = ast_token_types_1.AST_TOKEN_TYPES;

Object.keys(require('./lib')).forEach(key => {
  if (key !== "default" && !exports.hasOwnProperty(key)) {
    exports[key] = require('./lib')[key];
  }
});

Object.keys(require('./parser-options')).forEach(key => {
  if (key !== "default" && !exports.hasOwnProperty(key)) {
    exports[key] = require('./parser-options')[key];
  }
});

const TSESTree = require('./ts-estree');
exports.TSESTree = Object.assign({}, TSESTree);

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { default: parseDefault } = require("./parse");
const { default: stringifyDefault } = require("./stringify");

exports.parse = parseDefault;
exports.stringify = stringifyDefault;

// Re-export all named exports from './parse'
Object.assign(exports, require('./parse'));

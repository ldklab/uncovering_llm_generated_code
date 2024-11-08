"use strict";

const { default: parse } = require("./parse");
const { default: stringify } = require("./stringify");

Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = stringify;
exports.parse = parse;

Object.assign(exports, require("./parse"));

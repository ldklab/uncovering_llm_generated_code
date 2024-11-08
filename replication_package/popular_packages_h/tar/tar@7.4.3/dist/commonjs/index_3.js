"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const create_js_1 = require("./create.js");
const extract_js_1 = require("./extract.js");
const list_js_1 = require("./list.js");
const replace_js_1 = require("./replace.js");
const update_js_1 = require("./update.js");

exports.c = create_js_1.create;
exports.x = extract_js_1.extract;
exports.t = list_js_1.list;
exports.r = replace_js_1.replace;
exports.u = update_js_1.update;

exports.types = require("./types.js");

[
  "./create.js",
  "./extract.js",
  "./header.js",
  "./list.js",
  "./pack.js",
  "./parse.js",
  "./pax.js",
  "./read-entry.js",
  "./replace.js",
  "./unpack.js",
  "./update.js",
  "./write-entry.js"
].forEach((mod) => {
  Object.assign(exports, require(mod));
});

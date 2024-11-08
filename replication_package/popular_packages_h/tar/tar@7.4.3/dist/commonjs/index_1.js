"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

exports.u = exports.types = exports.r = exports.t = exports.x = exports.c = void 0;

// Re-export all exports from individual modules
__exportStar(require("./create.js"), exports);
__exportStar(require("./extract.js"), exports);
__exportStar(require("./header.js"), exports);
__exportStar(require("./list.js"), exports);
__exportStar(require("./pack.js"), exports);
__exportStar(require("./parse.js"), exports);
__exportStar(require("./pax.js"), exports);
__exportStar(require("./read-entry.js"), exports);
__exportStar(require("./replace.js"), exports);
__exportStar(require("./unpack.js"), exports);
__exportStar(require("./update.js"), exports);
__exportStar(require("./write-entry.js"), exports);

// Import specific functions and assign them to export properties
var create_js_1 = require("./create.js");
exports.c = create_js_1.create;

var extract_js_1 = require("./extract.js");
exports.x = extract_js_1.extract;

var list_js_1 = require("./list.js");
exports.t = list_js_1.list;

var replace_js_1 = require("./replace.js");
exports.r = replace_js_1.replace;

var update_js_1 = require("./update.js");
exports.u = update_js_1.update;

// Import and export an entire module under a specific namespace
exports.types = __importStar(require("./types.js"));

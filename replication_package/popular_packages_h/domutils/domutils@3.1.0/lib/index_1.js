"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}

function exportStar(m, exports) {
    for (var key in m) {
        if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
            createBinding(exports, m, key);
        }
    }
}

exportStar(require("./stringify.js"), exports);
exportStar(require("./traversal.js"), exports);
exportStar(require("./manipulation.js"), exports);
exportStar(require("./querying.js"), exports);
exportStar(require("./legacy.js"), exports);
exportStar(require("./helpers.js"), exports);
exportStar(require("./feeds.js"), exports);

/** @deprecated Use these methods from `domhandler` directly. */
var domhandler = require("domhandler");
exports.isTag = domhandler.isTag;
exports.isCDATA = domhandler.isCDATA;
exports.isText = domhandler.isText;
exports.isComment = domhandler.isComment;
exports.isDocument = domhandler.isDocument;
exports.hasChildren = domhandler.hasChildren;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function __createBinding(obj, mod, key, alias) {
    if (alias === undefined) alias = key;
    var desc = Object.getOwnPropertyDescriptor(mod, key);
    if (!desc || ("get" in desc ? !mod.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return mod[key]; } };
    }
    Object.defineProperty(obj, alias, desc);
}

function __exportStar(mod, exports) {
    for (var prop in mod) {
        if (prop !== "default" && !Object.prototype.hasOwnProperty.call(exports, prop)) {
            __createBinding(exports, mod, prop);
        }
    }
}

__exportStar(require("./types"), exports);

var parse = require("./parse");
exports.isTraversal = parse.isTraversal;
exports.parse = parse.parse;

var stringify = require("./stringify");
exports.stringify = stringify.stringify;

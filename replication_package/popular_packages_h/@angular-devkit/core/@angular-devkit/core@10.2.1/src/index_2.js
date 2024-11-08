"use strict";

const analytics = require("./analytics");
const experimental = require("./experimental");
const json = require("./json/index");
const logging = require("./logger/index");
const ɵterminal = require("./terminal/index");
const workspaces = require("./workspace");

Object.defineProperty(exports, "__esModule", { value: true });

exports.analytics = analytics;
exports.experimental = experimental;
exports.json = json;
exports.logging = logging;
exports.workspaces = workspaces;

/** @deprecated since version 8 - Instead use other 3rd party libraries like `colors` and `chalk`. */
exports.terminal = ɵterminal;

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

function __exportStar(m, exports) {
    for (const p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            __createBinding(exports, m, p);
        }
    }
}

__exportStar(require("./exception/exception"), exports);
__exportStar(require("./json/index"), exports);
__exportStar(require("./utils/index"), exports);
__exportStar(require("./virtual-fs/index"), exports);

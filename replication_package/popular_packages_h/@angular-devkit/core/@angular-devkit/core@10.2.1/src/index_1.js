"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const analytics = require("./analytics");
const experimental = require("./experimental");
const json = require("./json/index");
const logging = require("./logger/index");
const ɵterminal = require("./terminal/index");
const workspaces = require("./workspace");

// Export modules
exports.analytics = analytics;
exports.experimental = experimental;
exports.json = json;
exports.logging = logging;
exports.workspaces = workspaces;

/** @deprecated since version 8 - Use third-party libraries like `colors` and `chalk`. */
exports.terminal = ɵterminal;

// Re-export all from specified modules
const exceptionModule = require("./exception/exception");
Object.assign(exports, exceptionModule);

const jsonModule = require("./json/index");
Object.assign(exports, jsonModule);

const utilsModule = require("./utils/index");
Object.assign(exports, utilsModule);

const virtualFsModule = require("./virtual-fs/index");
Object.assign(exports, virtualFsModule);

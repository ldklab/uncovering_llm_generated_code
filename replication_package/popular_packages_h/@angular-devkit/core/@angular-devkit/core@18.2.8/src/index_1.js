"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaces = exports.logging = exports.json = void 0;

// Import modules and export them
const json = Object.assign({}, require("./json/index"));
exports.json = json;

const logging = Object.assign({}, require("./logger/index"));
exports.logging = logging;

const workspaces = Object.assign({}, require("./workspace"));
exports.workspaces = workspaces;

// Re-export modules
Object.assign(exports, require("./exception"));
Object.assign(exports, require("./json/index"));
Object.assign(exports, require("./utils/index"));
Object.assign(exports, require("./virtual-fs/index"));

"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });

const json = require("./json/index");
exports.json = json;

const logging = require("./logger/index");
exports.logging = logging;

const workspaces = require("./workspace");
exports.workspaces = workspaces;

Object.assign(exports, require("./exception"));
Object.assign(exports, require("./json/index"));
Object.assign(exports, require("./utils/index"));
Object.assign(exports, require("./virtual-fs/index"));

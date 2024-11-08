"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unrefTimer = exports.SDK_INFO = exports.otperformance = exports.RandomIdGenerator = exports.hexToBase64 = exports._globalThis = exports.getEnv = exports.getEnvWithoutDefaults = void 0;
var environment_1 = require("./environment");
Object.defineProperty(exports, "getEnvWithoutDefaults", { enumerable: true, get: function () { return environment_1.getEnvWithoutDefaults; } });
Object.defineProperty(exports, "getEnv", { enumerable: true, get: function () { return environment_1.getEnv; } });
var globalThis_1 = require("./globalThis");
Object.defineProperty(exports, "_globalThis", { enumerable: true, get: function () { return globalThis_1._globalThis; } });
var hex_to_base64_1 = require("./hex-to-base64");
Object.defineProperty(exports, "hexToBase64", { enumerable: true, get: function () { return hex_to_base64_1.hexToBase64; } });
var RandomIdGenerator_1 = require("./RandomIdGenerator");
Object.defineProperty(exports, "RandomIdGenerator", { enumerable: true, get: function () { return RandomIdGenerator_1.RandomIdGenerator; } });
var performance_1 = require("./performance");
Object.defineProperty(exports, "otperformance", { enumerable: true, get: function () { return performance_1.otperformance; } });
var sdk_info_1 = require("./sdk-info");
Object.defineProperty(exports, "SDK_INFO", { enumerable: true, get: function () { return sdk_info_1.SDK_INFO; } });
var timer_util_1 = require("./timer-util");
Object.defineProperty(exports, "unrefTimer", { enumerable: true, get: function () { return timer_util_1.unrefTimer; } });
//# sourceMappingURL=index.js.map
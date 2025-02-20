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
exports.ConsoleLogger = void 0;
const types_1 = require("./types");
const platform_1 = require("../platform");
class ConsoleLogger {
    constructor(level = platform_1.getEnv().OTEL_LOG_LEVEL) {
        if (level >= types_1.LogLevel.DEBUG) {
            this.debug = (...args) => {
                console.debug(...args);
            };
        }
        if (level >= types_1.LogLevel.INFO) {
            this.info = (...args) => {
                console.info(...args);
            };
        }
        if (level >= types_1.LogLevel.WARN) {
            this.warn = (...args) => {
                console.warn(...args);
            };
        }
        if (level >= types_1.LogLevel.ERROR) {
            this.error = (...args) => {
                console.error(...args);
            };
        }
    }
    debug(_message, ..._args) { }
    error(_message, ..._args) { }
    warn(_message, ..._args) { }
    info(_message, ..._args) { }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=ConsoleLogger.js.map
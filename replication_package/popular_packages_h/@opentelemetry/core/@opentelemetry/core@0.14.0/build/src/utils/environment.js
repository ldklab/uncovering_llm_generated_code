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
exports.parseEnvironment = exports.DEFAULT_ENVIRONMENT = void 0;
const types_1 = require("../common/types");
const ENVIRONMENT_NUMBERS = [
    'OTEL_SAMPLING_PROBABILITY',
    'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT',
    'OTEL_SPAN_EVENT_COUNT_LIMIT',
    'OTEL_SPAN_LINK_COUNT_LIMIT',
];
/**
 * Default environment variables
 */
exports.DEFAULT_ENVIRONMENT = {
    OTEL_NO_PATCH_MODULES: '',
    OTEL_LOG_LEVEL: types_1.LogLevel.INFO,
    OTEL_SAMPLING_PROBABILITY: 1,
    OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: 1000,
    OTEL_SPAN_EVENT_COUNT_LIMIT: 1000,
    OTEL_SPAN_LINK_COUNT_LIMIT: 1000,
};
/**
 * Parses a variable as number with number validation
 * @param name
 * @param environment
 * @param values
 * @param min
 * @param max
 */
function parseNumber(name, environment, values, min = -Infinity, max = Infinity) {
    if (typeof values[name] !== 'undefined') {
        const value = Number(values[name]);
        if (!isNaN(value)) {
            if (value < min) {
                environment[name] = min;
            }
            else if (value > max) {
                environment[name] = max;
            }
            else {
                environment[name] = value;
            }
        }
    }
}
/**
 * Environmentally sets log level if valid log level string is provided
 * @param key
 * @param environment
 * @param values
 */
function setLogLevelFromEnv(key, environment, values) {
    const value = values[key];
    switch (typeof value === 'string' ? value.toUpperCase() : value) {
        case 'DEBUG':
            environment[key] = types_1.LogLevel.DEBUG;
            break;
        case 'INFO':
            environment[key] = types_1.LogLevel.INFO;
            break;
        case 'WARN':
            environment[key] = types_1.LogLevel.WARN;
            break;
        case 'ERROR':
            environment[key] = types_1.LogLevel.ERROR;
            break;
        default:
            // do nothing
            break;
    }
}
/**
 * Parses environment values
 * @param values
 */
function parseEnvironment(values) {
    const environment = {};
    for (const env in exports.DEFAULT_ENVIRONMENT) {
        const key = env;
        switch (key) {
            case 'OTEL_SAMPLING_PROBABILITY':
                parseNumber(key, environment, values, 0, 1);
                break;
            case 'OTEL_LOG_LEVEL':
                setLogLevelFromEnv(key, environment, values);
                break;
            default:
                if (ENVIRONMENT_NUMBERS.indexOf(key) >= 0) {
                    parseNumber(key, environment, values);
                }
                else {
                    if (typeof values[key] !== 'undefined') {
                        environment[key] = values[key];
                    }
                }
        }
    }
    return environment;
}
exports.parseEnvironment = parseEnvironment;
//# sourceMappingURL=environment.js.map
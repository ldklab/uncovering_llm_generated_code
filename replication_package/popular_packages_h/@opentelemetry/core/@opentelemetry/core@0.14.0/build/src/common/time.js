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
exports.isTimeInput = exports.isTimeInputHrTime = exports.hrTimeToMicroseconds = exports.hrTimeToMilliseconds = exports.hrTimeToNanoseconds = exports.hrTimeToTimeStamp = exports.hrTimeDuration = exports.timeInputToHrTime = exports.hrTime = void 0;
const platform_1 = require("../platform");
const NANOSECOND_DIGITS = 9;
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
/**
 * Converts a number to HrTime
 * @param epochMillis
 */
function numberToHrtime(epochMillis) {
    const epochSeconds = epochMillis / 1000;
    // Decimals only.
    const seconds = Math.trunc(epochSeconds);
    // Round sub-nanosecond accuracy to nanosecond.
    const nanos = Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
        SECOND_TO_NANOSECONDS;
    return [seconds, nanos];
}
function getTimeOrigin() {
    let timeOrigin = platform_1.otperformance.timeOrigin;
    if (typeof timeOrigin !== 'number') {
        const perf = platform_1.otperformance;
        timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
}
/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
function hrTime(performanceNow) {
    const timeOrigin = numberToHrtime(getTimeOrigin());
    const now = numberToHrtime(typeof performanceNow === 'number' ? performanceNow : platform_1.otperformance.now());
    let seconds = timeOrigin[0] + now[0];
    let nanos = timeOrigin[1] + now[1];
    // Nanoseconds
    if (nanos > SECOND_TO_NANOSECONDS) {
        nanos -= SECOND_TO_NANOSECONDS;
        seconds += 1;
    }
    return [seconds, nanos];
}
exports.hrTime = hrTime;
/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
function timeInputToHrTime(time) {
    // process.hrtime
    if (isTimeInputHrTime(time)) {
        return time;
    }
    else if (typeof time === 'number') {
        // Must be a performance.now() if it's smaller than process start time.
        if (time < getTimeOrigin()) {
            return hrTime(time);
        }
        else {
            // epoch milliseconds or performance.timeOrigin
            return numberToHrtime(time);
        }
    }
    else if (time instanceof Date) {
        return [time.getTime(), 0];
    }
    else {
        throw TypeError('Invalid input type');
    }
}
exports.timeInputToHrTime = timeInputToHrTime;
/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    // overflow
    if (nanos < 0) {
        seconds -= 1;
        // negate
        nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
}
exports.hrTimeDuration = hrTimeDuration;
/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param hrTime
 */
function hrTimeToTimeStamp(hrTime) {
    const precision = NANOSECOND_DIGITS;
    const tmp = `${'0'.repeat(precision)}${hrTime[1]}Z`;
    const nanoString = tmp.substr(tmp.length - precision - 1);
    const date = new Date(hrTime[0] * 1000).toISOString();
    return date.replace('000Z', nanoString);
}
exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
/**
 * Convert hrTime to nanoseconds.
 * @param hrTime
 */
function hrTimeToNanoseconds(hrTime) {
    return hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
}
exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
/**
 * Convert hrTime to milliseconds.
 * @param hrTime
 */
function hrTimeToMilliseconds(hrTime) {
    return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
}
exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
/**
 * Convert hrTime to microseconds.
 * @param hrTime
 */
function hrTimeToMicroseconds(hrTime) {
    return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
}
exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
/**
 * check if time is HrTime
 * @param value
 */
function isTimeInputHrTime(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number');
}
exports.isTimeInputHrTime = isTimeInputHrTime;
/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
function isTimeInput(value) {
    return (isTimeInputHrTime(value) ||
        typeof value === 'number' ||
        value instanceof Date);
}
exports.isTimeInput = isTimeInput;
//# sourceMappingURL=time.js.map
"use strict";
// Exports a function that returns the path of the file from which it was called
// by examining the V8 stack trace.

module.exports = function getCallerFile(position = 2) {
    if (position >= Error.stackTraceLimit) {
        throw new TypeError('getCallerFile(position) requires position be less than Error.stackTraceLimit but position was: `' + position + '` and Error.stackTraceLimit was: `' + Error.stackTraceLimit + '`');
    }

    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    const stack = new Error().stack;
    
    Error.prepareStackTrace = originalPrepareStackTrace;

    if (stack && typeof stack === 'object') {
        return stack[position] ? stack[position].getFileName() : undefined;
    }
};

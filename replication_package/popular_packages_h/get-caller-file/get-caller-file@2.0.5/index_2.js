"use strict";

// This module exports a function that finds the file from which a function was called, using the V8 stack trace.
module.exports = function getCallerFile(position = 2) {
    // Ensure the provided position is within the limit of the stack trace
    if (position >= Error.stackTraceLimit) {
        throw new TypeError(`getCallerFile(position) requires position be less than Error.stackTraceLimit but position was: \`${position}\` and Error.stackTraceLimit was: \`${Error.stackTraceLimit}\``);
    }

    // Preserve the existing Error.prepareStackTrace function
    const oldPrepareStackTrace = Error.prepareStackTrace;

    // Override Error.prepareStackTrace to return the stack as an array of CallSite objects
    Error.prepareStackTrace = (_, stack) => stack;
    
    // Create a new Error to generate a stack trace
    const stack = new Error().stack;

    // Restore the original Error.prepareStackTrace
    Error.prepareStackTrace = oldPrepareStackTrace;

    // Return the file name from the specified stack position
    if (stack !== null && typeof stack === 'object') {
        return stack[position] ? stack[position].getFileName() : undefined;
    }
};

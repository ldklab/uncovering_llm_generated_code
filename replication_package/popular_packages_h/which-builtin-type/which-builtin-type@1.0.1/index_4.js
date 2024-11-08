'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const isArray = require('isarray');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const getFunctionName = require('function.prototype.name');
const isGeneratorFunction = require('is-generator-function');
const isAsyncFunction = require('is-async-fn');

module.exports = function identifyBuiltinType(value) {
    if (value == null) {
        return value;
    }

    // Check if value is a boxed primitive, collection, or a typed array
    const type = whichBoxedPrimitive(Object(value)) || whichCollection(value) || whichTypedArray(value);
    if (type) {
        return type;
    }

    // Check for specific object types
    if (isArray(value)) {
        return 'Array';
    }
    if (isDate(value)) {
        return 'Date';
    }
    if (isRegex(value)) {
        return 'RegExp';
    }

    // Check if value is a function and determine its type
    if (typeof value === 'function') {
        if (isGeneratorFunction(value)) {
            return 'GeneratorFunction';
        }
        if (isAsyncFunction(value)) {
            return 'AsyncFunction';
        }
        return 'Function';
    }

    // Fallback to using the constructor name for other objects
    if (typeof value.constructor === 'function') {
        return getFunctionName(value.constructor);
    }

    // Default to 'Object' if no other type matches
    return 'Object';
};

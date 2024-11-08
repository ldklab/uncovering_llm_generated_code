'use strict';

// Importing utility functions to check the type of collection
var isMap = require('is-map');
var isSet = require('is-set');
var isWeakMap = require('is-weakmap');
var isWeakSet = require('is-weakset');

/**
 * This function determines the type of collection for a given value.
 * It checks specifically for Map, Set, WeakMap, and WeakSet.
 * @param {unknown} value - The value to check
 * @returns {string|boolean} - Returns the collection type as a string, or false if not a recognized collection type
 */
module.exports = function whichCollection(value) {
    // Check if value is an object and not null
    if (value && typeof value === 'object') {
        // Determine the type of collection and return the corresponding string
        if (isMap(value)) {
            return 'Map';
        } 
        if (isSet(value)) {
            return 'Set';
        } 
        if (isWeakMap(value)) {
            return 'WeakMap';
        } 
        if (isWeakSet(value)) {
            return 'WeakSet';
        }
    }
    // Return false if the value is not a recognized collection type
    return false;
};

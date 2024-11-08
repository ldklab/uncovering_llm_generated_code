'use strict';

// Import necessary modules for function binding and getting intrinsic objects
var callBind = require('call-bind');
var callBound = require('call-bind/callBound');
var GetIntrinsic = require('get-intrinsic');

// Get the intrinsic ArrayBuffer constructor
var $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);

// Attempt to get the byteLength method of ArrayBuffer, if it exists
var $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);
// Get the toString method from the Object prototype
var $toString = callBound('Object.prototype.toString');

// Check for the presence of the slice method on an ArrayBuffer instance
// This is relevant for older Node.js versions where slice was not on the prototype
var abSlice = !!$ArrayBuffer && !$byteLength && new $ArrayBuffer(0).slice;
// Bind the slice method correctly for those old versions
var $abSlice = !!abSlice && callBind(abSlice);

// Export the isArrayBuffer function
module.exports = $byteLength || $abSlice
    ? function isArrayBuffer(obj) {
        // Check if the input is a non-null object
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        try {
            // Use either the byteLength method or the bound slice method to determine if obj is an ArrayBuffer
            if ($byteLength) {
                $byteLength(obj);
            } else {
                $abSlice(obj, 0);
            }
            return true;
        } catch (e) {
            // If an error occurs, this indicates that obj is not an ArrayBuffer
            return false;
        }
    }
    : $ArrayBuffer
        ? function isArrayBuffer(obj) {
            // For older environments, use the Object prototype's toString method to identify ArrayBuffers
            return $toString(obj) === '[object ArrayBuffer]';
        }
        : function isArrayBuffer(obj) {
            // For environments without ArrayBuffers, always return false
            return false;
        };

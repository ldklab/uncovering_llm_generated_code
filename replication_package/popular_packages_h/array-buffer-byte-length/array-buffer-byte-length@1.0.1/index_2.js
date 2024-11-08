'use strict';

var callBound = require('call-bind/callBound');
var getByteLength = callBound('ArrayBuffer.prototype.byteLength', true);

var isArrayBuffer = require('is-array-buffer');

/** 
 * This function returns the byte length of an ArrayBuffer.
 *   - If the provided argument is not an ArrayBuffer, it returns NaN.
 *   - For Node.js versions where ArrayBuffer.prototype.byteLength might not be directly accessible,
 *     it uses the `callBound` utility to access it, if possible.
 * @param {ArrayBuffer} ab - The ArrayBuffer whose byte length you want to determine.
 * @returns {number} The byte length of the ArrayBuffer or NaN if the input is not an ArrayBuffer.
 */
module.exports = function byteLength(ab) {
	if (!isArrayBuffer(ab)) {
		return NaN;
	}
	return getByteLength ? getByteLength(ab) : ab.byteLength;
}; // in node < 0.11, byteLength is an own nonconfigurable property

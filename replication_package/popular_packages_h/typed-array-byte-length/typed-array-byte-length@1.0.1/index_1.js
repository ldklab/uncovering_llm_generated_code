'use strict';

var callBind = require('call-bind');
var forEach = require('for-each');
var gOPD = require('gopd');
var hasProto = require('has-proto')();
var isTypedArray = require('is-typed-array');

var typedArrays = require('available-typed-arrays')();

/** @typedef {Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} TypedArray */
/** @typedef {import('possible-typed-array-names')[number]} TypedArrayNames */
/** @typedef {(value: TypedArray) => number} Getter */

/** @type {Object.<TypedArrayNames, Getter>} */
var getters = {};

var oDP = Object.defineProperty;
if (gOPD) {
	/** @type {Getter} */
	var getByteLength = function (x) {
		return x.byteLength;
	};
	forEach(typedArrays, function (typedArray) {
		if (typeof global[typedArray] === 'function' || typeof global[typedArray] === 'object') {
			var Proto = global[typedArray].prototype;
			var descriptor = gOPD(Proto, 'byteLength');
			if (!descriptor && hasProto) {
				var superProto = Proto.__proto__;
				descriptor = gOPD(superProto, 'byteLength');
			}
			if (descriptor && descriptor.get) {
				getters[typedArray] = callBind(descriptor.get);
			} else if (oDP) {
				var arr = new global[typedArray](2);
				descriptor = gOPD(arr, 'byteLength');
				if (descriptor && descriptor.configurable) {
					oDP(arr, 'length', { value: 3 });
				}
				if (arr.length === 2) {
					getters[typedArray] = getByteLength;
				}
			}
		}
	});
}

/** @type {Getter} */
var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundByteLength;
	forEach(getters, function (getter) {
		if (typeof foundByteLength !== 'number') {
			try {
				var byteLength = getter(value);
				if (typeof byteLength === 'number') {
					foundByteLength = byteLength;
				}
			} catch (e) {}
		}
	});
	return foundByteLength;
};

/** @type {import('.')} */
module.exports = function typedArrayByteLength(value) {
	if (!isTypedArray(value)) {
		return false;
	}
	return tryTypedArrays(value);
};

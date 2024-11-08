'use strict';

var callBind = require('call-bind');
var forEach = require('for-each');
var gOPD = require('gopd');
var hasProto = require('has-proto')();
var isTypedArray = require('is-typed-array');
var typedArrays = require('possible-typed-array-names');

/** Cache for TypedArray length getters */
var getters = { __proto__: null };
var oDP = Object.defineProperty;

if (gOPD) {
	var getLength = function (x) {
		return x.length;
	};

	forEach(typedArrays, function (typedArray) {
		var TA = global[typedArray];

		if (typeof TA === 'function' || typeof TA === 'object') {
			var Proto = TA.prototype;
			var descriptor = gOPD(Proto, 'length');

			if (!descriptor && hasProto) {
				var superProto = Proto.__proto__;
				descriptor = gOPD(superProto, 'length');
			}

			if (descriptor && descriptor.get) {
				getters[`$${typedArray}`] = callBind(descriptor.get);
			} else if (oDP) {
				var arr = new global[typedArray](2);
				descriptor = gOPD(arr, 'length');

				if (descriptor && descriptor.configurable) {
					oDP(arr, 'length', { value: 3 });
				}

				if (arr.length === 2) {
					getters[`$${typedArray}`] = getLength;
				}
			}
		}
	});
}

var tryTypedArrays = function (value) {
	var foundLength;

	forEach(getters, function (getter) {
		if (typeof foundLength !== 'number') {
			try {
				var length = getter(value);
				if (typeof length === 'number') {
					foundLength = length;
				}
			} catch (e) {}
		}
	});

	return foundLength;
};

module.exports = function typedArrayLength(value) {
	if (!isTypedArray(value)) {
		return false;
	}
	return tryTypedArrays(value);
};

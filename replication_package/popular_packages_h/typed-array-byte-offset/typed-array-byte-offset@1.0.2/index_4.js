'use strict';

const forEach = require('for-each');
const callBind = require('call-bind');
const typedArrays = require('available-typed-arrays')();
const hasProto = require('has-proto')();
const gOPD = require('gopd');
const oDP = Object.defineProperty;
const isTypedArray = require('is-typed-array');

/** @type {Object.<typeof typedArrays, (x: TypedArray) => number>} */
const byteOffsetGetters = {};

if (gOPD) {
	const getByteOffset = (x) => x.byteOffset;

	forEach(typedArrays, (typedArray) => {
		const TypedArrayConstructor = global[typedArray];
		if (typeof TypedArrayConstructor === 'function' || typeof TypedArrayConstructor === 'object') {
			let descriptor = gOPD(TypedArrayConstructor.prototype, 'byteOffset');

			if (!descriptor && hasProto) {
				descriptor = gOPD(TypedArrayConstructor.prototype.__proto__, 'byteOffset'); // eslint-disable-line no-proto
			}

			if (descriptor && descriptor.get) {
				byteOffsetGetters[typedArray] = callBind(descriptor.get);
			} else if (oDP) {
				const instance = new TypedArrayConstructor(2);
				descriptor = gOPD(instance, 'byteOffset');

				if (descriptor && descriptor.configurable) {
					oDP(instance, 'length', { value: 3 });
				}

				if (instance.length === 2) {
					byteOffsetGetters[typedArray] = getByteOffset;
				}
			}
		}
	});
}

const tryByteOffsetGetters = (value) => {
	let foundOffset;
	forEach(byteOffsetGetters, (getter) => {
		if (typeof foundOffset !== 'number') {
			try {
				const offset = getter(value);
				if (typeof offset === 'number') {
					foundOffset = offset;
				}
			} catch (e) {}
		}
	});
	return foundOffset;
};

module.exports = (value) => {
	if (!isTypedArray(value)) {
		return false;
	}
	return tryByteOffsetGetters(value);
};

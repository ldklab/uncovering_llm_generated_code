'use strict';

const forEach = require('foreach');
const callBind = require('call-bind');
const isTypedArray = require('is-typed-array');

const typedArrays = [
	'Float32Array',
	'Float64Array',
	'Int8Array',
	'Int16Array',
	'Int32Array',
	'Uint8Array',
	'Uint8ClampedArray',
	'Uint16Array',
	'Uint32Array',
	'BigInt64Array',
	'BigUint64Array'
];

const getters = {};
const hasProto = Object.getPrototypeOf([]) === Array.prototype;
const gOPD = Object.getOwnPropertyDescriptor;
const oDP = Object.defineProperty;

if (gOPD) {
	const getLength = x => x.length;
	
	forEach(typedArrays, typedArray => {
		const TypedArrayConstructor = global[typedArray];
		if (typeof TypedArrayConstructor === 'function' || typeof TypedArrayConstructor === 'object') {
			const Proto = TypedArrayConstructor.prototype;
			let descriptor = gOPD(Proto, 'length');
			
			if (!descriptor && hasProto) {
				const superProto = Object.getPrototypeOf(Proto);
				descriptor = gOPD(superProto, 'length');
			}
			
			if (descriptor && descriptor.get) {
				getters[typedArray] = callBind(descriptor.get);
			} else if (oDP) {
				const arr = new TypedArrayConstructor(2);
				descriptor = gOPD(arr, 'length');

				if (descriptor && descriptor.configurable) {
					oDP(arr, 'length', { value: 3 });
				}

				if (arr.length === 2) {
					getters[typedArray] = getLength;
				}
			}
		}
	});
}

const tryTypedArrays = (value) => {
	let foundLength;
	forEach(getters, getter => {
		if (typeof foundLength !== 'number') {
			try {
				const length = getter(value);
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

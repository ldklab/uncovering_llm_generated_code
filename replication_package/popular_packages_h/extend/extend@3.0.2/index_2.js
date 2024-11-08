'use strict';

const { hasOwnProperty, toString } = Object.prototype;
const { defineProperty, getOwnPropertyDescriptor } = Object;

const isArray = Array.isArray || (arr => toString.call(arr) === '[object Array]');

const isPlainObject = (obj) => {
	if (!obj || toString.call(obj) !== '[object Object]') return false;

	const hasOwnConstructor = hasOwnProperty.call(obj, 'constructor');
	const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && 
		hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf');

	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;

	let key;
	for (key in obj); // Enumerate properties

	return typeof key === 'undefined' || hasOwnProperty.call(obj, key);
};

const setProperty = (target, { name, newValue }) => {
	if (defineProperty && name === '__proto__') {
		defineProperty(target, name, {
			enumerable: true,
			configurable: true,
			value: newValue,
			writable: true
		});
	} else {
		target[name] = newValue;
	}
};

const getProperty = (obj, name) => {
	if (name === '__proto__') {
		if (!hasOwnProperty.call(obj, name)) {
			return undefined;
		} else if (getOwnPropertyDescriptor) {
			return getOwnPropertyDescriptor(obj, name).value;
		}
	}
	return obj[name];
};

module.exports = function extend() {
	let target = arguments[0];
	let i = 1;
	let deep = false;

	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < arguments.length; ++i) {
		const options = arguments[i];
		if (options != null) {
			for (let name in options) {
				const src = getProperty(target, name);
				const copy = getProperty(options, name);

				if (target !== copy) {
					let clone;
					if (deep && copy && (isPlainObject(copy) || (isArray(copy)))) {
						clone = src && (isArray(copy) ? isArray(src) ? src : [] : isPlainObject(src) ? src : {});
						setProperty(target, { name, newValue: extend(deep, clone, copy) });
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name, newValue: copy });
					}
				}
			}
		}
	}

	return target;
};

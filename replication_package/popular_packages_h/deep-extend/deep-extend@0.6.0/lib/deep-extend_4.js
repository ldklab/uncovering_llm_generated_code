'use strict';

function isSpecificValue(val) {
	return val instanceof Buffer || val instanceof Date || val instanceof RegExp;
}

function cloneSpecificValue(val) {
	if (val instanceof Buffer) {
		let x = Buffer.alloc ? Buffer.alloc(val.length) : new Buffer(val.length);
		val.copy(x);
		return x;
	} else if (val instanceof Date) {
		return new Date(val.getTime());
	} else if (val instanceof RegExp) {
		return new RegExp(val);
	} else {
		throw new Error('Unexpected situation');
	}
}

function deepCloneArray(arr) {
	return arr.map(item => {
		if (typeof item === 'object' && item !== null) {
			if (Array.isArray(item)) {
				return deepCloneArray(item);
			} else if (isSpecificValue(item)) {
				return cloneSpecificValue(item);
			} else {
				return deepExtend({}, item);
			}
		}
		return item;
	});
}

function safeGetProperty(object, property) {
	return property === '__proto__' ? undefined : object[property];
}

var deepExtend = module.exports = function (...args) {
	if (args.length < 1 || typeof args[0] !== 'object') {
		return false;
	}

	if (args.length < 2) {
		return args[0];
	}

	let target = args[0];

	args.slice(1).forEach(obj => {
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			return;
		}

		Object.keys(obj).forEach(key => {
			let src = safeGetProperty(target, key);
			let val = safeGetProperty(obj, key);

			if (val === target) {
				return;
			} else if (typeof val !== 'object' || val === null) {
				target[key] = val;
			} else if (Array.isArray(val)) {
				target[key] = deepCloneArray(val);
			} else if (isSpecificValue(val)) {
				target[key] = cloneSpecificValue(val);
			} else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
				target[key] = deepExtend({}, val);
			} else {
				target[key] = deepExtend(src, val);
			}
		});
	});

	return target;
};

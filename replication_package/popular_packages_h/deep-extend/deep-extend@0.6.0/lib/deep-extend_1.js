/*!
 * @description Recursive object extending
 * @license MIT
 * Author: Viacheslav Lotsmanov
 */

'use strict';

const isSpecificValue = (val) => (
	val instanceof Buffer ||
	val instanceof Date ||
	val instanceof RegExp
);

const cloneSpecificValue = (val) => {
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
};

const deepCloneArray = (arr) => {
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
};

const safeGetProperty = (object, property) => property === '__proto__' ? undefined : object[property];

const deepExtend = module.exports = function(target, ...sources) {
	if (typeof target !== 'object' || target === null) return false;

	sources.forEach(srcObj => {
		if (typeof srcObj !== 'object' || srcObj === null || Array.isArray(srcObj)) return;

		Object.keys(srcObj).forEach(key => {
			let src = safeGetProperty(target, key);
			let val = safeGetProperty(srcObj, key);

			if (val === target) return;

			if (typeof val !== 'object' || val === null) {
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

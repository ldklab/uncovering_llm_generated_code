'use strict';

function isArray(xs) {
	return Array.isArray(xs) || Object.prototype.toString.call(xs) === '[object Array]';
}

module.exports = function transformArray(xs, fn) {
	const result = [];
	for (let i = 0; i < xs.length; i++) {
		const value = fn(xs[i], i);
		if (isArray(value)) {
			result.push(...value);
		} else {
			result.push(value);
		}
	}
	return result;
};

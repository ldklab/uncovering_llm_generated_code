'use strict';

const isArray = Array.isArray || function (xs) {
	return Object.prototype.toString.call(xs) === '[object Array]';
};

module.exports = function (array, fn) {
	const result = [];
	for (let i = 0; i < array.length; i++) {
		const processedElement = fn(array[i], i);
		if (isArray(processedElement)) {
			result.push(...processedElement);
		} else {
			result.push(processedElement);
		}
	}
	return result;
};

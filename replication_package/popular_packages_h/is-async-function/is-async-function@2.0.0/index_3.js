'use strict';

const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*async(?:\s+function(?:\s+|\()|\s*\()/;
const hasToStringTag = require('has-tostringtag/shams')();
const getProto = Object.getPrototypeOf;

const getAsyncFunc = function () {
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return async function () {}')();
	} catch {
		return false;
	}
};

let AsyncFunction = undefined;

module.exports = function isAsyncFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}

	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}

	if (!hasToStringTag) {
		return toStr.call(fn) === '[object AsyncFunction]';
	}

	if (!getProto) {
		return false;
	}

	if (AsyncFunction === undefined) {
		const asyncFunc = getAsyncFunc();
		AsyncFunction = asyncFunc ? getProto(asyncFunc) : false;
	}

	return getProto(fn) === AsyncFunction;
};

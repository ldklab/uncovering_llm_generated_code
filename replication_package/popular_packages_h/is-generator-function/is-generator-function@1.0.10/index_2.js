'use strict';

const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;
const hasToStringTag = require('has-tostringtag/shams')();
const getProto = Object.getPrototypeOf;

const getGeneratorFunc = function () {
	if (!hasToStringTag) {
		return false;
	}
	try {
		return new Function('return function*() {}')();
	} catch (e) {
		return false;
	}
};

let GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}

	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}

	if (!hasToStringTag) {
		const str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}

	if (!getProto) {
		return false;
	}

	if (typeof GeneratorFunction === 'undefined') {
		const generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}

	return getProto(fn) === GeneratorFunction;
};

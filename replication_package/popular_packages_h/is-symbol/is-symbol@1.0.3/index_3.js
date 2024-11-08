'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

let isSymbol;

if (hasSymbols) {
	const symToStr = Symbol.prototype.toString;
	const symStringRegex = /^Symbol\(.*\)$/;

	const isSymbolObject = (value) => {
		return typeof value.valueOf() === 'symbol' && symStringRegex.test(symToStr.call(value));
	};

	isSymbol = (value) => {
		if (typeof value === 'symbol') {
			return true;
		}
		if (toStr.call(value) !== '[object Symbol]') {
			return false;
		}
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	isSymbol = (value) => false;
}

module.exports = isSymbol;

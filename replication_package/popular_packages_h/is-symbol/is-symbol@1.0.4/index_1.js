'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

function isRealSymbolObject(value) {
	return typeof value.valueOf() === 'symbol' && /^Symbol\(.*\)$/.test(Symbol.prototype.toString.call(value));
}

function isSymbol(value) {
	if (hasSymbols) {
		if (typeof value === 'symbol') {
			return true;
		}
		if (toStr.call(value) !== '[object Symbol]') {
			return false;
		}
		try {
			return isRealSymbolObject(value);
		} catch (e) {
			return false;
		}
	} else {
		// this environment does not support Symbols.
		return false;
	}
}

module.exports = isSymbol;

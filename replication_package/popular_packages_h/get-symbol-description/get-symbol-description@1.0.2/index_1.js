'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bind/callBound');
const $SyntaxError = require('es-errors/syntax');

const getGlobalSymbolDescription = GetIntrinsic('%Symbol.keyFor%', true);
const thisSymbolValue = callBound('%Symbol.prototype.valueOf%', true);
const symToStr = callBound('Symbol.prototype.toString', true);
const $strSlice = callBound('String.prototype.slice');
const getInferredName = require('./getInferredName');

const getSymbolDescription = callBound('%Symbol.prototype.description%', true) || function (symbol) {
	if (!thisSymbolValue) {
		throw new $SyntaxError('Symbols are not supported in this environment');
	}

	// Extract the symbol value; an exception is thrown if it's invalid
	const sym = thisSymbolValue(symbol);

	if (getInferredName) {
		const name = getInferredName(sym);
		if (name === '') {
			return;
		}
		return name.slice(1, -1); // Remove surrounding brackets
	}

	let desc;

	// Try to get a global symbol description if available
	if (getGlobalSymbolDescription) {
		desc = getGlobalSymbolDescription(sym);
		if (typeof desc === 'string') {
			return desc;
		}
	}

	// Extract description from the symbol's string representation
	desc = $strSlice(symToStr(sym), 7, -1); // Remove 'Symbol(' and the trailing ')'
	if (desc) {
		return desc;
	}
};

module.exports = getSymbolDescription;

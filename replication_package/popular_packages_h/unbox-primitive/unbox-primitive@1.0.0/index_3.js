'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const bind = require('function-bind');
const hasSymbols = require('has-symbols')();
const hasBigInts = require('has-bigints')();

const unboxMethods = {
	String: bind.call(Function.call, String.prototype.toString),
	Number: bind.call(Function.call, Number.prototype.valueOf),
	Boolean: bind.call(Function.call, Boolean.prototype.valueOf),
	Symbol: hasSymbols ? bind.call(Function.call, Symbol.prototype.valueOf) : null,
	BigInt: hasBigInts ? bind.call(Function.call, BigInt.prototype.valueOf) : null
};

module.exports = function unboxPrimitive(value) {
	const which = whichBoxedPrimitive(value);
	if (typeof which !== 'string') {
		throw new TypeError(which === null 
			? 'value is an unboxed primitive' 
			: 'value is a non-boxed-primitive object'
		);
	}

	if (!unboxMethods[which]) {
		if (which === 'Symbol') {
			throw new EvalError('somehow this environment does not have Symbols, but you have a boxed Symbol value. Please report this!');
		}
		if (which === 'BigInt') {
			throw new EvalError('somehow this environment does not have BigInts, but you have a boxed BigInt value. Please report this!');
		}
		throw new RangeError(`unknown boxed primitive found: ${which}`);
	}

	return unboxMethods[which](value);
};

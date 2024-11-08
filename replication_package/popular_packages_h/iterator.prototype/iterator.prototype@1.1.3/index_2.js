'use strict';

var GetIntrinsic = require('get-intrinsic');
var gPO = require('reflect.getprototypeof');
var hasSymbols = require('has-symbols');
var define = require('define-properties');
var setFunctionName = require('set-function-name');

// Attempt to retrieve the intrinsic %ArrayIteratorPrototype%
var arrayIterProto = GetIntrinsic('%ArrayIteratorPrototype%', true);

// Determine the prototype of the array iterator
var iterProto = arrayIterProto && gPO(arrayIterProto);

// Default to iterProto if valid, otherwise use an empty object
var result = (iterProto !== Object.prototype && iterProto) || {};

// Check if the environment supports Symbols
if (hasSymbols()) {
	var defined = {};
	var predicates = {};
	var alwaysTrue = function () {
		return true;
	};

	// Define Symbol.iterator if it doesn't exist in result
	if (!(Symbol.iterator in result)) {
		defined[Symbol.iterator] = setFunctionName(function SymbolIterator() {
			return this;
		}, '[Symbol.iterator]', true);

		predicates[Symbol.iterator] = alwaysTrue;
	}

	// Apply the defined Symbol.iterator to result
	define(result, defined, predicates);
}

// Export the resultant object, ensuring Symbol.iterator is defined
module.exports = result;

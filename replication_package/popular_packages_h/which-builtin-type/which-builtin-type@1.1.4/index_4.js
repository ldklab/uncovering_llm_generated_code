'use strict';

// Import helper modules for type checking
const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const isArray = require('isarray');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const isWeakRef = require('is-weakref');
const isFinalizationRegistry = require('is-finalizationregistry');
const functionName = require('function.prototype.name');
const isGeneratorFunction = require('is-generator-function');
const isAsyncFunction = require('is-async-function');
const hasToStringTag = require('has-tostringtag/shams')();
const toStringTag = hasToStringTag && Symbol.toStringTag;

const promiseThen = typeof Promise === 'function' && Promise.prototype.then;

// Function to determine if a value is a Promise
const isPromise = value => {
	if (!value || typeof value !== 'object' || !promiseThen) {
		return false;
	}
	try {
		promiseThen.call(value, null, () => {});
		return true;
	} catch (e) {
		return false;
	}
};

// Utility function to check if a string is a known builtin type name
const isKnownBuiltin = builtinName => {
	return builtinName && ![
		'BigInt', 'Boolean', 'Null', 'Number', 'String', 'Symbol', 'Undefined',
		'Math', 'JSON', 'Reflect', 'Atomics',
		'Map', 'Set', 'WeakMap', 'WeakSet',
		'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array', 
		'Int16Array', 'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 
		'Uint8Array', 'Uint8ClampedArray',
		'Array', 'Date', 'FinalizationRegistry', 'Promise', 'RegExp', 
		'WeakRef', 'Function', 'GeneratorFunction', 'AsyncFunction'
	].includes(builtinName);
};

// Main function to determine the built-in type of a given value
module.exports = function whichBuiltinType(value) {
	if (value == null) {
		return value;
	}

	// Check for various known types using utility modules
	const which = whichBoxedPrimitive(Object(value)) || whichCollection(value) || whichTypedArray(value);
	if (which) return which;
	if (isArray(value)) return 'Array';
	if (isDate(value)) return 'Date';
	if (isRegex(value)) return 'RegExp';
	if (isWeakRef(value)) return 'WeakRef';
	if (isFinalizationRegistry(value)) return 'FinalizationRegistry';
	if (typeof value === 'function') {
		if (isGeneratorFunction(value)) return 'GeneratorFunction';
		if (isAsyncFunction(value)) return 'AsyncFunction';
		return 'Function';
	}
	if (isPromise(value)) return 'Promise';
	if (toStringTag && toStringTag in value && isKnownBuiltin(value[toStringTag])) {
		return value[toStringTag];
	}
	if (typeof value.constructor === 'function' && isKnownBuiltin(functionName(value.constructor))) {
		return functionName(value.constructor);
	}
	return 'Object';
};

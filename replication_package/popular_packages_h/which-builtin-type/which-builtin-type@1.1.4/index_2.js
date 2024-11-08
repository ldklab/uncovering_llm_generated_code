'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const isArray = require('isarray');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const isWeakRef = require('is-weakref');
const isFinalizationRegistry = require('is-finalizationregistry');
const getName = require('function.prototype.name');
const isGeneratorFunction = require('is-generator-function');
const isAsyncFunction = require('is-async-function');
const hasToStringTag = require('has-tostringtag/shams')();
const toStringTag = hasToStringTag && Symbol.toStringTag;

const OBJECT = Object;

const promiseThen = typeof Promise === 'function' && Promise.prototype.then;
const isPromise = (value) => {
	if (!value || typeof value !== 'object' || !promiseThen) return false;
	try {
		promiseThen.call(value, null, () => {});
		return true;
	} catch (e) {}
	return false;
};

const isKnownBuiltin = (builtinName) => {
	return builtinName
		&& !['BigInt', 'Boolean', 'Null', 'Number', 'String', 'Symbol', 'Undefined',
		    'Math', 'JSON', 'Reflect', 'Atomics', 
		    'Map', 'Set', 'WeakMap', 'WeakSet',
		    'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array',
		    'Int16Array', 'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 
		    'Uint8Array', 'Uint8ClampedArray', 
		    'Array', 'Date', 'FinalizationRegistry', 'Promise', 'RegExp', 'WeakRef', 
		    'Function', 'GeneratorFunction', 'AsyncFunction'
		   ].includes(builtinName);
};

module.exports = function whichBuiltinType(value) {
	if (value == null) return value;

	const which = whichBoxedPrimitive(OBJECT(value)) || whichCollection(value) || whichTypedArray(value);
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

	if (toStringTag && toStringTag in value) {
		const tag = value[toStringTag];
		if (isKnownBuiltin(tag)) return tag;
	}
	
	if (typeof value.constructor === 'function') {
		const constructorName = getName(value.constructor);
		if (isKnownBuiltin(constructorName)) return constructorName;
	}
	
	return 'Object';
};

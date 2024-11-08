'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const isArray = require('isarray');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const isWeakRef = require('is-weakref');
const isFinalizationRegistry = require('is-finalizationregistry');
const getFunctionName = require('function.prototype.name');
const isGeneratorFunction = require('is-generator-function');
const isAsyncFunction = require('is-async-function');
const hasToStringTag = require('has-tostringtag/shams')();
const toStringTag = hasToStringTag ? Symbol.toStringTag : null;

const promiseThen = typeof Promise === 'function' ? Promise.prototype.then : null;

function isPromise(value) {
	if (!value || typeof value !== 'object' || !promiseThen) {
		return false;
	}
	try {
		promiseThen.call(value, null, () => {});
		return true;
	} catch (e) {
		return false;
	}
}

function isKnownBuiltin(builtinName) {
	const ignoredNames = new Set([
		'BigInt', 'Boolean', 'Null', 'Number', 'String', 'Symbol', 'Undefined',
		'Math', 'JSON', 'Reflect', 'Atomics', 'Map', 'Set', 'WeakMap', 'WeakSet',
		'BigInt64Array', 'BigUint64Array', 'Float32Array', 'Float64Array', 'Int16Array', 
		'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 'Uint8Array', 
		'Uint8ClampedArray', 'Array', 'Date', 'FinalizationRegistry', 'Promise', 
		'RegExp', 'WeakRef', 'Function', 'GeneratorFunction', 'AsyncFunction'
	]);
	return builtinName && !ignoredNames.has(builtinName);
}

module.exports = function whichBuiltinType(value) {
	if (value == null) {
		return value;
	}

	const typeCheckers = [
		() => whichBoxedPrimitive(value),
		() => whichCollection(value),
		() => whichTypedArray(value),
		() => isArray(value) && 'Array',
		() => isDate(value) && 'Date',
		() => isRegex(value) && 'RegExp',
		() => isWeakRef(value) && 'WeakRef',
		() => isFinalizationRegistry(value) && 'FinalizationRegistry',
		() => typeof value === 'function' && (isGeneratorFunction(value) ? 'GeneratorFunction' : isAsyncFunction(value) ? 'AsyncFunction' : 'Function'),
		() => isPromise(value) && 'Promise',
	];

	for (const check of typeCheckers) {
		const result = check();
		if (result) {
			return result;
		}
	}

	if (toStringTag && toStringTag in value) {
		const tag = value[toStringTag];
		if (isKnownBuiltin(tag)) {
			return tag;
		}
	}
    
	if (typeof value.constructor === 'function') {
		const constructorName = getFunctionName(value.constructor);
		if (isKnownBuiltin(constructorName)) {
			return constructorName;
		}
	}

	return 'Object';
};

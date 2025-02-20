'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const isArray = require('isarray');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const name = require('function.prototype.name');
const isGeneratorFunction = require('is-generator-function');
const isAsyncFunction = require('is-async-fn');

const $Object = Object;

module.exports = function determineBuiltinType(value) {
	if (value == null) {
		return value;
	}
	
	let type = whichBoxedPrimitive($Object(value)) || whichCollection(value) || whichTypedArray(value);
	if (type) {
		return type;
	}
	
	if (isArray(value)) {
		return 'Array';
	}
	if (isDate(value)) {
		return 'Date';
	}
	if (isRegex(value)) {
		return 'RegExp';
	}
	if (typeof value === 'function') {
		if (isGeneratorFunction(value)) {
			return 'GeneratorFunction';
		}
		if (isAsyncFunction(value)) {
			return 'AsyncFunction';
		}
		return 'Function';
	}
	
	if (typeof value.constructor === 'function') {
		return name(value.constructor);
	}
	
	return 'Object';
};

'use strict';

const fnToStr = Function.prototype.toString;
let reflectApply = (typeof Reflect === 'object' && Reflect !== null) ? Reflect.apply : null;
let badArrayLike;
let isCallableMarker = {};

if (reflectApply && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		// Test if reflectApply behaves as expected
		reflectApply(() => { throw 42; }, null, badArrayLike);
	} catch (err) {
		if (err !== isCallableMarker) {
			reflectApply = null;
		}
	}
}

const constructorRegex = /^\s*class\b/;
const isES6ClassFn = (value) => {
	try {
		const fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false;
	}
};

const tryFunctionObject = (value) => {
	try {
		if (isES6ClassFn(value)) return false;
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

const toStr = Object.prototype.toString;
const objectClass = '[object Object]';
const fnClass = '[object Function]';
const genClass = '[object GeneratorFunction]';
const hasToStringTag = (typeof Symbol === 'function' && !!Symbol.toStringTag);

const isIE68 = !(0 in [,]); // Specific check for IE 6-8

const isDDA = () => false;
if (typeof document === 'object') {
	const all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = (value) => {
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					const str = toStr.call(value);
					return (str === '[object HTMLAllCollection]'
							|| str === '[object HTML document.all class]'
							|| str === '[object HTMLCollection]'
							|| str === objectClass) && (value('') == null);
				} catch (e) {}
			}
			return false;
		};
	}
}

module.exports = reflectApply ? (value) => {
	if (isDDA(value)) return true;
	if (!value || (typeof value !== 'function' && typeof value !== 'object')) return false;
	try {
		reflectApply(value, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) return false;
	}
	return !isES6ClassFn(value) && tryFunctionObject(value);
} : (value) => {
	if (isDDA(value)) return true;
	if (!value || (typeof value !== 'function' && typeof value !== 'object')) return false;
	if (hasToStringTag) return tryFunctionObject(value);
	if (isES6ClassFn(value)) return false;
	const strClass = toStr.call(value);
	if (![fnClass, genClass].includes(strClass) && !(/^\[object HTML/).test(strClass)) return false;
	return tryFunctionObject(value);
};

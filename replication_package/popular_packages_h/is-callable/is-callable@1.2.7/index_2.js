'use strict';

const fnToStr = Function.prototype.toString;
let reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
let badArrayLike, isCallableMarker;

if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: () => { throw isCallableMarker; }
		});
		isCallableMarker = {};
		reflectApply(() => { throw 42; }, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
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
const ddaClass = '[object HTMLAllCollection]';
const ddaClass2 = '[object HTML document.all class]';
const ddaClass3 = '[object HTMLCollection]';
const hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag;
const isIE68 = !(0 in [,]);

let isDDA = () => false;
if (typeof document === 'object') {
	const all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = (value) => {
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					const str = toStr.call(value);
					return (
						str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass
					) && value('') == null;
				} catch (e) {}
			}
			return false;
		};
	}
}

module.exports = reflectApply 
	? (value) => {
		if (isDDA(value)) return true;
		if (!value) return false;
		if (typeof value !== 'function' && typeof value !== 'object') return false;
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) return false;
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	  }
	: (value) => {
		if (isDDA(value)) return true;
		if (!value) return false;
		if (typeof value !== 'function' && typeof value !== 'object') return false;
		if (hasToStringTag) return tryFunctionObject(value);
		if (isES6ClassFn(value)) return false;
		const strClass = toStr.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) return false;
		return tryFunctionObject(value);
	  };

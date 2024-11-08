/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = Object.prototype.hasOwnProperty;

	function classNames (...args) {
		return args.reduce((acc, arg) => appendClass(acc, parseValue(arg)), '');
	}

	function parseValue (arg) {
		if (typeof arg === 'string' || typeof arg === 'number') {
			return arg;
		}

		if (typeof arg !== 'object' || arg === null) {
			return '';
		}

		if (Array.isArray(arg)) {
			return classNames(...arg);
		}

		if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
			return arg.toString();
		}

		return Object.keys(arg).reduce((acc, key) => {
			return hasOwn.call(arg, key) && arg[key] ? appendClass(acc, key) : acc;
		}, '');
	}

	function appendClass (existing, addition) {
		if (!addition) {
			return existing;
		}

		return existing ? `${existing} ${addition}` : addition;
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
		module.exports.default = classNames;
	} else if (typeof define === 'function' && define.amd) {
		define('classnames', [], () => classNames);
	} else {
		window.classNames = classNames;
	}
}());

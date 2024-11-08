/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames(...args) {
		let classes = '';

		args.forEach(arg => {
			if (arg) {
				classes = appendClass(classes, parseValue(arg));
			}
		});

		return classes;
	}

	function parseValue(arg) {
		if (typeof arg === 'string' || typeof arg === 'number') {
			return arg;
		}

		if (Array.isArray(arg)) {
			return classNames(...arg);
		}

		if (typeof arg === 'object' && arg !== null) {
			let classes = '';
			for (const key in arg) {
				if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
					classes = appendClass(classes, key);
				}
			}
			return classes;
		}

		return '';
	}

	function appendClass(existingClasses, newClass) {
		if (newClass) {
			if (existingClasses) {
				return `${existingClasses} ${newClass}`;
			}
			return newClass;
		}
		return existingClasses;
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && define.amd) {
		define('classnames', [], () => classNames);
	} else {
		this.classNames = classNames;
	}
}.call(this));

/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	const hasOwnProperty = Object.prototype.hasOwnProperty;

	function classNames() {
		const classes = [];

		for (let i = 0; i < arguments.length; i++) {
			const arg = arguments[i];
			if (!arg) continue;

			const argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				const inner = classNames(...arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (const key in arg) {
					if (hasOwnProperty.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
		classNames.default = classNames;
	} else if (typeof define === 'function' && define.amd) {
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
})();

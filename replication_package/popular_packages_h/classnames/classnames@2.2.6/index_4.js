/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames(...args) {
		const classes = [];

		args.forEach(arg => {
			if (!arg) return;

			const argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				const inner = classNames(...arg);
				if (inner) classes.push(inner);
			} else if (argType === 'object') {
				Object.keys(arg).forEach(key => {
					if (arg[key]) classes.push(key);
				});
			}
		});

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && define.amd) {
		define('classnames', [], () => classNames);
	} else {
		window.classNames = classNames;
	}
}());

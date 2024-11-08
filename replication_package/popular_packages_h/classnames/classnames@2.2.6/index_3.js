/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames(...args) {
		const classes = [];

		for (let arg of args) {
			if (!arg) continue;

			if (typeof arg === 'string' || typeof arg === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				const inner = classNames(...arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (typeof arg === 'object') {
				for (let key in arg) {
					if (arg.hasOwnProperty(key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && define.amd) {
		define('classnames', [], () => classNames);
	} else {
		window.classNames = classNames;
	}
})();

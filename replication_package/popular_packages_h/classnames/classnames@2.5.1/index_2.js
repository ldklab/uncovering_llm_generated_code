/*!
    Copyright (c) 2018 Jed Watson.
    Licensed under the MIT License (MIT), see
    http://jedwatson.github.io/classnames
*/

(function () {
    'use strict';

    const hasOwnProp = Object.prototype.hasOwnProperty;

    function classNames() {
        let classString = '';

        for (const arg of arguments) {
            if (arg) {
                classString = addClass(classString, evaluateArg(arg));
            }
        }

        return classString;
    }

    function evaluateArg(arg) {
        if (typeof arg === 'string' || typeof arg === 'number') {
            return arg;
        }

        if (typeof arg !== 'object') {
            return '';
        }

        if (Array.isArray(arg)) {
            return classNames(...arg);
        }

        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
            return arg.toString();
        }

        let classList = '';
        for (const key in arg) {
            if (hasOwnProp.call(arg, key) && arg[key]) {
                classList = addClass(classList, key);
            }
        }

        return classList;
    }

    function addClass(existing, newClass) {
        if (!newClass) {
            return existing;
        }

        return existing ? `${existing} ${newClass}` : newClass;
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

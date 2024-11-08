/*!
 * This is an implementation of the classNames utility function,
 * which combines multiple class names into a single string.
 */

(function () {
    'use strict';

    function classNames() {
        return Array.from(arguments).reduce((acc, arg) => {
            if (!arg) return acc;

            switch (typeof arg) {
                case 'string':
                case 'number':
                    return acc ? acc + ' ' + arg : arg;
                case 'object':
                    if (Array.isArray(arg)) {
                        return acc ? acc + ' ' + classNames.apply(null, arg) : classNames.apply(null, arg);
                    }
                    if (arg.toString !== Object.prototype.toString && 
                        !arg.toString.toString().includes('[native code]')) {
                        return acc ? acc + ' ' + arg.toString() : arg.toString();
                    }
                    for (let key in arg) {
                        if (arg.hasOwnProperty(key) && arg[key]) {
                            acc = acc ? acc + ' ' + key : key;
                        }
                    }
            }
            return acc;
        }, '');
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = classNames;
    } else if (typeof define === 'function' && define.amd) {
        define('classnames', [], function () {
            return classNames;
        });
    } else {
        window.classNames = classNames;
    }
})();

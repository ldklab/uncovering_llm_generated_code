'use strict';

var $defineProperty = require('es-define-property');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var gopd = require('gopd');

module.exports = function defineDataProperty(obj, property, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
        throw new $TypeError('`obj` must be an object or a function`');
    }
    if (typeof property !== 'string' && typeof property !== 'symbol') {
        throw new $TypeError('`property` must be a string or a symbol`');
    }
    if (arguments.length > 3 && typeof nonEnumerable !== 'boolean' && nonEnumerable !== null) {
        throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 4 && typeof nonWritable !== 'boolean' && nonWritable !== null) {
        throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 5 && typeof nonConfigurable !== 'boolean' && nonConfigurable !== null) {
        throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
    }
    if (arguments.length > 6 && typeof loose !== 'boolean') {
        throw new $TypeError('`loose`, if provided, must be a boolean');
    }

    var desc = !!gopd && gopd(obj, property);

    if ($defineProperty) {
        $defineProperty(obj, property, {
            configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
            enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
            value: value,
            writable: nonWritable === null && desc ? desc.writable : !nonWritable
        });
    } else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
        obj[property] = value; // eslint-disable-line no-param-reassign
    } else {
        throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
    }
};

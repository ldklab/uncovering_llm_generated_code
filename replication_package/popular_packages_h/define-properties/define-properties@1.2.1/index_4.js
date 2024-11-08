'use strict';

const keys = require('object-keys');
const defineDataProperty = require('define-data-property');
const supportsDescriptors = require('has-property-descriptors')();

const hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';
const toStr = Object.prototype.toString;
const concat = Array.prototype.concat;

function isFunction(fn) {
    return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
}

function defineProperty(object, name, value, predicate) {
    if (name in object) {
        if (predicate === true) {
            if (object[name] === value) {
                return;
            }
        } else if (!isFunction(predicate) || !predicate()) {
            return;
        }
    }

    if (supportsDescriptors) {
        defineDataProperty(object, name, value, true);
    } else {
        defineDataProperty(object, name, value);
    }
}

function defineProperties(object, map, predicates = {}) {
    let props = keys(map);
    if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
    }
    for (const prop of props) {
        defineProperty(object, prop, map[prop], predicates[prop]);
    }
}

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

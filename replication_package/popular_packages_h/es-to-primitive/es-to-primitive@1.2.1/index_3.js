'use strict';

const ES5 = require('./es5');
const ES6 = require('./es6');
const ES2015 = require('./es2015');

function defineNonEnumerableProperty(obj, prop, value) {
    if (Object.defineProperty) {
        Object.defineProperty(obj, prop, { enumerable: false, value: value });
    } else {
        obj[prop] = value;
    }
}

defineNonEnumerableProperty(ES2015, 'ES5', ES5);
defineNonEnumerableProperty(ES2015, 'ES6', ES6);
defineNonEnumerableProperty(ES2015, 'ES2015', ES2015);

module.exports = ES2015;

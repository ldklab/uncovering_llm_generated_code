'use strict';

const ES5 = require('./es5');
const ES6 = require('./es6');
const ES2015 = require('./es2015');

const attachProperties = (target, source) => {
    target.ES5 = source.ES5;
    target.ES6 = source.ES6;
    target.ES2015 = source.ES2015;
};

if (Object.defineProperty) {
    Object.defineProperty(ES2015, 'ES5', { enumerable: false, value: ES5 });
    Object.defineProperty(ES2015, 'ES6', { enumerable: false, value: ES6 });
    Object.defineProperty(ES2015, 'ES2015', { enumerable: false, value: ES2015 });
} else {
    attachProperties(ES6, { ES5, ES6, ES2015 });
}

module.exports = ES2015;

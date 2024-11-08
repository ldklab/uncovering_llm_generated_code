'use strict';

const ES5 = require('./es5');
const ES6 = require('./es6');
const ES2015 = require('./es2015');

if (typeof Object.defineProperty === 'function') {
  Object.defineProperty(ES2015, 'ES5', { enumerable: false, value: ES5 });
  Object.defineProperty(ES2015, 'ES6', { enumerable: false, value: ES6 });
  Object.defineProperty(ES2015, 'ES2015', { enumerable: false, value: ES2015 });
} else {
  ES6.ES5 = ES5;
  ES6.ES6 = ES6;
  ES6.ES2015 = ES2015;
}

module.exports = ES2015;

'use strict';

const ES5 = require('./es5');
const ES6 = require('./es6');
const ES2015 = require('./es2015');

if (Object.defineProperty) {
	// Add non-enumerable properties to ES2015 object
	Object.defineProperty(ES2015, 'ES5', { enumerable: false, value: ES5 });
	Object.defineProperty(ES2015, 'ES6', { enumerable: false, value: ES6 });
	Object.defineProperty(ES2015, 'ES2015', { enumerable: false, value: ES2015 });
} else {
	// Add enumerable properties to ES6 object for environments without defineProperty
	ES6.ES5 = ES5;
	ES6.ES6 = ES6;
	ES6.ES2015 = ES2015;
}

// Export the ES2015 module
module.exports = ES2015;

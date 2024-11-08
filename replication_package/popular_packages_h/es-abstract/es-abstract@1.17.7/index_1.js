'use strict';

// Import custom utility function to merge properties into objects
const assign = require('./helpers/assign');

// Import ES specification versions
const ES5 = require('./es5');
const ES2015 = require('./es2015');
const ES2016 = require('./es2016');
const ES2017 = require('./es2017');
const ES2018 = require('./es2018');
const ES2019 = require('./es2019');

// Create an object to hold all ES versions
const ES = {
    ES5,
    ES6: ES2015,   // Alias ES6 as ES2015
    ES2015,
    ES7: ES2016,   // Alias ES7 as ES2016
    ES2016,
    ES2017,
    ES2018,
    ES2019
};

// Extend the ES object with properties from ES5
assign(ES, ES5);

// Remove the CheckObjectCoercible function which has been renamed in ES6
delete ES.CheckObjectCoercible;

// Further extend the ES object with properties from ES2015
assign(ES, ES2015);

// Export the constructed ES object
module.exports = ES;

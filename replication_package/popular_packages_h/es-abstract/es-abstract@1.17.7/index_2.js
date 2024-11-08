'use strict';

const assign = require('./helpers/assign');

const ES5 = require('./es5');
const ES2015 = require('./es2015');
const ES2016 = require('./es2016');
const ES2017 = require('./es2017');
const ES2018 = require('./es2018');
const ES2019 = require('./es2019');

// Create an object that maps ES version labels to their respective modules
const ES = {
    ES5: ES5,
    ES6: ES2015,   // ES6 is an alias for ES2015
    ES2015: ES2015,
    ES7: ES2016,   // ES7 is an alias for ES2016
    ES2016: ES2016,
    ES2017: ES2017,
    ES2018: ES2018,
    ES2019: ES2019
};

// Assign properties from ES5 module to ES object
assign(ES, ES5);

// Deletes the CheckObjectCoercible property, which was renamed to RequireObjectCoercible in ES6
delete ES.CheckObjectCoercible;

// Assign properties from ES2015 module to the ES object, 
// allowing ES2015 properties to overwrite existing ones
assign(ES, ES2015);

// Make the ES object available to other modules
module.exports = ES;

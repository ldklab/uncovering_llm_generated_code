'use strict';

const assign = require('./helpers/assign');

const ES5 = require('./es5');
const ES2015 = require('./es2015');
const ES2016 = require('./es2016');
const ES2017 = require('./es2017');
const ES2018 = require('./es2018');
const ES2019 = require('./es2019');

const ES = {
    ES5,
    ES6: ES2015,
    ES2015,
    ES7: ES2016,
    ES2016,
    ES2017,
    ES2018,
    ES2019
};

assign(ES, ES5);
delete ES.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(ES, ES2015);

module.exports = ES;

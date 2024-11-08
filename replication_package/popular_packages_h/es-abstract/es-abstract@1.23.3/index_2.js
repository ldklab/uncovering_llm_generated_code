'use strict';

const assign = require('./helpers/assign');

const ES5 = require('./es5');
const ES2015 = require('./es2015');
const ES2016 = require('./es2016');
const ES2017 = require('./es2017');
const ES2018 = require('./es2018');
const ES2019 = require('./es2019');
const ES2020 = require('./es2020');
const ES2021 = require('./es2021');
const ES2022 = require('./es2022');
const ES2023 = require('./es2023');
const ES2024 = require('./es2024');

const ES = {
    ES5,
    ES6: ES2015,
    ES2015,
    ES7: ES2016,
    ES2016,
    ES2017,
    ES2018,
    ES2019,
    ES2020,
    ES2021,
    ES2022,
    ES2023,
    ES2024
};
assign(ES, ES5);
delete ES.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(ES, ES2015);

module.exports = ES;

'use strict';

const assign = require('./helpers/assign');

const ESModules = {
    ES5: require('./es5'),
    ES2015: require('./es2015'),
    ES2016: require('./es2016'),
    ES2017: require('./es2017'),
    ES2018: require('./es2018'),
    ES2019: require('./es2019')
};

const ES = {
    ...ESModules,
    ES6: ESModules.ES2015,
    ES7: ESModules.ES2016
};

assign(ES, ESModules.ES5);
delete ES.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(ES, ESModules.ES2015);

module.exports = ES;

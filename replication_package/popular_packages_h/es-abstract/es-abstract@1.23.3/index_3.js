'use strict';

const assign = require('./helpers/assign');

const years = [
  'es5', 'es2015', 'es2016', 'es2017', 'es2018',
  'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'es2024'
];

const esModules = years.reduce((obj, year) => {
  const version = require(`./${year}`);
  obj[year.toUpperCase()] = version; 
  obj[`ES${year.slice(2)}`] = version; // e.g., ES2015 for es2015
  return obj;
}, {});

// Map legacy ES6 to ES2015
esModules.ES6 = esModules.ES2015;

assign(esModules, esModules.ES5);
delete esModules.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(esModules, esModules.ES2015);

module.exports = esModules;

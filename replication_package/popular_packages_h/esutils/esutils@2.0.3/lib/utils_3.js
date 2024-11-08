'use strict';

const astModule = require('./ast');
const codeModule = require('./code');
const keywordModule = require('./keyword');

module.exports = {
    ast: astModule,
    code: codeModule,
    keyword: keywordModule
};

const parse = require('./parse');
const stringify = require('./stringify');

const JSON5 = {
    parse: parse,
    stringify: stringify,
};

module.exports = JSON5;

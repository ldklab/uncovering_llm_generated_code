const parseFunction = require('./parse');
const stringifyFunction = require('./stringify');

const JSON5Module = {
    parse: parseFunction,
    stringify: stringifyFunction,
};

module.exports = JSON5Module;

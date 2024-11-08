const parseFunction = require('./parse');
const stringifyFunction = require('./stringify');

const json5Module = {
    parse: parseFunction,
    stringify: stringifyFunction,
};

module.exports = json5Module;

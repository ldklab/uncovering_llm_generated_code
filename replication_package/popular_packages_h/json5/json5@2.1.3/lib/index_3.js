const parseFunction = require('./parse');
const stringifyFunction = require('./stringify');

const JSON5Utilities = {
    parse: parseFunction,
    stringify: stringifyFunction
};

module.exports = JSON5Utilities;

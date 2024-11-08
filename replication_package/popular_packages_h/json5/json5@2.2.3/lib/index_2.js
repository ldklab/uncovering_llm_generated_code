const parse = require('./parse');
const stringify = require('./stringify');

class JSON5 {
    static parse(...args) {
        return parse(...args);
    }

    static stringify(...args) {
        return stringify(...args);
    }
}

module.exports = JSON5;

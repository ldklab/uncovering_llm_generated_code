// qs.js - A minimalist implementation of `qs` functionalities.

class Qs {
    static parse(queryString, options = {}) {
        const result = {};
        const { delimiter = '&', depth = 5, allowDots = false } = options;
        const keyValuePairs = queryString.replace(/^\?/, '').split(delimiter);
        
        for (const pair of keyValuePairs) {
            const [key, value = ''] = pair.split('=').map(decodeURIComponent);
            this.setNestedObject(result, key, value, { depth, allowDots });
        }
        
        return result;
    }

    static stringify(obj, options = {}) {
        const { delimiter = '&', allowDots = false } = options;
        return Object.entries(obj)
            .map(([key, value]) => this.encodeKeyValue(key, value, { allowDots }))
            .join(delimiter);
    }

    static setNestedObject(obj, path, value, { depth, allowDots }) {
        const keys = allowDots ? path.split('.') : path.split('[').map(k => k.replace(/]$/, ''));
        if (keys.length > depth) keys.length = depth;
        
        let currentLevel = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const currentKey = keys[i] || Object.keys(currentLevel).length;
            currentLevel = currentLevel[currentKey] = currentLevel[currentKey] || {};
        }
        currentLevel[keys[keys.length - 1]] = value;
    }

    static encodeKeyValue(key, value, { allowDots }) {
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value)
                .map(([subKey, subVal]) => this.encodeKeyValue(`${key}${allowDots ? '.' : '['}${subKey}${allowDots ? '' : ']'}`, subVal, { allowDots }))
                .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
}

module.exports = Qs;

// Testing the parsing and stringifying functionality
const qs = require('./qs');
const assert = require('assert');

const parsedObj = qs.parse('a=c');
assert.deepEqual(parsedObj, { a: 'c' });

const queryStr = qs.stringify(parsedObj);
assert.equal(queryStr, 'a=c');

assert.deepEqual(qs.parse('foo[bar]=baz'), { foo: { bar: 'baz' } });
assert.deepEqual(qs.parse('a%5Bb%5D=c'), { a: { b: 'c' } });

assert.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');
assert.equal(qs.stringify({ a: { b: 'c' } }, { allowDots: true }), 'a.b=c');

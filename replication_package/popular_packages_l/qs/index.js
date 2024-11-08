// qs.js - A minimalist implementation of `qs` functionalities.
class Qs {
    static parse(str, options = {}) {
        const obj = {};
        const { delimiter = '&', depth = 5, allowDots = false } = options;
        const pairs = str.replace(/^\?/, '').split(delimiter);
        
        for (const pair of pairs) {
            const [key, val = ''] = pair.split('=').map(decodeURIComponent);
            this._set(obj, key, val, { depth, allowDots });
        }
        
        return obj;
    }

    static stringify(obj, options = {}) {
        const { delimiter = '&', allowDots = false } = options;
        return Object.entries(obj)
            .map(([key, val]) => this._encode(key, val, { allowDots }))
            .join(delimiter);
    }

    static _set(obj, path, value, { depth, allowDots }) {
        const keys = allowDots ? path.split('.') : path.split('[').map(k => k.replace(/]$/, ''));
        if (keys.length > depth) keys.length = depth;

        let nested = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i] || Object.keys(nested).length;
            nested = nested[key] = nested[key] || {};
        }
        nested[keys[keys.length - 1]] = value;
    }

    static _encode(key, value, { allowDots }) {
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value)
                .map(([subKey, subVal]) => this._encode(`${key}${allowDots ? '.' : '['}${subKey}${allowDots ? '' : ']'}`, subVal, { allowDots }))
                .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
}

module.exports = Qs;

// Testing the parsing and stringifying functionality
const qs = require('./qs');
const assert = require('assert');

const obj = qs.parse('a=c');
assert.deepEqual(obj, { a: 'c' });

const str = qs.stringify(obj);
assert.equal(str, 'a=c');

assert.deepEqual(qs.parse('foo[bar]=baz'), { foo: { bar: 'baz' } });
assert.deepEqual(qs.parse('a%5Bb%5D=c'), { a: { b: 'c' } });

assert.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');
assert.equal(qs.stringify({ a: { b: 'c' } }, { allowDots: true }), 'a.b=c');

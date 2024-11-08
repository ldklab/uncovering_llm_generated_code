'use strict';

const GetIntrinsic = require('get-intrinsic');
const gPO = require('reflect.getprototypeof');
const hasSymbols = require('has-symbols');
const define = require('define-properties');
const setFunctionName = require('set-function-name');

const arrayIterProto = GetIntrinsic('%ArrayIteratorPrototype%', true);

const iterProto = arrayIterProto && gPO(arrayIterProto);

const result = (iterProto !== Object.prototype && iterProto) || {};

if (hasSymbols()) {
    const defined = {};
    const predicates = {};
    const trueThunk = () => true;

    if (!(Symbol.iterator in result)) {
        defined[Symbol.iterator] = setFunctionName(function SymbolIterator() {
            return this;
        }, '[Symbol.iterator]', true);

        predicates[Symbol.iterator] = trueThunk;
    }

    define(result, defined, predicates);
}

module.exports = result;

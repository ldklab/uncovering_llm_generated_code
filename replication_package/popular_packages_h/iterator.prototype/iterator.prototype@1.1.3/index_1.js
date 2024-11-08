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
    const definedProperties = {};
    const predicates = {};
    const returnTrue = () => true;

    if (!(Symbol.iterator in result)) {
        definedProperties[Symbol.iterator] = setFunctionName(function SymbolIterator() {
            return this;
        }, '[Symbol.iterator]', true);

        predicates[Symbol.iterator] = returnTrue;
    }

    define(result, definedProperties, predicates);
}

module.exports = result;

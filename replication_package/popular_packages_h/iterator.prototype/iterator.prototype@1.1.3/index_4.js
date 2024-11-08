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
  
  if (!(Symbol.iterator in result)) {
    defined[Symbol.iterator] = setFunctionName(function iterator() {
      return this;
    }, '[Symbol.iterator]', true);
  
    predicates[Symbol.iterator] = () => true;
  }
  
  define(result, defined, predicates);
}

module.exports = result;

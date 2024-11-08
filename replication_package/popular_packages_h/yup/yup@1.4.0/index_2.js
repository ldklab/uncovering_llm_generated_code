'use strict';

const propertyExpr = require('property-expr');
const tinyCase = require('tiny-case');
const toposort = require('toposort');
const { assign, create, join, normalizePath, split, getter } = propertyExpr;

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
const toString = Object.prototype.toString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
const symbolToString = Symbol ? Symbol.prototype.toString : () => '';

function printNumber(val) {
  if (val != +val) return 'NaN';
  const isNegativeZero = val === 0 && 1 / val < 0;
  return isNegativeZero ? '-0' : '' + val;
}

function printSimpleValue(val, quoteStrings = false) {
  if (val == null || val === true || val === false) return '' + val;
  const typeOf = typeof val;
  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'string') return quoteStrings ? `"${val}"` : val;
  if (typeOf === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
  if (typeOf === 'symbol') return symbolToString.call(val).replace(SYMBOL_REGEXP, 'Symbol($1)');

  const tag = toString.call(val).slice(8, -1);
  if (tag === 'Date') return isNaN(val.getTime()) ? '' + val : val.toISOString(val);
  if (tag === 'Error' || val instanceof Error) return '[' + errorToString.call(val) + ']';
  if (tag === 'RegExp') return regExpToString.call(val);
  return null;
}

function printValue(value, quoteStrings) {
  const result = printSimpleValue(value, quoteStrings);
  return result !== null ? result : JSON.stringify(value, (key, value) => {
    const result = printSimpleValue(this[key], quoteStrings);
    return result !== null ? result : value;
  }, 2);
}

function toArray(value) {
  return value == null ? [] : [].concat(value);
}

// ValidationErrorNoStack and ValidationError classes implementation

// Schema classes such as MixedSchema, BooleanSchema, StringSchema, NumberSchema, DateSchema, ObjectSchema, ArraySchema, TupleSchema, and Lazy

const isSchema = obj => obj && obj.__isYupSchema__;

exports.mixed = createMixedSchema;
exports.string = createStringSchema;
exports.number = createNumberSchema;
exports.boolean = createBooleanSchema;
exports.date = createDateSchema;
exports.array = createArraySchema;
exports.object = createObjectSchema;
exports.lazy = createLazySchema;
exports.addMethod = addMethod;
exports.setLocale = setLocale;
exports.ValidationError = ValidationError;
exports.Schema = Schema;

function createMixedSchema() {
  return new MixedSchema();
}

function createStringSchema() {
  return new StringSchema();
}

function createNumberSchema() {
  return new NumberSchema();
}

function createBooleanSchema() {
  return new BooleanSchema();
}

function createDateSchema() {
  return new DateSchema();
}

function createArraySchema(type) {
  return new ArraySchema(type);
}

function createObjectSchema(spec) {
  return new ObjectSchema(spec);
}

function createLazySchema(builder) {
  return new Lazy(builder);
}

function addMethod(schemaType, name, fn) {
  if (!schemaType || !isSchema(schemaType.prototype)) throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string') throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function') throw new TypeError('Method function must be provided');
  schemaType.prototype[name] = fn;
}

function setLocale(custom) {
  for (const type in custom) {
    if (custom.hasOwnProperty(type)) {
      for (const method in custom[type]) {
        if (custom[type].hasOwnProperty(method)) {
          locale[type][method] = custom[type][method];
        }
      }
    }
  }
}

// Implementations of remaining utility functions and classes like getIn, reach, etc.

// Export schema classes and utilities

"use strict";

const { create: createMixed, default: MixedSchema } = require('./mixed');
const { create: createBoolean, default: _BooleanSchema } = require('./boolean');
const { create: createString, default: _StringSchema } = require('./string');
const { create: createNumber, default: _NumberSchema } = require('./number');
const { create: createDate, default: _DateSchema } = require('./date');
const { create: createObject, default: _ObjectSchema } = require('./object');
const { create: createArray, default: _ArraySchema } = require('./array');
const { create: createRef } = require('./Reference');
const { create: createLazy } = require('./Lazy');
const _ValidationError = require('./ValidationError').default;
const _reach = require('./util/reach').default;
const _isSchema = require('./util/isSchema').default;
const _setLocale = require('./setLocale').default;
const _BaseSchema = require('./schema').default;

function addMethod(schemaType, name, fn) {
  if (!schemaType || !_isSchema(schemaType.prototype)) {
    throw new TypeError('You must provide a yup schema constructor function');
  }
  if (typeof name !== 'string') {
    throw new TypeError('A Method name must be provided');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Method function must be provided');
  }
  schemaType.prototype[name] = fn;
}

module.exports = {
  addMethod,
  MixedSchema,
  mixed: createMixed,
  BooleanSchema: _BooleanSchema,
  bool: createBoolean,
  boolean: createBoolean,
  StringSchema: _StringSchema,
  string: createString,
  NumberSchema: _NumberSchema,
  number: createNumber,
  DateSchema: _DateSchema,
  date: createDate,
  ObjectSchema: _ObjectSchema,
  object: createObject,
  ArraySchema: _ArraySchema,
  array: createArray,
  ref: createRef,
  lazy: createLazy,
  ValidationError: _ValidationError,
  reach: _reach,
  isSchema: _isSchema,
  setLocale: _setLocale,
  BaseSchema: _BaseSchema,
};

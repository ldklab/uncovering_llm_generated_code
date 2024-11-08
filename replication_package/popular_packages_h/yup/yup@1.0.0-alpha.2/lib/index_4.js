"use strict";

const { default: mixed, create: createMixed } = require("./mixed");
const { default: boolean, create: createBoolean } = require("./boolean");
const { default: string, create: createString } = require("./string");
const { default: number, create: createNumber } = require("./number");
const { default: date, create: createDate } = require("./date");
const { default: object, create: createObject } = require("./object");
const { default: array, create: createArray } = require("./array");
const { create: createRef } = require("./Reference");
const { create: createLazy } = require("./Lazy");
const ValidationError = require("./ValidationError").default;
const reach = require("./util/reach").default;
const isSchema = require("./util/isSchema").default;
const setLocale = require("./setLocale").default;
const BaseSchema = require("./schema").default;

function addMethod(schemaType, name, fn) {
  if (!schemaType || !isSchema(schemaType.prototype)) 
    throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string') 
    throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function') 
    throw new TypeError('Method function must be provided');
  schemaType.prototype[name] = fn;
}

module.exports = {
  addMethod,
  MixedSchema: mixed,
  mixed: createMixed,
  BooleanSchema: boolean,
  bool: createBoolean,
  boolean: createBoolean,
  StringSchema: string,
  string: createString,
  NumberSchema: number,
  number: createNumber,
  DateSchema: date,
  date: createDate,
  ObjectSchema: object,
  object: createObject,
  ArraySchema: array,
  array: createArray,
  ref: createRef,
  lazy: createLazy,
  ValidationError,
  reach,
  isSchema,
  setLocale,
  BaseSchema
};

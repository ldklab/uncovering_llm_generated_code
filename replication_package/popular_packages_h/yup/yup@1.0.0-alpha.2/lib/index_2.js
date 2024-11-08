"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.addMethod = addMethod;

const schemaModules = {
  MixedSchema: './mixed',
  mixed: './mixed',
  BooleanSchema: './boolean',
  bool: './boolean',
  boolean: './boolean',
  StringSchema: './string',
  string: './string',
  NumberSchema: './number',
  number: './number',
  DateSchema: './date',
  date: './date',
  ObjectSchema: './object',
  object: './object',
  ArraySchema: './array',
  array: './array',
  ref: './Reference',
  lazy: './Lazy',
  ValidationError: './ValidationError',
  reach: './util/reach',
  isSchema: './util/isSchema',
  setLocale: './setLocale',
  BaseSchema: './schema'
};

Object.entries(schemaModules).forEach(([key, modulePath]) => {
  const module = require(modulePath);
  let value = key === 'mixed' || key === 'boolean' || key === 'bool' || key === 'string' ||
              key === 'number' || key === 'date' || key === 'object' || key === 'array' || 
              key === 'ref' || key === 'lazy' ? module.create : module.default;

  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return value;
    }
  });
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function addMethod(schemaType, name, fn) {
  const isSchema = require('./util/isSchema').default;
  if (!schemaType || !isSchema(schemaType.prototype)) {
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

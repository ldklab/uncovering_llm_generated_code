"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.addMethod = addMethod;

// Schema exports
const schemaExports = [
  { name: "MixedSchema", module: "mixed", method: "default" },
  { name: "mixed", module: "mixed", method: "create" },
  { name: "BooleanSchema", module: "boolean", method: "default" },
  { name: "bool", module: "boolean", method: "create" },
  { name: "boolean", module: "boolean", method: "create" },
  { name: "StringSchema", module: "string", method: "default" },
  { name: "string", module: "string", method: "create" },
  { name: "NumberSchema", module: "number", method: "default" },
  { name: "number", module: "number", method: "create" },
  { name: "DateSchema", module: "date", method: "default" },
  { name: "date", module: "date", method: "create" },
  { name: "ObjectSchema", module: "object", method: "default" },
  { name: "object", module: "object", method: "create" },
  { name: "ArraySchema", module: "array", method: "default" },
  { name: "array", module: "array", method: "create" }
];

// Require and export schemas
schemaExports.forEach(({ name, module, method }) => {
  const mod = require(`./${module}`);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: function () {
      return mod[method];
    }
  });
});

// Additional exports
const additionalExports = [
  { name: "ref", module: "Reference", method: "create" },
  { name: "lazy", module: "Lazy", method: "create" },
  { name: "ValidationError", module: "ValidationError", method: "default" },
  { name: "reach", module: "util/reach", method: "default" },
  { name: "isSchema", module: "util/isSchema", method: "default" },
  { name: "setLocale", module: "setLocale", method: "default" },
  { name: "BaseSchema", module: "schema", method: "default" }
];

// Require and export additional functionalities
additionalExports.forEach(({ name, module, method }) => {
  const mod = require(`./${module}`);
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: function () {
      return mod[method];
    }
  });
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function addMethod(schemaType, name, fn) {
  if (!schemaType || !require('./util/isSchema').default(schemaType.prototype)) 
    throw new TypeError('You must provide a yup schema constructor function');
  if (typeof name !== 'string') 
    throw new TypeError('A Method name must be provided');
  if (typeof fn !== 'function') 
    throw new TypeError('Method function must be provided');
    
  schemaType.prototype[name] = fn;
}

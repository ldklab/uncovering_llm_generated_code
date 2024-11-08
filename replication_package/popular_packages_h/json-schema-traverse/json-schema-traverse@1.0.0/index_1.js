'use strict';

module.exports = function traverse(schema, opts, callback) {
  // Handle legacy support
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  callback = opts.cb || callback;
  const pre = typeof callback === 'function' ? callback : callback.pre || function () {};
  const post = callback.post || function () {};

  _traverseSchema(opts, pre, post, schema, '', schema);
};

const keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true
};

const arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};

const propsKeywords = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};

const skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};

function _traverseSchema(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (const key in schema) {
      const subSchema = schema[key];
      if (Array.isArray(subSchema)) {
        if (key in arrayKeywords) {
          subSchema.forEach((item, index) => {
            _traverseSchema(opts, pre, post, item, `${jsonPtr}/${key}/${index}`, rootSchema, jsonPtr, key, schema, index);
          });
        }
      } else if (key in propsKeywords) {
        if (subSchema && typeof subSchema === 'object') {
          for (const prop in subSchema) {
            _traverseSchema(opts, pre, post, subSchema[prop], `${jsonPtr}/${key}/${escapeJsonRef(prop)}`, rootSchema, jsonPtr, key, schema, prop);
          }
        }
      } else if (key in keywords || (opts.allKeys && !(key in skipKeywords))) {
        _traverseSchema(opts, pre, post, subSchema, `${jsonPtr}/${key}`, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}

function escapeJsonRef(string) {
  return string.replace(/~/g, '~0').replace(/\//g, '~1');
}

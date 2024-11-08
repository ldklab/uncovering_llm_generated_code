// json-schema-traverse.js

function traverse(schema, options) {
  const { cb, allKeys } = options;
  const pre = typeof cb === 'function' ? cb : cb.pre;
  const post = cb.post;

  function _traverse(subSchema, jsonPtr = '', parentJsonPtr = '', parentKeyword, parentSchema, keyIndex) {
    const currentPtr = jsonPtr;

    // Call pre callback if specified conditions are met
    if (
      allKeys ||
      (subSchema && typeof subSchema === 'object' && (subSchema.hasOwnProperty('properties') || subSchema.hasOwnProperty('items')))
    ) {
      if (pre) {
        pre(subSchema, currentPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }

      // Recursively traverse each key in the current schema node
      for (const key in subSchema) {
        const nextSubSchema = subSchema[key];
        if (nextSubSchema && typeof nextSubSchema === 'object') {
          const nextJsonPtr = `${jsonPtr}/${key}`;
          _traverse(nextSubSchema, nextJsonPtr, jsonPtr, key, subSchema, key);
        }
      }

      // Call post callback after children have been traversed
      if (post) {
        post(subSchema, currentPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
  }

  const rootSchema = schema;
  _traverse(schema);
}

module.exports = traverse;

// Usage example:

const traverse = require('./json-schema-traverse');

const schemaExample = {
  properties: {
    foo: { type: 'string' },
    bar: { type: 'integer' },
  },
};

const cb = {
  pre: (schema) => console.log('Pre:', schema),
  post: (schema) => console.log('Post:', schema),
};

traverse(schemaExample, { cb });

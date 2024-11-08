// json-schema-traverse.js

function traverse(schema, options) {
  const { cb, allKeys } = options;
  const pre = typeof cb === 'function' ? cb : cb.pre;
  const post = cb.post;

  function _traverse(schema, jsonPtr = '', parentJsonPtr = '', parentKeyword, parentSchema, keyIndex) {
    if (allKeys || (schema && typeof schema === 'object' && (schema.properties || schema.items))) {
      if (pre) pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);

      Object.keys(schema).forEach(key => {
        const subschema = schema[key];
        if (subschema && typeof subschema === 'object') {
          _traverse(subschema, `${jsonPtr}/${key}`, jsonPtr, key, schema, key);
        }
      });

      if (post) post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
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
    bar: { type: 'integer' }
  }
};

const cb = {
  pre: (schema) => console.log("Pre:", schema),
  post: (schema) => console.log("Post:", schema)
};

traverse(schemaExample, { cb });

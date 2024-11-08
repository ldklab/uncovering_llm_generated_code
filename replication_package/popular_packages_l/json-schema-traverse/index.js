// json-schema-traverse.js

function traverse(schema, options) {
  const { cb, allKeys } = options;
  const pre = (typeof cb === 'function') ? cb : cb.pre;
  const post = cb.post;

  function _traverse(schema, jsonPtr = '', parentJsonPtr = '', parentKeyword, parentSchema, keyIndex) {
    let currentPtr = jsonPtr;
    
    if (allKeys || (schema && typeof schema === 'object' && (schema.hasOwnProperty('properties') || schema.hasOwnProperty('items')))) {
      if (pre) pre(schema, currentPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    
      for (const key in schema) {
        const subschema = schema[key];
        if (subschema && typeof subschema === 'object') {
          const currentJsonPtr = `${jsonPtr}/${key}`;
          _traverse(subschema, currentJsonPtr, jsonPtr, key, schema, key);
        }
      }
      
      if (post) post(schema, currentPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    }
  }
  
  const rootSchema = schema;
  _traverse(schema, '', '', null, null, null);
}

module.exports = traverse;

// Usage example:

const traverse = require('./json-schema-traverse');

const schemaExample = {
  properties: {
    foo: {type: 'string'},
    bar: {type: 'integer'}
  }
};

const cb = {
  pre: (schema) => console.log("Pre:", schema),
  post: (schema) => console.log("Post:", schema)
};

traverse(schemaExample, {cb});

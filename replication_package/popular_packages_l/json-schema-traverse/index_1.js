// json-schema-traverse.js

function traverse(schema, options) {
  const { cb, allKeys } = options;
  const preTraversal = typeof cb === 'function' ? cb : cb.pre;
  const postTraversal = cb.post;

  function _traverse(currentSchema, currentPointer = '', parentPointer = '', parentKeyword, parentSchema, keyIndex) {
    const shouldTraverseChildren = 
      allKeys || 
      (currentSchema && typeof currentSchema === 'object' && (currentSchema.properties || currentSchema.items));

    if (shouldTraverseChildren) {
      if (preTraversal) preTraversal(currentSchema, currentPointer, rootSchema, parentPointer, parentKeyword, parentSchema, keyIndex);

      Object.entries(currentSchema).forEach(([key, subschema]) => {
        if (subschema && typeof subschema === 'object') {
          const newJsonPointer = `${currentPointer}/${key}`;
          _traverse(subschema, newJsonPointer, currentPointer, key, currentSchema, key);
        }
      });
      
      if (postTraversal) postTraversal(currentSchema, currentPointer, rootSchema, parentPointer, parentKeyword, parentSchema, keyIndex);
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
    foo: { type: 'string' },
    bar: { type: 'integer' }
  }
};

const callbackFunctions = {
  pre: (schema) => console.log("Pre:", schema),
  post: (schema) => console.log("Post:", schema)
};

traverse(schemaExample, { cb: callbackFunctions });

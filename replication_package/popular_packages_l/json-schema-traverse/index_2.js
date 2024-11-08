// json-schema-traverse.js

function traverse(schema, options) {
  const { cb, allKeys } = options;
  const preCallback = (typeof cb === 'function') ? cb : cb.pre;
  const postCallback = cb.post;
  const rootSchema = schema;

  function recursiveTraverse(currentSchema, jsonPtr = '', parentJsonPtr = '', parentKeyword, parentSchema, keyIndex) {
    const currentPointer = jsonPtr;
    
    if (allKeys || (currentSchema && typeof currentSchema === 'object' && (currentSchema.hasOwnProperty('properties') || currentSchema.hasOwnProperty('items')))) {
      if (preCallback) preCallback(currentSchema, currentPointer, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    
      for (const key in currentSchema) {
        const subSchema = currentSchema[key];
        if (subSchema && typeof subSchema === 'object') {
          const subPointer = `${jsonPtr}/${key}`;
          recursiveTraverse(subSchema, subPointer, jsonPtr, key, currentSchema, key);
        }
      }
      
      if (postCallback) postCallback(currentSchema, currentPointer, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    }
  }
  
  recursiveTraverse(schema, '', '', null, null, null);
}

module.exports = traverse;

// Usage example:

const traverse = require('./json-schema-traverse');

const exampleSchema = {
  properties: {
    foo: { type: 'string' },
    bar: { type: 'integer' }
  }
};

const callbackFunctions = {
  pre: schema => console.log("Pre:", schema),
  post: schema => console.log("Post:", schema)
};

traverse(exampleSchema, { cb: callbackFunctions });

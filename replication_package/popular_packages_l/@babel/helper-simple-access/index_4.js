// index.js

const babel = require("@babel/core");

function ensureSimpleAccess(ast) {
  const simpleAccessTransformer = {
    MemberExpression(path) {
      // Check if the property access is simple (a direct property access)
      if (!path.node.computed && !path.node.optional) {
        return; // If it's already simple, do nothing
      }

      const { object, property } = path.node;
      
      // Transform to a simple access if it's a computed access with a string literal
      if (path.node.computed && property.type === 'StringLiteral') {
        path.replaceWith({
          ...path.node,
          computed: false,
          property: {
            ...property,
            type: 'Identifier',
            name: property.value, // Use the string value as the identifier name
          }
        });
      }

      // Additional transformations can be added here as needed
    },
  };

  // Traverse the AST using Babel's traversal utility and apply the transformer
  babel.traverse(ast, simpleAccessTransformer);

  return ast; // Return the transformed AST
}

module.exports = ensureSimpleAccess;

// package.json

{
  "name": "@babel/helper-simple-access",
  "version": "1.0.0",
  "description": "Babel helper for ensuring that access to a given value is performed through simple accesses",
  "main": "index.js",
  "keywords": [
    "babel",
    "helper",
    "simple",
    "access"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@babel/core": "^7.x.x"
  }
}

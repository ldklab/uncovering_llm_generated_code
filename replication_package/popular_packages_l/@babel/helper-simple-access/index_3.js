// index.js

const babel = require("@babel/core");

// Function that ensures all property accesses in an AST are simple accesses
module.exports = function ensureSimpleAccess(ast) {
  // Define a visitor to transform MemberExpressions in the AST
  const simpleAccessTransformer = {
    MemberExpression(path) {
      // Direct accesses are already simple, skip them
      if (!path.node.computed && !path.node.optional) {
        return;
      }

      // Attempt to simplify computed accesses using string literals
      const { object, property } = path.node;
      if (path.node.computed && property.type === 'StringLiteral') {
        path.replaceWith({
          ...path.node, // Clone existing node
          computed: false, // Ensure access is not computed
          property: { // Transform property to an identifier
            ...property,
            type: 'Identifier',
            name: property.value,
          }
        });
      }
      // Additional transformations can be added as needed here
    },
  };

  // Traverse the AST and apply the transformations
  babel.traverse(ast, simpleAccessTransformer);

  return ast; // Return the modified AST
};

// Example for usage:
//
// const ast = parse(`const obj = { a: 1 }; console.log(obj["a"]);`);
// const newAst = ensureSimpleAccess(ast);
// const { code } = generate(newAst);
// console.log(code); // Output should be: `const obj = { a: 1 }; console.log(obj.a);`
//
// Note: This code requires a context with Babel's parsing and code generation capabilities.

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

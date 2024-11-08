markdown
// index.js

module.exports = function ensureSimpleAccess(ast) {
  const simpleAccessTransformer = {
    MemberExpression(path) {
      // Check if the property access is simple (a direct property access)
      if (!path.node.computed && !path.node.optional) {
        // Access is already simple, do nothing
        return;
      }

      // Transform to a simple access if possible
      const { object, property } = path.node;
      if (path.node.computed && property.type === 'StringLiteral') {
        path.replaceWith({
          ...path.node,
          computed: false,
          property: {
            ...property,
            type: 'Identifier',
            name: property.value,
          }
        });
      }
      
      // Further transformations can be added here as needed
    },
  };

  // The function accepts an AST and uses a simple visitor to ensure simple accesses
  const babel = require("@babel/core");
  babel.traverse(ast, simpleAccessTransformer);

  return ast;
};

// Example usage:
// const ast = parse(`const obj = { a: 1 }; console.log(obj["a"]);`);
// const newAst = ensureSimpleAccess(ast);
// const { code } = generate(newAst);
// console.log(code); // Should log: `const obj = { a: 1 }; console.log(obj.a);`

// This code assumes a context where the Babel API is used to parse and generate code.
// You will need "@babel/core" and other Babel packages to actually parse and generate code.

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

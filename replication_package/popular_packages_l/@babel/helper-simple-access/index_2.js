// ensureSimpleAccess.js

const babel = require("@babel/core");

/**
 * Ensures that property accesses within the given AST are simple.
 * Converts computed property accesses with string literals to static property accesses.
 * 
 * @param {Object} ast - The abstract syntax tree to transform.
 * @returns {Object} - The transformed abstract syntax tree with simple accesses.
 */
function ensureSimpleAccess(ast) {
  const simpleAccessTransformer = {
    MemberExpression(path) {
      // Convert accesses of the form obj["prop"] to obj.prop
      if (path.node.computed && path.node.property.type === 'StringLiteral') {
        path.replaceWith({
          ...path.node,
          computed: false,
          property: {
            ...path.node.property,
            type: 'Identifier',
            name: path.node.property.value,
          },
        });
      }
    },
  };

  babel.traverse(ast, simpleAccessTransformer);
  return ast;
}

module.exports = ensureSimpleAccess;

// Example of transforming an AST
// const { parse } = require("@babel/parser");
// const { generate } = require("@babel/generator");

// const ast = parse(`const obj = { a: 1 }; console.log(obj["a"]);`);
// const newAst = ensureSimpleAccess(ast);
// const { code } = generate(newAst);
// console.log(code); // Outputs: const obj = { a: 1 }; console.log(obj.a);

// This script uses Babel to parse, transform, and generate JavaScript code.
// It requires "@babel/core", "@babel/parser", and "@babel/generator" packages.

// package.json

{
  "name": "@babel/helper-simple-access",
  "version": "1.0.0",
  "description": "Babel helper for ensuring that access to a given value is performed through simple accesses",
  "main": "ensureSimpleAccess.js",
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

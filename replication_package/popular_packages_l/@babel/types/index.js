// package.json
{
  "name": "babel-types-example",
  "version": "1.0.0",
  "description": "A simple example using @babel/types to manipulate AST nodes",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "devDependencies": {
    "@babel/types": "^7.0.0"
  }
}

// index.js
const babelTypes = require('@babel/types');

// Define a simple code transformation utility
function createVariableDeclaration(variableName, value) {
  const identifier = babelTypes.identifier(variableName);
  const numericLiteral = babelTypes.numericLiteral(value);
  const variableDeclarator = babelTypes.variableDeclarator(identifier, numericLiteral);
  return babelTypes.variableDeclaration('let', [variableDeclarator]);
}

// Demonstrate creating an AST node for `let x = 10;`
const astNode = createVariableDeclaration('x', 10);
console.log(JSON.stringify(astNode, null, 2));

// Output the generated code as a string (just illustrative, as @babel/generator is needed for full code generation)
console.log('AST Node:', astNode.type);

// To transpile or generate code from this AST you would typically use additional packages like @babel/generator
// This package does not provide code generation functionality by itself

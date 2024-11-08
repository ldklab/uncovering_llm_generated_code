// index.js

class SimpleCodeGenerator {
  constructor(ast) {
    // Store the abstract syntax tree (AST)
    this.ast = ast;
  }

  generate() {
    // Generate code from the AST
    return this._generateNode(this.ast);
  }

  _generateNode(node) {
    // Recurse and process AST nodes based on their type
    switch (node.type) {
      case 'Program':
        // Concatenate results of code generation for each body element, separated by new lines
        return node.body.map(n => this._generateNode(n)).join('\n');
      case 'ExpressionStatement':
        // Generate code for expressions and append semicolon
        return `${this._generateNode(node.expression)};`;
      case 'CallExpression':
        // Generate code for function calls
        const callee = this._generateNode(node.callee);
        const args = node.arguments.map(arg => this._generateNode(arg)).join(', ');
        return `${callee}(${args})`;
      case 'Identifier':
        // Return the identifier name
        return node.name;
      case 'Literal':
        // Return the literal value, wrapped in quotes if it is a string
        return typeof node.value === 'string' ? `"${node.value}"` : node.value;
      default:
        // Throw an error for unsupported node types
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}

// Example usage
const ast = {
  type: 'Program',
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'console.log'
        },
        arguments: [
          {
            type: 'Literal',
            value: 'Hello, world!'
          }
        ]
      }
    }
  ]
};

// Instantiate the code generator with the AST and generate code
const generator = new SimpleCodeGenerator(ast);
const code = generator.generate();
console.log(code); // Console output: console.log("Hello, world!");

// Export the SimpleCodeGenerator class for use in other modules
module.exports = SimpleCodeGenerator;

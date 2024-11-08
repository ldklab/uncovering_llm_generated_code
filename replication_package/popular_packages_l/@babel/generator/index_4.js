// index.js

class SimpleCodeGenerator {
  constructor(ast) {
    this.ast = ast;
  }

  generate() {
    return this._generateNode(this.ast);
  }

  _generateNode(node) {
    switch (node.type) {
      case 'Program':
        return node.body.map(n => this._generateNode(n)).join('\n');
      case 'ExpressionStatement':
        return `${this._generateNode(node.expression)};`;
      case 'CallExpression':
        return `${this._generateNode(node.callee)}(${node.arguments.map(arg => this._generateNode(arg)).join(', ')})`;
      case 'Identifier':
        return node.name;
      case 'Literal':
        return typeof node.value === 'string' ? `"${node.value}"` : node.value;
      default:
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

const generator = new SimpleCodeGenerator(ast);
const code = generator.generate();
console.log(code); // Output: console.log("Hello, world!");

module.exports = SimpleCodeGenerator;

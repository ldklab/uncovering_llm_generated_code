// index.js

class CodeGenerator {
  constructor(ast) {
    this.ast = ast;
  }

  generate() {
    return this.traverseNode(this.ast);
  }

  traverseNode(node) {
    switch (node.type) {
      case 'Program':
        return node.body.map(n => this.traverseNode(n)).join('\n');
      case 'ExpressionStatement':
        return `${this.traverseNode(node.expression)};`;
      case 'CallExpression':
        const functionName = this.traverseNode(node.callee);
        const parameters = node.arguments.map(arg => this.traverseNode(arg)).join(', ');
        return `${functionName}(${parameters})`;
      case 'Identifier':
        return node.name;
      case 'Literal':
        return typeof node.value === 'string' ? `"${node.value}"` : node.value;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }
}

// Example usage
const astExample = {
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

const codeGen = new CodeGenerator(astExample);
const generatedCode = codeGen.generate();
console.log(generatedCode); // Output: console.log("Hello, world!");

module.exports = CodeGenerator;

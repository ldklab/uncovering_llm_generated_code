// package.json
{
  "name": "babel-traverse-sim",
  "version": "1.0.0",
  "description": "A simplified Node.js package simulating Babel Traverse functionality",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "babylon": "^7.0.0-beta.44"
  }
}

// index.js
const babylon = require('babylon');

class NodePath {
  constructor(node) {
    this.node = node;
  }

  replaceWith(newNode) {
    Object.assign(this.node, newNode);
  }

  remove() {
    delete this.node.type;
  }

  insertAfter(newNode) {
    if (this.node.body && Array.isArray(this.node.body)) {
      this.node.body.push(newNode);
    }
  }
}

function traverse(ast, visitor) {
  function visit(node) {
    if (!node) return;
    const nodePath = new NodePath(node);

    if (visitor[node.type]) {
      visitor[node.type](nodePath);
    }

    for (let key in node) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(n => visit(n));
      } else if (typeof child === 'object' && child !== null) {
        visit(child);
      }
    }
  }

  visit(ast);
}

module.exports = {
  traverse
};

// test.js
const { traverse } = require('./index');
const babylon = require('babylon');

const code = `function square(n) { return n * n; }`;
const ast = babylon.parse(code, { sourceType: 'module' });

traverse(ast, {
  FunctionDeclaration(path) {
    console.log('Found a FunctionDeclaration');
    const newNode = {
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'cube' },
      params: [{ type: 'Identifier', name: 'x' }],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'x' } }
        }]
      }
    };
    path.replaceWith(newNode);
  }
});

console.log(JSON.stringify(ast, null, 2));

const esprima = require('esprima');
const escodegen = require('escodegen');
const sourceMap = require('source-map');

class Recast {
  static parse(source, options = {}) {
    const ast = esprima.parseModule(source, options);
    this._annotateOriginal(ast);
    return ast;
  }

  static print(ast, options = {}) {
    const code = escodegen.generate(ast, options);
    return { code };
  }

  static prettyPrint(ast, options = {}) {
    options.format = options.format || {};
    options.format.indent = {
      style: options.tabWidth ? ' '.repeat(options.tabWidth) : '  '
    };
    const code = escodegen.generate(ast, options);
    return { code };
  }

  static _annotateOriginal(ast) {
    const queue = [ast];
    while (queue.length > 0) {
      const node = queue.shift();
      node.original = Object.assign({}, node);
      for (let child in node) {
        if (node[child] && typeof node[child] === 'object') {
          queue.push(node[child]);
        }
      }
    }
  }

  static transform(ast, modifyFn) {
    modifyFn(ast);
  }
}

// Usage Example
const source = `
  function add(a, b) {
    return a +
      // Weird formatting, huh?
      b;
  }
`;

const ast = Recast.parse(source);
Recast.transform(ast, (astNode) => {
  // Assuming modifyFn is a function that modifies the AST
  const n = astNode.body[0];
  const b = escodegen;

  if (n.type === 'FunctionDeclaration') {
    astNode.body[0] = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: n.id,
        init: {
          type: 'FunctionExpression',
          id: null,
          params: n.params,
          body: n.body
        }
      }],
      kind: 'var'
    };
  }
});

const output = Recast.print(ast).code;
console.log(output);


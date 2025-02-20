const esprima = require('esprima');
const escodegen = require('escodegen');

// A Recast class to work with JavaScript source code by parsing into AST,
// pretty printing, transforming, and converting back to source code.
class Recast {

  // Parses JavaScript code into an AST and annotates the original nodes.
  static parse(source, options = {}) {
    const ast = esprima.parseModule(source, options);
    this._annotateOriginal(ast);
    return ast;
  }

  // Generates JavaScript code from AST.
  static print(ast, options = {}) {
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Generates pretty-printed JavaScript code from AST with custom formatting options.
  static prettyPrint(ast, options = {}) {
    options.format = options.format || {};
    options.format.indent = {
      style: options.tabWidth ? ' '.repeat(options.tabWidth) : '  '
    };
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Annotates each node in the AST with its original properties.
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

  // Transforms the AST using a modification function provided by the user.
  static transform(ast, modifyFn) {
    modifyFn(ast);
  }
}

// Example of using the Recast class to transform a function declaration into a variable declaration.
const source = `
  function add(a, b) {
    return a +
      // Weird formatting, huh?
      b;
  }
`;

// Parse the source code into an AST
const ast = Recast.parse(source);

// Transform the AST: convert function declaration into a variable assignment with a function expression
Recast.transform(ast, (astNode) => {
  const functionNode = astNode.body[0];

  if (functionNode.type === 'FunctionDeclaration') {
    astNode.body[0] = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: functionNode.id,
        init: {
          type: 'FunctionExpression',
          id: null,
          params: functionNode.params,
          body: functionNode.body
        }
      }],
      kind: 'var'
    };
  }
});

// Generate and print the transformed JavaScript code from the AST
const output = Recast.print(ast).code;
console.log(output);

const esprima = require('esprima');
const escodegen = require('escodegen');

class Recast {
  // Parses the given JavaScript source code into an AST
  static parse(source, options = {}) {
    // Use esprima to parse the JavaScript module source code
    const ast = esprima.parseModule(source, options);
    // Annotate the AST nodes with their original structure
    this._annotateOriginal(ast);
    return ast;
  }

  // Generates source code from an AST with escodegen
  static print(ast, options = {}) {
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Generates pretty-printed source code from an AST
  static prettyPrint(ast, options = {}) {
    options.format = options.format || {};
    options.format.indent = {
      style: options.tabWidth ? ' '.repeat(options.tabWidth) : '  '
    };
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Annotates each AST node with a copy of its original state
  static _annotateOriginal(ast) {
    const queue = [ast];
    while (queue.length > 0) {
      const node = queue.shift();
      // Copy the current node properties to the 'original' key
      node.original = Object.assign({}, node);
      for (let child in node) {
        if (node[child] && typeof node[child] === 'object') {
          queue.push(node[child]);
        }
      }
    }
  }

  // Transforms an AST by applying a modification function
  static transform(ast, modifyFn) {
    modifyFn(ast);
  }
}

// Usage Example: Parse the source, transform the AST, and print back to code
const source = `
  function add(a, b) {
    return a +
      // Weird formatting, huh?
      b;
  }
`;

// Parse source code to AST
const ast = Recast.parse(source);

// Transform the AST using a custom modification function
Recast.transform(ast, (astNode) => {
  const node = astNode.body[0];

  // Convert a FunctionDeclaration to VarDeclaration and FunctionExpression
  if (node.type === 'FunctionDeclaration') {
    astNode.body[0] = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: node.id,
        init: {
          type: 'FunctionExpression',
          id: null,
          params: node.params,
          body: node.body
        }
      }],
      kind: 'var'
    };
  }
});

// Generate the transformed code and print it
const output = Recast.print(ast).code;
console.log(output);

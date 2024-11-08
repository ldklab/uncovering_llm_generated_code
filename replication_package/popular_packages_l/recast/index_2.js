const esprima = require('esprima');
const escodegen = require('escodegen');

class Recast {
  static parse(source, options = {}) {
    // Parse the source code using esprima to produce an AST
    const ast = esprima.parseModule(source, options);
    // Annotate the AST with original node copies
    this._annotateOriginal(ast);
    return ast;
  }

  static print(ast, options = {}) {
    // Generate source code from AST using escodegen
    const code = escodegen.generate(ast, options);
    return { code };
  }

  static prettyPrint(ast, options = {}) {
    // Provide pretty print formatting with custom tab width
    options.format = options.format || {};
    options.format.indent = {
      style: options.tabWidth ? ' '.repeat(options.tabWidth) : '  '
    };
    const code = escodegen.generate(ast, options);
    return { code };
  }

  static _annotateOriginal(ast) {
    // Annotate each node in the AST with its original copy
    const queue = [ast];
    while (queue.length > 0) {
      const node = queue.shift();
      node.original = { ...node }; // Store a copy of the original node
      for (let child in node) {
        if (node[child] && typeof node[child] === 'object') {
          queue.push(node[child]);
        }
      }
    }
  }

  static transform(ast, modifyFn) {
    // Apply a custom transformation function to the AST
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

// Parse the source code to get the AST
const ast = Recast.parse(source);

// Transform the AST by replacing function declaration with a variable declaration
Recast.transform(ast, (astNode) => {
  const functionDecl = astNode.body[0];

  if (functionDecl.type === 'FunctionDeclaration') {
    astNode.body[0] = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: functionDecl.id,
        init: {
          type: 'FunctionExpression',
          id: null,
          params: functionDecl.params,
          body: functionDecl.body
        }
      }],
      kind: 'var'
    };
  }
});

// Print the transformed AST back to source code
const output = Recast.print(ast).code;
console.log(output);

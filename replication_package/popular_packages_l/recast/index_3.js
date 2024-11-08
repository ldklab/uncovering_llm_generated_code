const esprima = require('esprima');
const escodegen = require('escodegen');

// Recast class responsible for parsing, printing, pretty-printing, and transforming ASTs
class Recast {
  // Parse the source code into an AST and annotate each node with its original state
  static parse(source, options = {}) {
    const ast = esprima.parseModule(source, options);
    this._annotateOriginalAST(ast);
    return ast;
  }

  // Print the code from the AST without formatting
  static print(ast, options = {}) {
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Print the AST with pretty formatting
  static prettyPrint(ast, options = {}) {
    options.format = options.format || {};  // Ensure format option exists
    options.format.indent = {
      style: options.tabWidth ? ' '.repeat(options.tabWidth) : '  '  // Set indent style
    };
    const code = escodegen.generate(ast, options);
    return { code };
  }

  // Internal method to annotate each node in the AST with its original state
  static _annotateOriginalAST(ast) {
    const nodeQueue = [ast];
    while (nodeQueue.length > 0) {
      const currentNode = nodeQueue.shift();
      currentNode.original = Object.assign({}, currentNode);

      // Add child nodes to the queue for processing
      for (let childKey in currentNode) {
        if (currentNode[childKey] && typeof currentNode[childKey] === 'object') {
          nodeQueue.push(currentNode[childKey]);
        }
      }
    }
  }

  // Apply a transformation function to the AST
  static transform(ast, modifyFn) {
    modifyFn(ast);
  }
}

// Demonstration of Recast usage
const sourceCode = `
  function add(a, b) {
    return a +
      // Weird formatting, huh?
      b;
  }
`;

// Parse source code to obtain the AST
const ast = Recast.parse(sourceCode);

// Transform the AST: Convert function declaration to a variable declaration with function expression
Recast.transform(ast, (astRootNode) => {
  const firstNode = astRootNode.body[0];

  // Check if the first node is a function declaration
  if (firstNode.type === 'FunctionDeclaration') {
    // Convert function declaration to variable declaration with function expression
    astRootNode.body[0] = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: firstNode.id,
        init: {
          type: 'FunctionExpression',
          id: null,
          params: firstNode.params,
          body: firstNode.body
        }
      }],
      kind: 'var'
    };
  }
});

// Print the transformed AST back to source code
const transformedCode = Recast.print(ast).code;
console.log(transformedCode);

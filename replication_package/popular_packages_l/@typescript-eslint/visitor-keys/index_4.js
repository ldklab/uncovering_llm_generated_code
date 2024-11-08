// index.js
const astNodeChildren = {
  Program: ['body'],
  FunctionDeclaration: ['id', 'params', 'body'],
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['id', 'init'],
  ExpressionStatement: ['expression'],
  CallExpression: ['callee', 'arguments'],
  Identifier: [],
  Literal: [],
  // Extendable for TypeScript-ESTree node types
};

/**
 * Retrieves the child node keys for a given AST type
 * @param {string} type - AST node type
 * @returns {string[]} - Associated child keys for the node type
 */
function getChildKeys(type) {
  return astNodeChildren[type] || [];
}

/**
 * Traverses an AST using a visitor function
 * @param {object} node - Initial AST node to start traversal from
 * @param {function} visitor - Visitor function applied to each node
 */
function traverseAST(node, visitor) {
  visitor(node);
  const childKeys = getChildKeys(node.type);
  
  for (const key of childKeys) {
    const childNode = node[key];
    if (Array.isArray(childNode)) {
      for (const subNode of childNode) {
        traverseAST(subNode, visitor);
      }
    } else if (childNode && typeof childNode.type === 'string') {
      traverseAST(childNode, visitor);
    }
  }
}

module.exports = {
  getChildKeys,
  traverseAST,
};

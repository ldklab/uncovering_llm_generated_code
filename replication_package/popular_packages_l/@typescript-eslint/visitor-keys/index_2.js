// index.js
const nodeVisitorKeys = {
  Program: ['body'],
  FunctionDeclaration: ['id', 'params', 'body'],
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['id', 'init'],
  ExpressionStatement: ['expression'],
  CallExpression: ['callee', 'arguments'],
  Identifier: [],
  Literal: [],
  // Additional node types for extending this map can be added here
};

/**
 * Retrieves the visitor keys associated with an AST node type
 * @param {string} nodeType - The type of the AST node
 * @returns {string[]} - Array of visitor keys for the specified node type
 */
function retrieveVisitorKeys(nodeType) {
  return nodeVisitorKeys[nodeType] || [];
}

/**
 * Traverses an AST starting from the given node
 * @param {object} node - Starting AST node for traversal
 * @param {function} visitCallback - Callback function to execute on each node
 */
function traverseAst(node, visitCallback) {
  visitCallback(node);
  const keys = retrieveVisitorKeys(node.type);
  
  keys.forEach((key) => {
    const childNode = node[key];
    if (Array.isArray(childNode)) {
      childNode.forEach((child) => traverseAst(child, visitCallback));
    } else if (childNode && typeof childNode.type === 'string') {
      traverseAst(childNode, visitCallback);
    }
  });
}

module.exports = {
  retrieveVisitorKeys,
  traverseAst,
};

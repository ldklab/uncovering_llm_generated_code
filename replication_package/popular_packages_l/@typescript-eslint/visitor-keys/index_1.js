// index.js
const visitorKeys = {
  Program: ['body'],
  FunctionDeclaration: ['id', 'params', 'body'],
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['id', 'init'],
  ExpressionStatement: ['expression'],
  CallExpression: ['callee', 'arguments'],
  Identifier: [],
  Literal: [],
  // Extendable with additional TypeScript-ESTree node specifications
};

/**
 * Retrieves the visitor keys corresponding to a specific AST node type.
 * @param {string} nodeType - AST node type.
 * @returns {string[]} - Array of visitor keys for the specified node type.
 */
function getVisitorKeys(nodeType) {
  return visitorKeys[nodeType] || [];
}

/**
 * Traverses an Abstract Syntax Tree (AST) starting from the specified node.
 * @param {object} node - Initial AST node for traversal.
 * @param {function} visit - Callback function invoked for each encountered node.
 */
function traverse(node, visit) {
  visit(node); // Invoke callback with current node
  const keys = getVisitorKeys(node.type); // Retrieve traversal keys for the node type

  keys.forEach((key) => {
    const child = node[key]; // Get child node(s) associated with the current key
    if (Array.isArray(child)) { // If the child is an array, iterate and traverse each node
      child.forEach((c) => traverse(c, visit));
    } else if (child && typeof child.type === 'string') { // Otherwise, directly traverse non-array child node
      traverse(child, visit);
    }
  });
}

module.exports = {
  getVisitorKeys,
  traverse,
};

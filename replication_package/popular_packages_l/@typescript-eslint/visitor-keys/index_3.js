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
  // Additional node types can be added here as needed for further specificity
};

/**
 * Retrieve visitor keys for a specified AST node type.
 * @param {string} nodeType - A string representing the type of the AST node.
 * @returns {string[]} - An array of visitor keys associated with the specified node type.
 */
function getVisitorKeys(nodeType) {
  return visitorKeys[nodeType] || [];
}

/**
 * Traverses an Abstract Syntax Tree (AST), invoking a callback function on each node.
 * @param {object} node - The AST node from which traversal begins.
 * @param {function} visit - A function to execute for each node encountered during traversal.
 */
function traverse(node, visit) {
  visit(node);
  const keys = getVisitorKeys(node.type);
  
  keys.forEach((key) => {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((c) => traverse(c, visit));
    } else if (child && typeof child.type === 'string') {
      traverse(child, visit);
    }
  });
}

module.exports = {
  getVisitorKeys,
  traverse,
};

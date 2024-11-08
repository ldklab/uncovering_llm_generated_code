markdown
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
  // You can extend these keys based on TypeScript-ESTree nodes specifics
};

/**
 * Function to get visitor keys for an AST node type
 * @param {string} nodeType - The type of the AST node
 * @returns {string[]} - List of visitor keys for the given node type
 */
function getVisitorKeys(nodeType) {
  return visitorKeys[nodeType] || [];
}

/**
 * Example function to traverse an AST
 * @param {object} node - The AST node to start traversal
 * @param {function} visit - A callback function to call for every node
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

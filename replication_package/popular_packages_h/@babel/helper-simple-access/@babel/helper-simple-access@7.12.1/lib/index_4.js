"use strict";

const babelTypes = require("@babel/types");

module.exports = simplifyAccess;

// Function that simplifies AST Node expressions
function simplifyAccess(path, bindingNames) {
  path.traverse(visitor, {
    scope: path.scope,
    bindingNames,
    seenNodes: new WeakSet()
  });
}

// Visitor object to handle specific nodes in the AST
const visitor = {
  UpdateExpression: {
    exit: function(path) {
      const { scope, bindingNames } = this;
      const argument = path.get("argument");

      if (!argument.isIdentifier()) return;
      const localName = argument.node.name;
      if (!bindingNames.has(localName) || 
          scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      if (path.parentPath.isExpressionStatement() && !path.isCompletionRecord()) {
        const operator = path.node.operator === "++" ? "+=" : "-=";
        path.replaceWith(babelTypes.assignmentExpression(operator, argument.node, babelTypes.numericLiteral(1)));
      } else if (path.node.prefix) {
        path.replaceWith(
          babelTypes.assignmentExpression(
            "=", 
            babelTypes.identifier(localName), 
            babelTypes.binaryExpression(
              path.node.operator[0], 
              babelTypes.unaryExpression("+", argument.node), 
              babelTypes.numericLiteral(1)
            )
          )
        );
      } else {
        const oldIdentifier = path.scope.generateUidIdentifierBasedOnNode(argument.node, "old");
        path.scope.push({ id: oldIdentifier });

        const binaryExpr = babelTypes.binaryExpression(
          path.node.operator[0], 
          babelTypes.identifier(oldIdentifier.name), 
          babelTypes.numericLiteral(1)
        );

        path.replaceWith(
          babelTypes.sequenceExpression([
            babelTypes.assignmentExpression("=", babelTypes.identifier(oldIdentifier.name), babelTypes.unaryExpression("+", argument.node)),
            babelTypes.assignmentExpression("=", argument.node, binaryExpr),
            babelTypes.identifier(oldIdentifier.name)
          ])
        );
      }
    }
  },
  AssignmentExpression: {
    exit: function(path) {
      const { scope, seenNodes, bindingNames } = this;
      if (path.node.operator === "=") return;
      if (seenNodes.has(path.node)) return;

      seenNodes.add(path.node);
      const left = path.get("left");

      if (!left.isIdentifier()) return;
      const localName = left.node.name;
      if (!bindingNames.has(localName) || 
          scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      path.node.right = babelTypes.binaryExpression(
        path.node.operator.slice(0, -1), 
        babelTypes.cloneNode(left.node), 
        path.node.right
      );
      path.node.operator = "=";
    }
  }
};

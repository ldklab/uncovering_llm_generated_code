"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = simplifyAccess;

const babelTypes = require("@babel/types");

const {
  LOGICAL_OPERATORS,
  assignmentExpression,
  binaryExpression,
  cloneNode,
  identifier,
  logicalExpression,
  numericLiteral,
  sequenceExpression,
  unaryExpression
} = babelTypes;

const simpleAssignmentVisitor = {
  AssignmentExpression: {
    exit(path) {
      const { scope, seen, bindingNames } = this;
      if (path.node.operator === "=") return;
      if (seen.has(path.node)) return;
      seen.add(path.node);
      
      const left = path.get("left");
      if (!left.isIdentifier()) return;

      const localName = left.node.name;
      if (!bindingNames.has(localName)) return;
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      const operator = path.node.operator.slice(0, -1);
      if (LOGICAL_OPERATORS.includes(operator)) {
        path.replaceWith(
          logicalExpression(operator, path.node.left, 
          assignmentExpression("=", cloneNode(path.node.left), path.node.right))
        );
      } else {
        path.node.right = binaryExpression(operator, cloneNode(path.node.left), path.node.right);
        path.node.operator = "=";
      }
    }
  },
  UpdateExpression: {
    exit(path) {
      if (!this.includeUpdateExpression) return;
      const { scope, bindingNames } = this;
      
      const arg = path.get("argument");
      if (!arg.isIdentifier()) return;

      const localName = arg.node.name;
      if (!bindingNames.has(localName)) return;
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      const operator = path.node.operator;
      if (path.parentPath.isExpressionStatement() && !path.isCompletionRecord()) {
        const assignOp = operator === "++" ? "+=" : "-=";
        path.replaceWith(assignmentExpression(assignOp, arg.node, numericLiteral(1)));
      } else if (path.node.prefix) {
        path.replaceWith(
          assignmentExpression(
            "=",
            identifier(localName),
            binaryExpression(operator[0], unaryExpression("+", arg.node), numericLiteral(1))
          )
        );
      } else {
        const old = path.scope.generateUidIdentifierBasedOnNode(arg.node, "old");
        path.scope.push({ id: old });
        
        const binary = binaryExpression(operator[0], identifier(old.name), numericLiteral(1));
        path.replaceWith(
          sequenceExpression([
            assignmentExpression("=", identifier(old.name), unaryExpression("+", arg.node)),
            assignmentExpression("=", cloneNode(arg.node), binary),
            identifier(old.name)
          ])
        );
      }
    }
  }
};

function simplifyAccess(path, bindingNames, includeUpdateExpression = true) {
  path.traverse(simpleAssignmentVisitor, {
    scope: path.scope,
    bindingNames,
    seen: new WeakSet(),
    includeUpdateExpression
  });
}

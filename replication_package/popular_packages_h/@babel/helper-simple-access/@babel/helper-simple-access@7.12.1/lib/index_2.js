"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = simplifyAccess;

const t = require("@babel/types");

function simplifyAccess(path, bindingNames) {
  path.traverse(simpleAssignmentVisitor, {
    scope: path.scope,
    bindingNames,
    seen: new WeakSet()
  });
}

const simpleAssignmentVisitor = {
  UpdateExpression: {
    exit(path) {
      const { scope, bindingNames } = this;
      const argument = path.get("argument");
      if (!argument.isIdentifier()) return;
      const localName = argument.node.name;
      if (!bindingNames.has(localName)) return;
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      if (path.parentPath.isExpressionStatement() && !path.isCompletionRecord()) {
        const operator = path.node.operator === "++" ? "+=" : "-=";
        path.replaceWith(t.assignmentExpression(operator, argument.node, t.numericLiteral(1)));
      } else if (path.node.prefix) {
        path.replaceWith(t.assignmentExpression("=", t.identifier(localName), t.binaryExpression(path.node.operator[0], t.unaryExpression("+", argument.node), t.numericLiteral(1))));
      } else {
        const oldVar = path.scope.generateUidIdentifierBasedOnNode(argument.node, "old");
        path.scope.push({ id: oldVar });
        const binaryExpression = t.binaryExpression(path.node.operator[0], oldVar, t.numericLiteral(1));
        path.replaceWith(
          t.sequenceExpression([
            t.assignmentExpression("=", t.identifier(oldVar.name), t.unaryExpression("+", argument.node)),
            t.assignmentExpression("=", t.cloneNode(argument.node), binaryExpression),
            t.identifier(oldVar.name)
          ])
        );
      }
    }
  },
  AssignmentExpression: {
    exit(path) {
      const { scope, seen, bindingNames } = this;
      if (path.node.operator === "=" || seen.has(path.node)) return;
      seen.add(path.node);
      const left = path.get("left");
      if (!left.isIdentifier()) return;
      const localName = left.node.name;
      if (!bindingNames.has(localName)) return;
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) return;

      path.node.right = t.binaryExpression(path.node.operator.slice(0, -1), t.cloneNode(path.node.left), path.node.right);
      path.node.operator = "=";
    }
  }
};

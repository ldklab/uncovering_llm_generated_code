"use strict";

import {
  LOGICAL_OPERATORS,
  assignmentExpression,
  binaryExpression,
  cloneNode,
  identifier,
  logicalExpression,
  numericLiteral,
  sequenceExpression,
  unaryExpression
} from "@babel/types";

export default function simplifyAccess(path, bindingNames, includeUpdateExpression = true) {
  // Define visitor object for traversing and transforming the code
  const simpleAssignmentVisitor = {
    AssignmentExpression: {
      exit(path) {
        const { scope, seen, bindingNames } = this;

        if (path.node.operator === "=" || seen.has(path.node)) return;
        seen.add(path.node);

        const left = path.get("left");
        if (!left.isIdentifier()) return;

        const localName = left.node.name;
        if (!bindingNames.has(localName) || scope.getBinding(localName) !== path.scope.getBinding(localName)) {
          return;
        }

        const operator = path.node.operator.slice(0, -1);
        if (LOGICAL_OPERATORS.includes(operator)) {
          path.replaceWith(
            logicalExpression(
              operator,
              path.node.left,
              assignmentExpression("=", cloneNode(path.node.left), path.node.right)
            )
          );
        } else {
          path.node.right = binaryExpression(operator, cloneNode(path.node.left), path.node.right);
          path.node.operator = "=";
        }
      }
    },
    UpdateExpression: {
      exit(path) {
        if (!includeUpdateExpression) return;

        const { scope, bindingNames } = this;
        const arg = path.get("argument");

        if (!arg.isIdentifier()) return;

        const localName = arg.node.name;
        if (!bindingNames.has(localName) || scope.getBinding(localName) !== path.scope.getBinding(localName)) {
          return;
        }

        if (path.parentPath.isExpressionStatement() && !path.isCompletionRecord()) {
          const operator = path.node.operator === "++" ? "+=" : "-=";
          path.replaceWith(assignmentExpression(operator, arg.node, numericLiteral(1)));
        } else if (path.node.prefix) {
          path.replaceWith(
            assignmentExpression(
              "=",
              identifier(localName),
              binaryExpression(path.node.operator[0], unaryExpression("+", arg.node), numericLiteral(1))
            )
          );
        } else {
          const old = path.scope.generateUidIdentifierBasedOnNode(arg.node, "old");
          const varName = old.name;

          path.scope.push({ id: old });

          const binary = binaryExpression(path.node.operator[0], identifier(varName), numericLiteral(1));
          path.replaceWith(
            sequenceExpression([
              assignmentExpression("=", identifier(varName), unaryExpression("+", arg.node)),
              assignmentExpression("=", cloneNode(arg.node), binary),
              identifier(varName)
            ])
          );
        }
      }
    }
  };

  // Traverse the path with the visitor
  path.traverse(simpleAssignmentVisitor, {
    scope: path.scope,
    bindingNames,
    seen: new WeakSet(),
    includeUpdateExpression
  });
}

module.exports = function({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const jestCalls = [];
        
        path.traverse({
          ExpressionStatement(exprPath) {
            const expr = exprPath.node.expression;
            if (
              t.isCallExpression(expr) &&
              t.isMemberExpression(expr.callee) &&
              t.isIdentifier(expr.callee.object, { name: 'jest' }) &&
              ['disableAutomock', 'enableAutomock', 'unmock', 'mock'].includes(expr.callee.property.name)
            ) {
              jestCalls.push(exprPath.node);
              exprPath.remove();
            }
          }
        });

        const firstImportIndex = path.node.body.findIndex(statement => t.isImportDeclaration(statement));

        if (firstImportIndex !== -1) {
          path.node.body.splice(firstImportIndex, 0, ...jestCalls);
        } else {
          path.node.body.unshift(...jestCalls);
        }
      }
    }
  };
};

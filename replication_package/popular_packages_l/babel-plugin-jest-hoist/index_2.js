module.exports = function({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const jestCalls = [];

        path.traverse({
          ExpressionStatement(exprPath) {
            const { expression } = exprPath.node;
            if (
              t.isCallExpression(expression) &&
              t.isMemberExpression(expression.callee) &&
              t.isIdentifier(expression.callee.object, { name: 'jest' })
            ) {
              const methodName = expression.callee.property.name;
              if (['disableAutomock', 'enableAutomock', 'unmock', 'mock'].includes(methodName)) {
                jestCalls.push(exprPath.node);
                exprPath.remove();
              }
            }
          }
        });

        const firstImportIndex = path.node.body.findIndex(stm => t.isImportDeclaration(stm));

        if (firstImportIndex !== -1) {
          path.node.body.splice(firstImportIndex, 0, ...jestCalls);
        } else {
          path.node.body.unshift(...jestCalls);
        }
      }
    }
  };
};

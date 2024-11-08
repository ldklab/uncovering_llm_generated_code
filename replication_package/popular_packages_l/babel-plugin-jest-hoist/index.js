// babel-plugin-jest-hoist.js

module.exports = function({ types: t }) {
  return {
    visitor: {
      Program(path) {
        // Collect jest calls
        const jestCalls = [];

        // Traverse through the program body to identify jest function calls
        path.traverse({
          ExpressionStatement(exprPath) {
            const { expression } = exprPath.node;
            if (
              t.isCallExpression(expression) &&
              t.isMemberExpression(expression.callee) &&
              t.isIdentifier(expression.callee.object, { name: 'jest' })
            ) {
              const jestMethodName = expression.callee.property.name;
              if (
                ['disableAutomock', 'enableAutomock', 'unmock', 'mock'].includes(jestMethodName)
              ) {
                jestCalls.push(exprPath.node);
                exprPath.remove(); // Remove original from original spot
              }
            }
          }
        });

        // Find the first import statement to insert before
        const firstImportIndex = path.node.body.findIndex((stm) => 
          t.isImportDeclaration(stm)
        );

        // Insert jest calls before the first import statement or at the program start
        if (firstImportIndex !== -1) {
          path.node.body.splice(firstImportIndex, 0, ...jestCalls);
        } else {
          path.node.body.unshift(...jestCalls);
        }
      }
    }
  };
};

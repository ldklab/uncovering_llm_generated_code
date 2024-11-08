// babel-plugin-polyfill-regenerator.js
module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-polyfill-regenerator',
    visitor: {
      // Visitor object for traversing the AST
      Program(path, state) {
        const method = state.opts.method;  // Determines the polyfill method
        const hasRuntime = path.node.body.some(statement =>
          t.isImportDeclaration(statement) &&
          statement.source.value === 'regenerator-runtime'
        ); // Check if 'regenerator-runtime' import is already present

        if (method === 'entry-global' && !hasRuntime) {
          // Adding the global entry import if not present
          path.node.body.unshift(
            t.importDeclaration([], t.stringLiteral('regenerator-runtime/runtime'))
          );
        } else if (method === 'usage-global' || method === 'usage-pure') {
          // Traverse functions to add imports for generator or async functions
          path.traverse({
            Function(innerPath) {
              if ((innerPath.node.async || innerPath.node.generator) && !hasRuntime) {
                // Add global or pure import based on the method
                const importSource = method === 'usage-global' ?
                  'regenerator-runtime/runtime' : 'regenerator-runtime';
                innerPath.node.body.body.unshift(
                  t.importDeclaration([], t.stringLiteral(importSource))
                );
              }
            }
          });
        }
      }
    }
  };
};

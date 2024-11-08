// babel-plugin-polyfill-regenerator.js

module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-polyfill-regenerator',
    // The visitor object contains methods that are called during traversal of the AST (Abstract Syntax Tree)
    visitor: {
      Program(path, state) {
        // Get the method option from Babel's plugin configuration
        const method = state.opts.method;
        
        // Check if the 'regenerator-runtime' is already imported in the file
        const hasRuntime = path.node.body.some(statement =>
          t.isImportDeclaration(statement) &&
          statement.source.value === 'regenerator-runtime'
        );

        if (method === 'entry-global') {
          // Add a global import for 'regenerator-runtime/runtime' if not present
          if (!hasRuntime) {
            path.node.body.unshift(
              t.importDeclaration([], t.stringLiteral('regenerator-runtime/runtime'))
            );
          }
        } else if (method === 'usage-global' || method === 'usage-pure') {
          // Traverse through functions in the file
          path.traverse({
            Function(path) {
              // Check if it's an async function or a generator
              if ((path.node.async || path.node.generator) && !hasRuntime) {
                // Decide which import to add based on method
                const importSource = method === 'usage-global'
                  ? 'regenerator-runtime/runtime'
                  : 'regenerator-runtime';
                
                // Add respective import at the start of the function body
                path.node.body.body.unshift(
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

// Functionality Explanation:
// This code is a Babel plugin that ensures the inclusion of the `regenerator-runtime` polyfill 
// for handling async and generator functions. It offers different strategies based on the 'method' option:
// 1. `entry-global`: Adds a global import declaration for the `regenerator-runtime/runtime` at the start of the program, ensuring it's loaded only once at the beginning.
// 2. `usage-global`: For each async or generator function found, it adds an import declaration for `regenerator-runtime/runtime` within the function's body, ensuring the runtime is available whenever it's directly used.
// 3. `usage-pure`: Similar to `usage-global`, but instead of the full runtime, it imports `regenerator-runtime`, which is a purer, non-global approach.

module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-polyfill-regenerator',
    visitor: {
      Program(path, state) {
        const method = state.opts.method;
        const hasRuntime = path.node.body.some(statement =>
          t.isImportDeclaration(statement) &&
          statement.source.value === 'regenerator-runtime'
        );

        if (method === 'entry-global' && !hasRuntime) {
          // Ensures the global runtime is added at program entry
          path.node.body.unshift(
            t.importDeclaration([], t.stringLiteral('regenerator-runtime/runtime'))
          );
        } else if (method === 'usage-global' || method === 'usage-pure') {
          // Traverses through all functions to ensure import when needed
          path.traverse({
            Function(path) {
              if ((path.node.async || path.node.generator) && !hasRuntime) {
                const importName = method === 'usage-global' 
                  ? 'regenerator-runtime/runtime' 
                  : 'regenerator-runtime';
                path.node.body.body.unshift(
                  t.importDeclaration([], t.stringLiteral(importName))
                );
              }
            }
          });
        }
      }
    }
  };
};

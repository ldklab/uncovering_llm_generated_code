// This Node.js module exports a Babel plugin named `babel-plugin-polyfill-corejs2`.
// The plugin analyzes code and applies polyfills based on the specified `method` option.
// The plugin supports three methods: `usage-pure`, `usage-global`, and `entry-global`.

module.exports = function(babel) {
  const { types: t } = babel; // Destructure `types` from the babel object for AST manipulation.

  return {
    name: "babel-plugin-polyfill-corejs2", // Define the name of the plugin.

    visitor: {
      Program(path, state) {
        // Retrieve the method option from the plugin state; default to 'usage-global'.
        const method = state.opts.method || 'usage-global';

        // Conditionally execute behavior based on the chosen method.
        switch (method) {
          case 'usage-pure':
            // `usage-pure`: Traverses code to enforce polyfills without global pollution.
            path.traverse({
              CallExpression(callPath) {
                // Check if the code is invoking `Array.from`.
                if (t.isMemberExpression(callPath.node.callee) &&
                    callPath.node.callee.object.name === 'Array' &&
                    callPath.node.callee.property.name === 'from') {
                  // Prepend an import for `Array.from` polyfill.
                  callPath.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/modules/es6.array.from')
                  ));
                }
              },
            });
            break;

          case 'usage-global':
            // `usage-global`: Adds global polyfills by evaluating code.
            path.traverse({
              CallExpression(callPath) {
                if (t.isMemberExpression(callPath.node.callee) &&
                    callPath.node.callee.object.name === 'Array' &&
                    callPath.node.callee.property.name === 'from') {
                  // Prepend the globally-modifying polyfill.
                  callPath.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/library/fn/array/from')
                  ));
                }
              },
            });
            break;

          case 'entry-global':
            // `entry-global`: Replaces core-js imports with necessary core-js module imports.
            path.node.body.forEach((node, index) => {
              if (t.isImportDeclaration(node) && node.source.value.startsWith('core-js')) {
                path.get('body')[index].replaceWith(t.importDeclaration(
                  [],
                  t.stringLiteral('core-js/modules/index')
                ));
              }
            });
            break;

          default:
            throw new Error(`Unknown method "${method}"`); // Throw error if method is unsupported.
        }
      },
    },
  };
};

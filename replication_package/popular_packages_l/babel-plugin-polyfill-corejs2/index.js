// babel-plugin-polyfill-corejs2/index.js
module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: "babel-plugin-polyfill-corejs2",
    visitor: {
      Program(path, state) {
        const method = state.opts.method || 'usage-global';
        switch (method) {
          case 'usage-pure':
            // Analyze the code and only add necessary polyfills, avoiding global pollution.
            path.traverse({
              // Example: Adding polyfills to handle `Array.from`
              CallExpression(path) {
                if (t.isMemberExpression(path.node.callee) &&
                    path.node.callee.object.name === 'Array' &&
                    path.node.callee.property.name === 'from') {
                  path.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/modules/es6.array.from')
                  ));
                }
              },
            });
            break;

          case 'usage-global':
            // Analyze the code and add necessary polyfills, with global modification
            path.traverse({
              CallExpression(path) {
                if (t.isMemberExpression(path.node.callee) &&
                    path.node.callee.object.name === 'Array' &&
                    path.node.callee.property.name === 'from') {
                  path.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/library/fn/array/from')
                  ));
                }
              },
            });
            break;

          case 'entry-global':
            // Replace core-js imports with necessary polyfills
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
            throw new Error(`Unknown method "${method}"`);
        }
      },
    },
  };
};

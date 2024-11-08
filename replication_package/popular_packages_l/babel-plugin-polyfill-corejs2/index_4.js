// babel-plugin-polyfill-corejs2/index.js
module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: "babel-plugin-polyfill-corejs2",
    visitor: {
      Program(path, state) {
        const method = state.opts.method || 'usage-global';

        function addPolyfillForArrayFrom(path, polyfillPath) {
          if (t.isMemberExpression(path.node.callee) &&
              path.node.callee.object.name === 'Array' &&
              path.node.callee.property.name === 'from') {
            path.unshiftContainer('body', t.importDeclaration(
              [],
              t.stringLiteral(polyfillPath)
            ));
          }
        }

        switch (method) {
          case 'usage-pure':
            path.traverse({
              CallExpression(path) {
                addPolyfillForArrayFrom(path, 'core-js/modules/es6.array.from');
              },
            });
            break;

          case 'usage-global':
            path.traverse({
              CallExpression(path) {
                addPolyfillForArrayFrom(path, 'core-js/library/fn/array/from');
              },
            });
            break;

          case 'entry-global':
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

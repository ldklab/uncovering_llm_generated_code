// Required Babel plugin for polyfill using core-js version 2.
module.exports = function (babel) {
  const { types: t } = babel;

  return {
    // Plugin name
    name: "babel-plugin-polyfill-corejs2",
    
    // Visitor pattern to modify AST (Abstract Syntax Tree)
    visitor: {
      Program(path, state) {
        const method = state.opts.method || 'usage-global';

        // Handle different polyfill strategies
        switch (method) {
          case 'usage-pure':
            // Polyfill analysis without polluting globals
            path.traverse({
              CallExpression(path) {
                if (
                  t.isMemberExpression(path.node.callee) &&
                  path.node.callee.object.name === 'Array' &&
                  path.node.callee.property.name === 'from'
                ) {
                  path.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/modules/es6.array.from')
                  ));
                }
              },
            });
            break;

          case 'usage-global':
            // Global modification by adding polyfills
            path.traverse({
              CallExpression(path) {
                if (
                  t.isMemberExpression(path.node.callee) &&
                  path.node.callee.object.name === 'Array' &&
                  path.node.callee.property.name === 'from'
                ) {
                  path.unshiftContainer('body', t.importDeclaration(
                    [],
                    t.stringLiteral('core-js/library/fn/array/from')
                  ));
                }
              },
            });
            break;

          case 'entry-global':
            // Modify imports to bring in all necessary polyfills
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

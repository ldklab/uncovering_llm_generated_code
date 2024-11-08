// babel-plugin-polyfill-corejs2/index.js
module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: "babel-plugin-polyfill-corejs2",
    visitor: {
      Program(path, state) {
        const method = state.opts.method || 'usage-global';

        const addPolyfill = (libraryPath) => {
          path.unshiftContainer('body', t.importDeclaration([], t.stringLiteral(libraryPath)));
        };

        const handleArrayFromPolyfill = (path) => {
          const isArrayFromCall = t.isMemberExpression(path.node.callee) &&
                                  path.node.callee.object.name === 'Array' &&
                                  path.node.callee.property.name === 'from';

          if (isArrayFromCall) {
            const polyfillPath = method === 'usage-pure'
              ? 'core-js/modules/es6.array.from'
              : 'core-js/library/fn/array/from';
            addPolyfill(polyfillPath);
          }
        };

        const replaceCoreImports = (node, index) => {
          const isCoreJSImport = t.isImportDeclaration(node) && node.source.value.startsWith('core-js');
          if (isCoreJSImport) {
            path.get('body')[index].replaceWith(t.importDeclaration([], t.stringLiteral('core-js/modules/index')));
          }
        };

        switch (method) {
          case 'usage-pure':
          case 'usage-global':
            path.traverse({
              CallExpression: handleArrayFromPolyfill,
            });
            break;

          case 'entry-global':
            path.node.body.forEach(replaceCoreImports);
            break;

          default:
            throw new Error(`Unknown method "${method}"`);
        }
      },
    },
  };
};

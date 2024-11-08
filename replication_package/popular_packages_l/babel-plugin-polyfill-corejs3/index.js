// babel-plugin-polyfill-corejs3/index.js
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const { method = 'usage-global', version = '3.0', proposals = false } = options;

  return {
    name: 'babel-plugin-polyfill-corejs3',

    visitor: {
      Program(path) {
        if (method === 'entry-global') {
          // Replace imports of core-js
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (source.startsWith('core-js')) {
                importPath.node.source.value = `core-js@${version}`;
              }
            }
          });
        } else if (method === 'usage-global' || method === 'usage-pure') {
          // Add polyfills globally or within scope for pure methods
          // Simulate detection of unsupported features for demonstration
          path.node.body.unshift(
            api.types.importDeclaration(
              [],
              api.types.stringLiteral(`core-js@${version}/full`)
            )
          );
        }

        if (proposals) {
          // Add polyfills for proposals if the option is enabled
          path.node.body.unshift(
            api.types.importDeclaration(
              [],
              api.types.stringLiteral(`core-js@${version}/proposals`)
            )
          );
        }
      }
    }
  };
});

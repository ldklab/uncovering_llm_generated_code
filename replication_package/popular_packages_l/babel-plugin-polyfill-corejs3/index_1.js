// babel-plugin-polyfill-corejs3/index.js
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  // Extract options with defaults for loading core-js polyfills
  const { method = 'usage-global', version = '3.0', proposals = false } = options;

  return {
    // Name of the Babel plugin
    name: 'babel-plugin-polyfill-corejs3',

    // AST visitor for modifying the Program node
    visitor: {
      Program(path) {
        // Handle 'entry-global' method by rewriting core-js imports with specified version
        if (method === 'entry-global') {
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (source.startsWith('core-js')) {
                importPath.node.source.value = `core-js@${version}`;
              }
            }
          });
        } 
        // Handle 'usage-global' and 'usage-pure' methods by including core-js globally
        else if (method === 'usage-global' || method === 'usage-pure') {
          path.node.body.unshift(
            api.types.importDeclaration(
              [],
              api.types.stringLiteral(`core-js@${version}/full`)
            )
          );
        }

        // Include polyfills for proposals if option is enabled
        if (proposals) {
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

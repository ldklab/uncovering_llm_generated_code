// babel-plugin-polyfill-corejs3/index.js
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  // Ensure the Babel API version is 7
  api.assertVersion(7);

  // Set default options with method as 'usage-global', version as '3.0', and proposals as false
  const { method = 'usage-global', version = '3.0', proposals = false } = options;

  return {
    // Name of the plugin
    name: 'babel-plugin-polyfill-corejs3',

    // Visitor for traversing the program AST
    visitor: {
      Program(path) {
        // If method is 'entry-global', adjust the imports of core-js to reflect a specific version
        if (method === 'entry-global') {
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (source.startsWith('core-js')) {
                // Change the import source to include the specified version of core-js
                importPath.node.source.value = `core-js@${version}`;
              }
            }
          });
        } else if (method === 'usage-global' || method === 'usage-pure') {
          // For 'usage-global' or 'usage-pure', prepend a global import of core-js full library
          path.node.body.unshift(
            api.types.importDeclaration(
              [],
              api.types.stringLiteral(`core-js@${version}/full`)
            )
          );
        }

        // If proposals option is true, also prepend imports for proposal features
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

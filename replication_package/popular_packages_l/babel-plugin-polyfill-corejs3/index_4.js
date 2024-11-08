const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const {
    method = 'usage-global',
    version = '3.0',
    proposals = false
  } = options;

  return {
    name: 'babel-plugin-polyfill-corejs3',

    visitor: {
      Program(path) {
        if (method === 'entry-global') {
          path.traverse({
            ImportDeclaration(importPath) {
              const sourceValue = importPath.node.source.value;
              if (sourceValue.startsWith('core-js')) {
                importPath.node.source.value = `core-js@${version}`;
              }
            }
          });
        } else if (method === 'usage-global' || method === 'usage-pure') {
          path.node.body.unshift(
            api.types.importDeclaration(
              [],
              api.types.stringLiteral(`core-js@${version}/full`)
            )
          );
        }

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

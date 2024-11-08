// babel-plugin-polyfill-corejs3/index.js
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const {
    method = 'usage-global',
    version = '3.0',
    proposals = false,
  } = options;

  return {
    name: 'babel-plugin-polyfill-corejs3',

    visitor: {
      Program(path) {
        const importStatement = api.types.importDeclaration(
          [],
          api.types.stringLiteral(`core-js@${version}/full`)
        );
        const proposalStatement = api.types.importDeclaration(
          [],
          api.types.stringLiteral(`core-js@${version}/proposals`)
        );

        if (method === 'entry-global') {
          path.traverse({
            ImportDeclaration(importPath) {
              const source = importPath.node.source.value;
              if (source.startsWith('core-js')) {
                importPath.node.source.value = `core-js@${version}`;
              }
            },
          });
        } else if (method === 'usage-global' || method === 'usage-pure') {
          path.node.body.unshift(importStatement);
        }

        if (proposals) {
          path.node.body.unshift(proposalStatement);
        }
      },
    },
  };
});

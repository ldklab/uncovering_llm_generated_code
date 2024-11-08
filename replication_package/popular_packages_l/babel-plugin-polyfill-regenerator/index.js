// babel-plugin-polyfill-regenerator.js
module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-polyfill-regenerator',
    visitor: {
      Program(path, state) {
        const method = state.opts.method;
        const hasRuntime = path.node.body.some(statement =>
          t.isImportDeclaration(statement) &&
          statement.source.value === 'regenerator-runtime'
        );

        if (method === 'entry-global') {
          if (!hasRuntime) {
            path.node.body.unshift(
              t.importDeclaration([], t.stringLiteral('regenerator-runtime/runtime'))
            );
          }
        } else if (method === 'usage-global' || method === 'usage-pure') {
          path.traverse({
            Function(path) {
              if ((path.node.async || path.node.generator) && !hasRuntime) {
                if (method === 'usage-global') {
                  path.node.body.body.unshift(
                    t.importDeclaration([], t.stringLiteral('regenerator-runtime/runtime'))
                  );
                } else if (method === 'usage-pure') {
                  path.node.body.body.unshift(
                    t.importDeclaration([], t.stringLiteral('regenerator-runtime'))
                  );
                }
              }
            }
          });
        }
      }
    }
  };
};

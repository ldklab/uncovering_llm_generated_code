// babel-plugin-polyfill-regenerator.js
module.exports = function({ types: t }) {
  const addImportIfNeeded = (path, importSource, condition) => {
    if (!condition) {
      path.unshift(t.importDeclaration([], t.stringLiteral(importSource)));
    }
  };

  return {
    name: 'babel-plugin-polyfill-regenerator',
    visitor: {
      Program(path, state) {
        const { method } = state.opts;
        const body = path.node.body;
        const hasRuntime = body.some(statement =>
          t.isImportDeclaration(statement) &&
          statement.source.value === 'regenerator-runtime'
        );

        if (method === 'entry-global') {
          addImportIfNeeded(body, 'regenerator-runtime/runtime', hasRuntime);
        } else if (method === 'usage-global' || method === 'usage-pure') {
          path.traverse({
            Function(funcPath) {
              if ((funcPath.node.async || funcPath.node.generator) && !hasRuntime) {
                const importSource = method === 'usage-global'
                  ? 'regenerator-runtime/runtime'
                  : 'regenerator-runtime';
                addImportIfNeeded(funcPath.node.body.body, importSource, false);
              }
            }
          });
        }
      }
    }
  };
};

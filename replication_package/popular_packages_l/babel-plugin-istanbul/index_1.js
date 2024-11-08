// index.js
const babel = require('@babel/core');

function babelPluginIstanbul(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      Program(path, state) {
        if (shouldExcludeFile(state.file.opts.filename, state.opts.exclude)) return;

        const coverageIdentifier = createCoverageIdentifier();

        path.node.body.unshift(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(t.identifier('global'), t.identifier(coverageIdentifier)),
              []
            )
          )
        );
      },
    },
  };
}

function shouldExcludeFile(filename, excludePatterns) {
  if (!excludePatterns) return false;
  return excludePatterns.some(pattern => new RegExp(pattern).test(filename));
}

function createCoverageIdentifier() {
  return '__coverage__';
}

function instrument(sourceCode, sourceMap, filename) {
  return babel.transform(sourceCode, {
    filename,
    plugins: [
      [babelPluginIstanbul, {
        inputSourceMap: sourceMap,
      }],
    ],
  });
}

module.exports = babelPluginIstanbul;

const sourceCode = 'function hello() { return "Hello World"; }';
const { code } = instrument(sourceCode, null, 'hello.js');
console.log(code);

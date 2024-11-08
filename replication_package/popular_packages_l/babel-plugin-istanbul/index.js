// index.js
const babel = require('@babel/core');

function babelPluginIstanbul(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      Program(path, state) {
        // Skip files based on the exclude options.
        if (shouldExcludeFile(state.file.opts.filename, state.opts.exclude)) return;

        // Instrument code here by inserting coverage counters.
        const coverageIdentifier = createCoverageIdentifier();

        // Insert initialization and function call to increment counters.
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
  // This function should create a unique identifier for each file to track coverage.
  return '__coverage__';
}

// Usage programmatically
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

// Programmatic usage example
const sourceCode = 'function hello() { return "Hello World"; }';
const { code } = instrument(sourceCode, null, 'hello.js');
console.log(code);

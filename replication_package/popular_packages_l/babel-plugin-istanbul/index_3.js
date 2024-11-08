// index.js
const babel = require('@babel/core');

function babelPluginIstanbul(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      Program(path, state) {
        // Skip files that match exclusion patterns
        if (shouldExcludeFile(state.file.opts.filename, state.opts.exclude)) return;

        // Insert coverage tracking code
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
  // Generates a unique coverage identifier (currently hardcoded)
  return '__coverage__';
}

// Function to instrument code with coverage data
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

// Example usage of instrumentation
const sourceCode = 'function hello() { return "Hello World"; }';
const { code } = instrument(sourceCode, null, 'hello.js');
console.log(code);

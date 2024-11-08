const babel = require('@babel/core');

// Plugin factory for Babel that instruments code for coverage
function babelPluginIstanbul({ types: t }) {
  return {
    visitor: {
      // Visits the program node of each file
      Program(path, state) {
        const filename = state.file.opts.filename;
        const excludePatterns = state.opts.exclude;
        if (shouldExcludeFile(filename, excludePatterns)) return;

        const coverageIdentifier = createCoverageIdentifier();
        const coverageInit = t.expressionStatement(
          t.callExpression(
            t.memberExpression(t.identifier('global'), t.identifier(coverageIdentifier)),
            []
          )
        );

        // Add coverage initialization at the start of the file
        path.node.body.unshift(coverageInit);
      },
    },
  };
}

// Determines if a file should be excluded based on patterns
function shouldExcludeFile(filename, excludePatterns) {
  if (!excludePatterns) return false;
  return excludePatterns.some(pattern => new RegExp(pattern).test(filename));
}

// Creates a unique identifier for coverage tracking
function createCoverageIdentifier() {
  return '__coverage__';
}

// Function to instrument a given source code
function instrument(sourceCode, sourceMap, filename) {
  return babel.transform(sourceCode, {
    filename,
    plugins: [
      [babelPluginIstanbul, { inputSourceMap: sourceMap }],
    ],
  });
}

module.exports = babelPluginIstanbul;

// Example usage of the instrumentation function
const sourceCode = 'function hello() { return "Hello World"; }';
const { code } = instrument(sourceCode, null, 'hello.js');
console.log(code);

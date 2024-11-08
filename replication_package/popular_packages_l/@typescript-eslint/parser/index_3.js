// File: index.js
const { parse } = require('@typescript-eslint/typescript-estree');

/**
 * Function to parse TypeScript code to an AST.
 * @param {string} code - The TypeScript code to parse.
 * @param {object} options - Optional parser configuration.
 * @returns {object} - The AST representation of the code.
 */
function parseTypeScript(code, options = {}) {
  const parserOptions = {
    ecmaFeatures: { jsx: false, globalReturn: false, ...options.ecmaFeatures },
    ecmaVersion: 2018,
    jsxPragma: 'React',
    lib: ['es2018'],
    projectFolderIgnoreList: ['**/node_modules/**'],
    warnOnUnsupportedTypeScriptVersion: true,
    ...options,
    loc: true,
    range: true
  };

  try {
    const ast = parse(code, parserOptions);
    return ast;
  } catch (error) {
    console.error('Error parsing TypeScript:', error);
    throw error;
  }
}

module.exports = { parseTypeScript };

// Example usage:
// const { parseTypeScript } = require('./index');
// const code = "const a: number = 5;";
// const ast = parseTypeScript(code);
// console.log(ast);

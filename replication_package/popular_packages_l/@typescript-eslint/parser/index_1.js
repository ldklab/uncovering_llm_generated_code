// File: index.js
const { parse } = require('@typescript-eslint/typescript-estree');

/**
 * Function to parse TypeScript code to an AST.
 * @param {string} code - The TypeScript code to parse.
 * @param {object} [options={}] - Optional parser configuration.
 * @returns {object} - The AST representation of the code.
 */
function parseTypeScript(code, options = {}) {
  const defaultOptions = {
    ecmaFeatures: { jsx: false, globalReturn: false },
    ecmaVersion: 2018,
    jsxPragma: 'React',
    jsxFragmentName: null,
    lib: ['es2018'],
    projectFolderIgnoreList: ['**/node_modules/**'],
    warnOnUnsupportedTypeScriptVersion: true,
    createDefaultProgram: false,
  };

  const parserOptions = {
    ...defaultOptions,
    ...options,
    project: options.project || defaultOptions.project,
    tsconfigRootDir: options.tsconfigRootDir || defaultOptions.tsconfigRootDir,
    extraFileExtensions: options.extraFileExtensions || defaultOptions.extraFileExtensions,
  };

  try {
    const ast = parse(code, { ...parserOptions, loc: true, range: true });
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

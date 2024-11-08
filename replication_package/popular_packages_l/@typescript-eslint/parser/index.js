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
    ecmaFeatures: options.ecmaFeatures || { jsx: false, globalReturn: false },
    ecmaVersion: options.ecmaVersion || 2018,
    jsxPragma: options.jsxPragma || 'React',
    jsxFragmentName: options.jsxFragmentName || null,
    lib: options.lib || ['es2018'],
    project: options.project || undefined,
    projectFolderIgnoreList: options.projectFolderIgnoreList || ['**/node_modules/**'],
    tsconfigRootDir: options.tsconfigRootDir || undefined,
    extraFileExtensions: options.extraFileExtensions || undefined,
    warnOnUnsupportedTypeScriptVersion: 
      options.warnOnUnsupportedTypeScriptVersion !== undefined 
        ? options.warnOnUnsupportedTypeScriptVersion 
        : true,
    createDefaultProgram: options.createDefaultProgram || false,
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

const esprima = require('esprima');

/**
 * Check if the input string is a keyword.
 * @param {string} name - The string to check.
 * @returns {boolean} True if the string is a keyword, false otherwise.
 */
function isKeyword(name) {
  if (!name || typeof name !== 'string') return false;

  const keywords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 
    'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 
    'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 
    'var', 'void', 'while', 'with', 'yield', 'enum', 'await', 
    'implements', 'package', 'protected', 'static', 'interface', 
    'private', 'public'
  ];

  return keywords.includes(name);
}

/**
 * Check if the input string is a valid identifier.
 * @param {string} name - The string to check.
 * @returns {boolean} True if the string is a valid identifier, false otherwise.
 */
function isValidIdentifier(name) {
  if (!name || typeof name !== 'string') return false;

  try {
    esprima.parseScript(`${name} = 1;`);
    return !isKeyword(name);
  } catch (e) {
    return false;
  }
}

module.exports = {
  isKeyword,
  isValidIdentifier,
};

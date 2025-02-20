// This module uses the esprima library to validate JavaScript identifiers and check if a string is a reserved keyword.

/**
 * Check if the input string is a JavaScript keyword.
 * @param {string} name - The string to check.
 * @returns {boolean} True if the string is a keyword, false otherwise.
 */
function isKeyword(name) {
  // Return false if the input is not a valid string
  if (!name || typeof name !== 'string') return false;

  // List of reserved JavaScript keywords
  const keywords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 
    'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 
    'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 
    'var', 'void', 'while', 'with', 'yield', 'enum', 'await', 'implements', 
    'package', 'protected', 'static', 'interface', 'private', 'public'
  ];

  // Check if the input string is in the keyword list
  return keywords.includes(name);
}

/**
 * Check if the input string is a valid JavaScript identifier.
 * @param {string} name - The string to check.
 * @returns {boolean} True if the string is a valid identifier, false otherwise.
 */
function isValidIdentifier(name) {
  // Return false if the input is not a valid string
  if (!name || typeof name !== 'string') return false;

  try {
    // Parse the string using esprima to see if it's a valid identifier
    require('esprima').parseScript(`${name} = 1;`);
    // If it's not a keyword, then it's a valid identifier
    return !isKeyword(name);
  } catch (e) {
    // Return false if parsing fails, indicating an invalid identifier
    return false;
  }
}

// Export the methods to be used in other modules
module.exports = {
  isKeyword,
  isValidIdentifier,
};

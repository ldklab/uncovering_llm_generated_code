// Implementation of keyword and identifier validation using esprima package

const esprima = require('esprima'); // Importing esprima to parse and validate identifiers and keywords

/**
 * Checks if a given string is a JavaScript keyword.
 *
 * @param {string} name - The string to be checked.
 * @returns {boolean} - Returns true if the string is a JavaScript keyword, otherwise false.
 */
function isKeyword(name) {
  if (typeof name !== 'string') return false;

  const keywords = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 
    'debugger', 'default', 'delete', 'do', 'else', 'export', 
    'extends', 'finally', 'for', 'function', 'if', 'import', 
    'in', 'instanceof', 'new', 'return', 'super', 'switch', 
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 
    'with', 'yield', 'enum', 'await', 'implements', 'package', 
    'protected', 'static', 'interface', 'private', 'public'
  ]);

  return keywords.has(name);
}

/**
 * Checks if a given string is a valid identifier in JavaScript.
 *
 * @param {string} name - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid identifier and not a keyword, otherwise false.
 */
function isValidIdentifier(name) {
  if (typeof name !== 'string') return false;

  try {
    // Try parsing the string as a variable assignment to test identifier validity
    esprima.parseScript(`${name} = 1;`);
    return !isKeyword(name); // Ensure it's not a keyword
  } catch (e) {
    return false; // Parsing failed, not a valid identifier
  }
}

// Exporting the utility functions for external usage
module.exports = {
  isKeyword,
  isValidIdentifier,
};

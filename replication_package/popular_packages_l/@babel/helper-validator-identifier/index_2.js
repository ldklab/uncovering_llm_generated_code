// @babel/helper-validator-identifier package implementation

// Importing the esprima library to validate identifiers and keywords
const esprima = require('esprima');

/**
 * Determines whether a given string is a JavaScript keyword.
 * @param {string} name - The string to be checked.
 * @returns {boolean} Returns true if the string is a keyword, otherwise false.
 */
function isKeyword(name) {
  // Return false if the input is not a string or is an empty string
  if (!name || typeof name !== 'string') return false;
  
  // List of JavaScript reserved keywords
  const keywords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 
    'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 
    'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 
    'var', 'void', 'while', 'with', 'yield', 'enum', 'await', 'implements', 
    'package', 'protected', 'static', 'interface', 'private', 'public'
  ];

  // Checks if the given name is in the list of keywords
  return keywords.includes(name);
}

/**
 * Checks if the provided string is a valid JavaScript identifier.
 * @param {string} name - The string to be checked.
 * @returns {boolean} Returns true if the string is a valid identifier, otherwise false.
 */
function isValidIdentifier(name) {
  // Return false if the input is not a string or is an empty string
  if (!name || typeof name !== 'string') return false;

  try {
    // Parse the string with esprima to check for validity as an identifier
    esprima.parseScript(`${name} = 1;`);
    // Return true if it's a valid identifier and not a keyword
    return !isKeyword(name);
  } catch (e) {
    // If an error is caught, it means the parsing failed, so it's not a valid identifier
    return false;
  }
}

// Export the functions as part of the module
module.exports = {
  isKeyword,
  isValidIdentifier,
};

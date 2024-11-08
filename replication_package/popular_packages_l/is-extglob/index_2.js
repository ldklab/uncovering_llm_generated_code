// Functionality Explanation
// The `isExtglob` function checks whether a given string includes an extglob pattern.
// Extglob patterns in shell scripting include special operators: ?(pattern), *(pattern),
// +(pattern), @(pattern), !(pattern). The function utilizes a regular expression designed 
// to detect such patterns efficiently. It ensures that the input is a string and returns 
// a boolean indicating the presence of an extglob pattern.

function isExtglob(str) {
  // Ensure the input is a string
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  // Define the regular expression that matches extglob patterns.
  // It captures a sequence of characters that are or aren't preceded by a backslash,
  // followed by one of the extglob pattern operators with content within parentheses.
  const re = /(^|[^\\]+)(\?\(.*\)|\*\(.*\)|\+\(.*\)|@\(\.\*\)|!\(.+\))/;
  
  // Test the input string against the regular expression
  return re.test(str);
}

// Export the function for use in other modules
module.exports = isExtglob;

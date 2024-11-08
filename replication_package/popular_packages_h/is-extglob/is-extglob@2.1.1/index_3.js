module.exports = function isExtglob(str) {
  // Return false if input is not a string or is an empty string
  if (typeof str !== 'string' || str === '') {
    return false;
  }

  // Define a variable for storing regex matches
  let match;

  // Use a while loop to check for patterns in the string
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    // If an extglob pattern is found, return true
    if (match[2]) return true;
    // Slice the string to continue searching after the current match
    str = str.slice(match.index + match[0].length);
  }

  // If no extglob pattern is found, return false
  return false;
};

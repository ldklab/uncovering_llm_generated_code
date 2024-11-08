module.exports = function isExtglob(str) {
  if (typeof str !== 'string' || str === '') {
    return false; // Return false if the input is not a valid non-empty string
  }

  let regex = /(\\).|([@?!+*]\(.*\))/g;
  let match;

  while ((match = regex.exec(str))) { // Search for the extended glob patterns
    if (match[2]) {
      return true; // Return true if an extended glob pattern is found
    }
    str = str.slice(match.index + match[0].length); // Move past the current match
  }

  return false; // Return false if no extended glob patterns are found
};

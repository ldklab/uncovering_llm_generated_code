// Import the native toString method from Object.prototype
var toString = Object.prototype.toString;

// Export a function to check if a given variable is an array
module.exports = function (arr) {
  // Check if the native Array.isArray function exists and use it
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }
  // Fallback: Use toString comparison for environments where Array.isArray is not available
  return toString.call(arr) === '[object Array]';
};

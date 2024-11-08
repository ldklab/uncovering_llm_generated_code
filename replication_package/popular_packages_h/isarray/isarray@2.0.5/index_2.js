// Get the toString method from Object.prototype
const toString = Object.prototype.toString;

// Export a function to determine if a variable is an array
module.exports = function (arr) {
  if (typeof Array.isArray === 'function') {
    // Use the built-in Array.isArray method if it's available
    return Array.isArray(arr);
  } else {
    // Fallback: use toString to check the internal [[Class]] property
    return toString.call(arr) === '[object Array]';
  }
};

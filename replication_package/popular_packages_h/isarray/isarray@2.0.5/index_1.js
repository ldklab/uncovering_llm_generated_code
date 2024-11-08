// Reference to the built-in toString method
var toString = Object.prototype.toString;

// Export the module
module.exports = function(arr) {
  // Check if Array.isArray is available and use it, otherwise use the fallback method
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }
  // Fallback method using toString
  return toString.call(arr) === '[object Array]';
};

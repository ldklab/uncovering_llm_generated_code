// isarray.js
function isArray(value) {
  // Uses toString method to check if value is an Array
  return Object.prototype.toString.call(value) === '[object Array]';
}

// Export the isArray function from this module
module.exports = isArray;

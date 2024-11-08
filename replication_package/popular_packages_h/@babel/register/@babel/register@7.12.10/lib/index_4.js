// Import another module
const node = require("./node");

// Main function to be exported which calls 'register' function
function mainFunction(...args) {
  return register(...args);
}

// Assign main function to module.exports
module.exports = mainFunction;

// Mark the module as a module
module.exports.__esModule = true;

// Retrieve default export from 'node' module
const register = node.default;

// Copy all exports from the 'node' module onto the current module's exports
Object.assign(module.exports, node);

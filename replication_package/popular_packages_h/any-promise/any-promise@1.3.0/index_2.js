// Import the module located in './register' and immediately invoke it as a function
const registerModule = require('./register')();

// Export the 'Promise' property from the result of invoking the 'registerModule'
module.exports = registerModule.Promise;

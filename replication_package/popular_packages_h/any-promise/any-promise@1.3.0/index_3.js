const register = require('./register');

// Execute the function returned by the './register' module to get an object
const registerObject = register();

// Export the Promise attribute of the resulting object from invoking the function
module.exports = registerObject.Promise;

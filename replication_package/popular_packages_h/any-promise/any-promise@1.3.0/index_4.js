// Require the ./register module
const registerModule = require('./register');

// Invoke the function returned from require('./register')
const result = registerModule();

// Extract the Promise property from the result
const promiseExport = result.Promise;

// Export the Promise property
module.exports = promiseExport;

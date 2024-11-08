// Import the 'parse' function from the './parse' module
const parse = require('./parse');

// Import the 'stringify' function from the './stringify' module
const stringify = require('./stringify');

// Create an object named 'JSON5' to encompass the functionality
const JSON5 = {
    // Assign the imported parse function as a method of JSON5
    parse,
    // Assign the imported stringify function as a method of JSON5
    stringify,
};

// Export the JSON5 object as a module, making it accessible elsewhere
module.exports = JSON5;

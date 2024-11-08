// Import the relative method from the path module
const path = require('path');

// Get the current working directory
const fromPath = process.cwd();

// Get the directory of the current script
const toPath = __dirname;

// Calculate the relative path
const relativePath = path.relative(fromPath, toPath);

// Log the relative path
console.log(relativePath);

// Import the 'path' module, which provides utilities for working with file and directory paths.
const path = require('path');

// Get the directory name of the current module's file.
const currentDir = __dirname;

// Get the current working directory.
const currentWorkingDir = '.';

// Calculate the relative path from the current working directory to the directory of the script.
const relativePath = path.relative(currentWorkingDir, currentDir);

// Output the relative path between the two directories.
console.log(relativePath);

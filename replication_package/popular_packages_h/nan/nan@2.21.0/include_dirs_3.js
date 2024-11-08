const path = require('path');

// Get the current working directory
const currentDir = process.cwd();

// Get the directory name of the current module
const scriptDir = __dirname;

// Calculate the relative path from the current working directory to the script directory
const relativePath = path.relative(currentDir, scriptDir);

// Log the relative path to the console
console.log(relativePath);

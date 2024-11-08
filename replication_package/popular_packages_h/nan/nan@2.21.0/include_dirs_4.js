const path = require('path');

// Calculate the relative path from the current working directory to the script's directory
const relativePath = path.relative(process.cwd(), __dirname);

// Log the relative path to the console
console.log(relativePath);

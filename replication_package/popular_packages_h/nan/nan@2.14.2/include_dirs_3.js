const path = require('path');

// Calculate the relative path from the current directory to the script's directory
const relativePath = path.relative(process.cwd(), __dirname);

// Output the relative path
console.log(relativePath);

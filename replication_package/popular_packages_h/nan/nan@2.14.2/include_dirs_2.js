const path = require('path');

// Get the relative path from the current directory to the script's directory
const relativePath = path.relative(process.cwd(), __dirname);

// Output the relative path
console.log(relativePath);

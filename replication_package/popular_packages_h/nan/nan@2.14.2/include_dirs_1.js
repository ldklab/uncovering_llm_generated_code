const path = require('path');
const currentWorkingDirectory = '.';
const scriptDirectory = __dirname;
const relativePath = path.relative(currentWorkingDirectory, scriptDirectory);
console.log(relativePath);

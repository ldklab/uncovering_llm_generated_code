const path = require('path');

const currentDir = '.';
const scriptDir = __dirname;

const relativePath = path.relative(currentDir, scriptDir);

console.log(relativePath);

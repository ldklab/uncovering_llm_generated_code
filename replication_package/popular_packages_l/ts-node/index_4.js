// Programmatically using ts-node to run a TypeScript file
const tsNode = require('ts-node');
// Register ts-node to enable on-the-fly transpilation
tsNode.register();
// Require a TypeScript file to be run after registration
require('./some-typescript-file.ts');

// ts-node script execution example using shebang:
console.log("Hello, TypeScript World!");

// Using ts-node to transpile TypeScript files on-the-fly
const tsNode = require('ts-node');
tsNode.register();

// Require a TypeScript file for execution
require('./some-typescript-file.ts');

// Shebang example for executing the file directly with ts-node
// #!/usr/bin/env ts-node
console.log("Hello, TypeScript World!");

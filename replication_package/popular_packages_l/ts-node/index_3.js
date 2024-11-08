// Using ts-node programmatically
const tsNode = require('ts-node');
tsNode.register();
// Import a TypeScript file, which will be automatically transpiled
require('./some-typescript-file.ts');

// ts-node executable script example:
#!/usr/bin/env ts-node
console.log("Hello, TypeScript World!");

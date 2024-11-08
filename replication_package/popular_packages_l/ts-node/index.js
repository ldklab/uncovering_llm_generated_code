// Code example that uses ts-node programmatically
require('ts-node').register();
// Now require a TypeScript file, and it will be transpiled to JavaScript on-the-fly
require('./some-typescript-file.ts');

// ts-node executable script example:
#!/usr/bin/env ts-node
console.log("Hello, TypeScript World!");

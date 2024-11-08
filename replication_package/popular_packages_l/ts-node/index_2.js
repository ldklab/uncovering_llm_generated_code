markdown
// Import and register ts-node for programmatic TypeScript execution
require('ts-node/register');

// Import and execute a TypeScript file, transpiling it on-the-fly
require('./some-typescript-file.ts');

#!/usr/bin/env ts-node
// Executable TypeScript script logging a message to the console
console.log("Hello, TypeScript World!");

markdown
// The Node.js code is for a package setup and build system for a hypothetical AWS SDK core library. 
// The package.json file provides metadata about the package, includes build and lint scripts,
// and defines an export for a submodule located in the dist directory.
// The build.js script handles copying TypeScript files from the src/submodules folder to the dist directory, 
// converting them to JavaScript files to ensure they are ready for use.
// The .eslintrc.js file configures ESLint with TypeScript support, preventing relative imports.
// The src/submodules/sample/index.ts file contains a simple TypeScript function demonstrating a module export.

``json
{
  "name": "@aws-sdk/core",
  "version": "1.0.0",
  "description": "Core functionalities for AWS SDK for JavaScript (v3).",
  "main": "dist/index.js",
  "exports": {
    "./submodules/sample": "./dist/submodules/sample/index.js"
  },
  "scripts": {
    "build": "node build.js",
    "lint": "eslint ./src --fix"
  },
  "dependencies": {},
  "devDependencies": {
    "eslint": "^8.0.0",
    "typescript": "^4.5.2"
  }
}

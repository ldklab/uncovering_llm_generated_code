markdown
// File Structure:
// /package.json
// /src/submodules/exampleSubmodule/index.ts
// /src/submodules/exampleSubmodule/README.md
// /Inliner.js

// package.json
{
  "name": "@smithy/core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "exports": "./dist/submodules/exampleSubmodule/index.js",
  "scripts": {
    "build": "node Inliner.js",
    "lint": "eslint ./src"
  },
  "devDependencies": {
    "typescript": "^4.0.0",
    "eslint": "^7.0.0"
  }
}

// src/submodules/exampleSubmodule/index.ts
export function exampleFunction() {
  console.log('Example function from exampleSubmodule');
}

// src/submodules/exampleSubmodule/README.md
# Example Submodule
This is an example submodule of @smithy/core demonstrating organization and build structure.

// Inliner.js
const fs = require('fs-extra');
const path = require('path');

async function buildSubmodule() {
  const submodulePath = path.join(__dirname, 'src', 'submodules', 'exampleSubmodule');
  const distPath = path.join(__dirname, 'dist', 'submodules', 'exampleSubmodule');

  await fs.ensureDir(distPath);
  await fs.copyFile(
    path.join(submodulePath, 'index.ts'),
    path.join(distPath, 'index.js') // Simulating a simple copy for the example
  );
  console.log('Submodule built successfully.');
}

buildSubmodule().catch(err => console.error(err));

// .eslintrc
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    // Define any linting rules here
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/submodules/exampleSubmodule/**/*.ts"]
}

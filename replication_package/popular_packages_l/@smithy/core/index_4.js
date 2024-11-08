markdown
// File Structure:
// /package.json
// /src/submodules/exampleSubmodule/index.ts
// /src/submodules/exampleSubmodule/README.md
// /buildScript.js

// package.json
{
  "name": "@smithy/core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "exports": "./dist/submodules/exampleSubmodule/index.js",
  "scripts": {
    "build": "node buildScript.js",
    "lint": "eslint ./src"
  },
  "devDependencies": {
    "typescript": "^4.0.0",
    "eslint": "^7.0.0",
    "fs-extra": "^9.0.0"
  }
}

// src/submodules/exampleSubmodule/index.ts
export function exampleFunction() {
  console.log('Example function from exampleSubmodule');
}

// src/submodules/exampleSubmodule/README.md
# Example Submodule
This is an example submodule of @smithy/core demonstrating organization and build structure.

// buildScript.js
const fs = require('fs-extra');
const path = require('path');

async function build() {
  const sourceDir = path.resolve(__dirname, 'src', 'submodules', 'exampleSubmodule');
  const targetDir = path.resolve(__dirname, 'dist', 'submodules', 'exampleSubmodule');

  try {
    await fs.ensureDir(targetDir);
    await fs.copyFile(
      path.join(sourceDir, 'index.ts'),
      path.join(targetDir, 'index.js') // Simulated file copy
    );
    console.log('Submodule built successfully.');
  } catch (error) {
    console.error('Error building submodule:', error);
  }
}

build();

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

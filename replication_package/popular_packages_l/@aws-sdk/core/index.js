markdown
// Given explanation, here's a basic structure to implement the functionality in a Node.js package

// File: package.json
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
  "dependencies": {
    // Core dependencies
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "typescript": "^4.5.2"
  }
}

// File: build.js
const fs = require('fs');
const path = require('path');

function build() {
  const srcPath = path.resolve(__dirname, 'src');
  const distPath = path.resolve(__dirname, 'dist');

  if (!fs.existsSync(distPath)){
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Copy submodule contents to dist
  fs.readdirSync(path.join(srcPath, 'submodules')).forEach(module => {
    const moduleSrc = path.join(srcPath, 'submodules', module);
    const moduleDist = path.join(distPath, 'submodules', module);

    if (!fs.existsSync(moduleDist)){
      fs.mkdirSync(moduleDist, { recursive: true });
    }

    fs.copyFileSync(path.join(moduleSrc, 'index.ts'), path.join(moduleDist, 'index.js'));
  });
}

// Perform build logic
build();

// File: .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    'no-relative-imports': 'error'
  }
};

// File: src/submodules/sample/index.ts
// Sample submodule implementation
export const helloWorld = () => "Hello, World from @aws-sdk/core!";

// Note: Real implementation should follow AWS development practices with proper TypeScript setup, linting, testing, etc.

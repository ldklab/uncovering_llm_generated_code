markdown
// This Node.js code outlines the structure and basic functionalities of a package named "@aws-sdk/core". It includes a build process, linting configuration, and a sample implementation of a submodule.

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
  const srcDir = path.resolve(__dirname, 'src');
  const distDir = path.resolve(__dirname, 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Process each submodule
  fs.readdirSync(path.join(srcDir, 'submodules')).forEach(module => {
    const srcModulePath = path.join(srcDir, 'submodules', module);
    const distModulePath = path.join(distDir, 'submodules', module);

    if (!fs.existsSync(distModulePath)) {
      fs.mkdirSync(distModulePath, { recursive: true });
    }

    fs.copyFileSync(
      path.join(srcModulePath, 'index.ts'),
      path.join(distModulePath, 'index.js')
    );
  });
}

// Run build task
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

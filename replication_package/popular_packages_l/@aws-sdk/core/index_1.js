markdown
// The functionality of the original Node.js code is to set up a basic structure for a Node.js package with an example module, automate the build process, and configure a linter for TypeScript. The package is intended to provide core functionalities for an SDK. The build script copies TypeScript files from the source to the distribution directory, renaming them as JavaScript files. The ESLint configuration is set up to use the TypeScript parser and enforce a rule against relative imports. 

// Here is a possible rewrite of the code following the same functionality:

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
    // Add actual dependencies here
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

  const submodulesDir = path.join(srcDir, 'submodules');
  if (fs.existsSync(submodulesDir)) {
    fs.readdirSync(submodulesDir).forEach(moduleName => {
      const moduleSrcDir = path.join(submodulesDir, moduleName);
      const moduleDistDir = path.join(distDir, 'submodules', moduleName);

      if (!fs.existsSync(moduleDistDir)) {
        fs.mkdirSync(moduleDistDir, { recursive: true });
      }

      const srcFile = path.join(moduleSrcDir, 'index.ts');
      const distFile = path.join(moduleDistDir, 'index.js');
      fs.copyFileSync(srcFile, distFile);
    });
  }
}

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
export const helloWorld = () => "Hello, World from @aws-sdk/core!";

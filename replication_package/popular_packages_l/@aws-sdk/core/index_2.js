markdown
// This Node.js project includes core functionalities for the AWS SDK for JavaScript (v3). It is structured to build a basic library package with TypeScript support, linting via ESLint, and simple build scripts. The project uses a `build.js` script to prepare the distribution of TypeScript submodules as JavaScript files.

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
  "dependencies": {},
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

  const submodulesDir = 'submodules';
  const submodulesPath = path.join(srcDir, submodulesDir);
  fs.readdirSync(submodulesPath).forEach(module => {
    const moduleSrcPath = path.join(submodulesPath, module);
    const moduleDistPath = path.join(distDir, submodulesDir, module);

    if (!fs.existsSync(moduleDistPath)) {
      fs.mkdirSync(moduleDistPath, { recursive: true });
    }

    fs.copyFileSync(
      path.join(moduleSrcPath, 'index.ts'),
      path.join(moduleDistPath, 'index.js')
    );
  });
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

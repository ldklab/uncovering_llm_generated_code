json
// package.json
{
  "name": "simple-js-linter",
  "version": "1.0.0",
  "description": "A simple JavaScript file linter",
  "main": "app.js",
  "scripts": {
    "lint": "node app.js"
  },
  "dependencies": {},
  "type": "module"
}

// app.js
import { promises as fs } from 'fs';

const linterConfig = {
  rules: {
    "prefer-const": "warn",
    "no-constant-binary-expression": "error"
  },
  targets: ["**/*.js"] // Match JavaScript files
};

async function processFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    if (linterConfig.rules["prefer-const"] === "warn" && fileContent.includes("let ")) {
      console.warn(`Warning in ${filePath}: Use "const" instead of "let" where possible`);
    }
    
    if (linterConfig.rules["no-constant-binary-expression"] === "error" && /(\d+ [+\-*/] \d+)/.test(fileContent)) {
      console.error(`Error in ${filePath}: Avoid constant binary expressions.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

async function lintTargetFiles() {
  const dirFiles = await fs.readdir('.');
  for (const file of dirFiles) {
    if (linterConfig.targets.some(pattern => file.endsWith('.js'))) {
      await processFile(file);
    }
  }
}

lintTargetFiles();

// Usage Example:
// Save this configuration and run using `npm run lint`
// Ensure JavaScript files are present in the current directory to test the linter, e.g., sample.js

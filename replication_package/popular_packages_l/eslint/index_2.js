markdown
// package.json
{
  "name": "mini-eslint",
  "version": "1.0.0",
  "description": "A simple JavaScript linter",
  "main": "index.js",
  "scripts": {
    "lint": "node index.js"
  },
  "dependencies": {},
  "type": "module"
}

// index.js
import { promises as fs } from 'fs';

const config = {
  rules: {
    "prefer-const": "warn",
    "no-constant-binary-expression": "error"
  },
  files: ["**/*.js"] // pattern to match JavaScript files
};

async function lintFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    if (config.rules["prefer-const"] === "warn" && fileContent.includes("let ")) {
      console.warn(`Warning in ${filePath}: Consider using "const" instead of "let"`);
    }
    
    if (config.rules["no-constant-binary-expression"] === "error" && /(\d+ [+\-*/] \d+)/.test(fileContent)) {
      console.error(`Error in ${filePath}: Avoid constant binary expressions.`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Could not read file ${filePath}: ${error.message}`);
  }
}

async function lintAllFiles() {
  const directoryFiles = await fs.readdir('.');
  for (const fileName of directoryFiles) {
    if (config.files.some(pattern => fileName.endsWith('.js'))) {
      await lintFile(fileName);
    }
  }
}

lintAllFiles();

// Usage Example:
// Save this configuration and run using `npm run lint`
// Place a JavaScript file (e.g., script.js) in the same directory to test linting

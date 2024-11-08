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
  files: ["**/*.js"] // simple matching for JS files
};

async function lintFile(file) {
  try {
    const content = await fs.readFile(file, 'utf8');
    
    if (config.rules["prefer-const"] === "warn" && content.includes("let ")) {
      console.warn(`Warning in ${file}: Consider using "const" instead of "let"`);
    }
    
    if (config.rules["no-constant-binary-expression"] === "error" && /(\d+ [+\-*/] \d+)/.test(content)) {
      console.error(`Error in ${file}: Avoid constant binary expressions.`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`Could not read file ${file}: ${err.message}`);
  }
}

async function lintFiles() {
  const files = await fs.readdir('.');
  for (const file of files) {
    if (config.files.some(pattern => file.endsWith('.js'))) {
      await lintFile(file);
    }
  }
}

lintFiles();

// Usage Example:
// Save above configuration and run using `npm run lint`
// Place a JavaScript file in the same directory to test linting, e.g., test.js

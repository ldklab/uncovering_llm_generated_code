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
  files: ["**/*.js"]
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
    console.error(`Error reading file ${filePath}: ${error.message}`);
  }
}

async function lintFilesInDirectory() {
  const directoryFiles = await fs.readdir('.');
  for (const file of directoryFiles) {
    if (config.files.some(pattern => file.endsWith('.js'))) {
      await lintFile(file);
    }
  }
}

lintFilesInDirectory();

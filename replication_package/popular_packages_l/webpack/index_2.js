markdown
// File: package.json
{
  "name": "webpack-mock",
  "version": "1.0.0",
  "description": "A simple mock implementation of webpack bundling functionalities",
  "main": "index.js",
  "scripts": {
    "build": "node build.js"
  },
  "dependencies": {
    "babel-loader": "^8.2.5",
    "babel-core": "^6.26.3"
  }
}

// File: build.js
const fs = require('fs');
const path = require('path');
const babel = require('babel-core');

// Function to load the module by reading its content
function loadModule(modulePath) {
  const code = fs.readFileSync(modulePath, 'utf-8');
  console.log(`Loaded module: ${modulePath}`);
  return code;
}

// Function to bundle the loaded module
function bundle(entryModule) {
  const entryCode = loadModule(entryModule);

  // Transpile ES6+ code to ES5 using Babel
  const transpiled = babel.transform(entryCode, { presets: ["env"] });
  console.log(`Transpiled module:\n${transpiled.code}`);
  
  // Write the transpiled code to a bundle file
  fs.writeFileSync(path.join(__dirname, 'dist', 'bundle.js'), transpiled.code);

  console.log('Bundled code to dist/bundle.js');
}

// Ensure a 'dist' directory exists
if (!fs.existsSync('dist')){
  fs.mkdirSync('dist');
}

// Run the bundler with the entry module at the specified path
bundle(path.join(__dirname, 'src', 'index.js'));

// File: src/index.js
// Example script that prints a message
const message = "Hello, webpack!";
console.log(message);

// The setup uses Babel to transpile ES2015+ to ES5

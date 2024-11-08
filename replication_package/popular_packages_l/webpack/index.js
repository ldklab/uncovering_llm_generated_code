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

// Fake Loader Function
function loadModule(modulePath) {
  // Pretend to "load" a module by reading its contents
  const code = fs.readFileSync(modulePath, 'utf-8');
  console.log(`Loaded module: ${modulePath}`);
  return code;
}

// Fake Bundler Function
function bundle(entryModule) {
  const entryCode = loadModule(entryModule);

  // Transpile ES2015+ to ES5 with Babel (simple transpiling mock)
  const transpiled = babel.transform(entryCode, { presets: ["env"] });
  console.log(`Transpiled module:\n${transpiled.code}`);
  
  // Pretend to bundle the code (in reality, webpack does much more)
  fs.writeFileSync(path.join(__dirname, 'dist', 'bundle.js'), transpiled.code);

  console.log('Bundled code to dist/bundle.js');
}

// Create dist directory
if (!fs.existsSync('dist')){
  fs.mkdirSync('dist');
}

// Run the bundler with an example entry point (index.js)
bundle(path.join(__dirname, 'src', 'index.js'));

// File: src/index.js
// Example source module
const message = "Hello, webpack!";
console.log(message);

// Babel configuration (use babel-preset-env for ES6+ compilation)

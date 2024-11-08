markdown
// File: package.json
{
  "name": "webpack-mock",
  "version": "1.0.0",
  "description": "A mock of webpack bundling functionalities",
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

function loadModule(modulePath) {
  const code = fs.readFileSync(modulePath, 'utf-8');
  console.log(`Loaded module: ${modulePath}`);
  return code;
}

function bundle(entryModule) {
  const entryCode = loadModule(entryModule);
  const transpiled = babel.transform(entryCode, { presets: ["env"] });
  console.log(`Transpiled module:\n${transpiled.code}`);
  fs.writeFileSync(path.resolve(__dirname, 'dist', 'bundle.js'), transpiled.code);
  console.log('Bundled code to dist/bundle.js');
}

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

bundle(path.resolve(__dirname, 'src', 'index.js'));

// File: src/index.js
const message = "Hello, webpack!";
console.log(message);

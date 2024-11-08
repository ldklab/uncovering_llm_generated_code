json
// package.json
{
  "name": "babel-transform-runtime-demo",
  "version": "1.0.0",
  "description": "Demo for babel-plugin-transform-runtime functionality",
  "main": "index.js",
  "scripts": {
    "build": "babel src --out-dir lib"
  },
  "devDependencies": {
    "@babel/cli": "^7.0.0",
    "@babel/core": "^7.0.0",
    "@babel/plugin-transform-runtime": "^7.0.0",
    "@babel/preset-env": "^7.0.0"
  }
}

// .babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-runtime"]
}

// index.js (for demonstration purpose, located in src directory)
import fetch from 'node-fetch'; // if node-fetch is used for Node.js environment

async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

fetchData().then(data => {
  console.log(data);
}).catch(error => {
  console.error('Error fetching data:', error);
});

// Instructions
// To use the package and see the transform runtime:
// 1. Install dependencies: run `npm install`
// 2. Build the project: run `npm run build`
// Resulting transformed code will be in the 'lib' directory.

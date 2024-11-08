json
// package.json
{
  "name": "babel-transform-runtime-rewrite",
  "version": "1.0.0",
  "description": "Exemplification of using Babel's transform runtime plugin",
  "main": "index.js",
  "scripts": {
    "build": "babel source --out-dir output"
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

// index.js (located in the source directory for demonstration purposes)
async function requestData() {
  const outcome = await fetch('https://api.example.com/data');
  const result = await outcome.json();
  return result;
}

requestData().then(result => {
  console.log(result);
}).catch(err => {
  console.error('Data retrieval error:', err);
});

// Usage Instructions

// To get started, install all dependencies using
// npm install

// After setup, run the build script with Babel to observe the transform runtime optimizations
// npm run build

// The transpiled code can be found in the 'output' directory, showcasing the externalization of helper functions.

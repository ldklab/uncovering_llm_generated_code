markdown
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

// Instructions on using the package

// First, install dependencies by running
// npm install

// Then, build the project with Babel to see the transform runtime at work
// npm run build

// The transformed code will be in the 'lib' directory and will have externalized
// helper functions rather than inlined polyfills.

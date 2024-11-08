json
// package.json
{
  "name": "babel-transform-runtime-demo",
  "version": "1.0.0",
  "description": "Demo for the use of babel-plugin-transform-runtime to manage helper functions",
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

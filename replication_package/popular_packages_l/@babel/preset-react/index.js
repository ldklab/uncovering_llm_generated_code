json
{
  "name": "babel-preset-react-setup",
  "version": "1.0.0",
  "description": "A simple Node.js package to install and configure @babel/preset-react",
  "main": "index.js",
  "scripts": {
    "build": "babel src --out-dir lib --presets=@babel/preset-react"
  },
  "keywords": [
    "babel",
    "preset",
    "react",
    "jsx"
  ],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "@babel/core": "^7.21.0",
    "@babel/preset-react": "^7.18.6"
  },
  "devDependencies": {
    "@babel/cli": "^7.21.0"
  }
}

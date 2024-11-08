// Install the required packages
// Install packages by running: npm install webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-env --save-dev

// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // Main entry file
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  devServer: {
    static: './dist', // Static file location
    compress: true, // Enable file compression
    port: 8080, // Port for development server
    hot: true, // Enable Hot Module Replacement
    open: true, // Automatic browser launch
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Regex for JavaScript files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel for JavaScript files
        },
      },
    ],
  },
};

// package.json
{
  "name": "webpack-dev-server-example",
  "version": "1.0.0",
  "scripts": {
    "start": "webpack serve --config webpack.config.js" // Start server with Webpack
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^4.0.0",
    "webpack-dev-server": "^4.0.0",
    "babel-loader": "^8.0.0",
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0"
  }
}

// src/index.js
console.log('Hello, webpack-dev-server!');

// Run npm start to launch the development server.
```
// Install the required packages
// Run the following command to install webpack, webpack-cli, webpack-dev-server, babel-loader, @babel/core, and @babel/preset-env
// npm install webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-env --save-dev

// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry point of the application
  output: {
    filename: 'bundle.js', // Output bundle file name
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  devServer: {
    static: './dist', // Static files served from here
    compress: true, // Enable gzip compression
    port: 8080, // Server port number
    hot: true, // Hot Module Replacement
    open: true, // Opens the default browser
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply rule to .js files
        exclude: /node_modules/, // Exclude dependencies
        use: {
          loader: 'babel-loader', // Transpile JS files with Babel
        },
      },
    ],
  },
};

// package.json
{
  "name": "my-webpack-project",
  "version": "1.0.0",
  "scripts": {
    "serve": "webpack serve --config webpack.config.js" // Script to run the dev server
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

// To start the development server, use the command: npm run serve
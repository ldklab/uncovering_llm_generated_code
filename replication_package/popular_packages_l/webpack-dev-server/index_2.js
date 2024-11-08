// Install necessary packages using:
// npm install webpack webpack-cli webpack-dev-server --save-dev

// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry file of the application
  output: {
    filename: 'bundle.js', // Output bundle filename
    path: path.resolve(__dirname, 'dist') // Output directory
  },
  devServer: {
    static: './dist', // Serve static files from the dist directory
    compress: true, // Enable gzip compression
    port: 8080, // Port for the dev server
    hot: true, // Enable Hot Module Replacement
    open: true, // Open browser on server start
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Target JavaScript files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel loader
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

// Run `npm run serve` to start the development server.
```
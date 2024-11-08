// Install the required packages
// Run the following command to install webpack, webpack-cli and webpack-dev-server
// npm install webpack webpack-cli webpack-dev-server --save-dev

// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // The entry point for your application
  output: {
    filename: 'bundle.js', // The name of the output bundle
    path: path.resolve(__dirname, 'dist'), // The output directory
  },
  devServer: {
    static: './dist', // The directory where static files are served from
    compress: true, // Enable gzip compression for served files
    port: 8080, // Port number the server will listen to
    hot: true, // Enable Hot Module Replacement
    open: true, // Open the browser after the server starts
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel loader to transpile JavaScript files
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
    "serve": "webpack serve --config webpack.config.js" // Script to start the dev server
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

// Now you can run npm run serve to start the server.
```

This example setup provides a basic Webpack configuration with a development server allowing live reloading, compression, and automatic browser opening. Adjust paths and settings in `webpack.config.js` according to project structure and requirements.
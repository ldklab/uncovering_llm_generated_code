json
// package.json
{
  "name": "mini-css-extract-plugin-implementation",
  "version": "1.0.0",
  "description": "A simple implementation of the mini-css-extract-plugin functionality for webpack.",
  "main": "webpack.config.js",
  "scripts": {
    "build": "webpack --mode production",
    "start": "webpack serve --mode development --open"
  },
  "devDependencies": {
    "css-loader": "^6.5.1",
    "mini-css-extract-plugin": "^2.4.5",
    "webpack": "^5.64.4",
    "webpack-cli": "^4.9.1",
    "webpack-dev-server": "^4.6.0"
  }
}

// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    })
  ],
  devServer: {
    static: './dist',
    hot: true,
  },
};

// src/index.js
import './style.css';

// src/style.css
body {
  background-color: green;
}

// index.html
<!doctype html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="main.css" />
</head>
<body>
  <script src="bundle.js"></script>
</body>
</html>

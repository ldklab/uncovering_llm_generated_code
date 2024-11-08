// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/app.js',  // Entry point for your application
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),  // Using Dart Sass by default
              sourceMap: true,  // Generate source maps for easier debugging
              sassOptions: {
                indentWidth: 4,
                includePaths: [path.resolve(__dirname, 'src/styles')],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  devtool: 'source-map',  // Enable source map generation
};

// Source SCSS file - style.scss
/*
$body-color: red;

body {
  color: $body-color;
}

@import "bootstrap";
*/

// Application entry point - app.js
import './style.scss';

// Run the webpack build according to the configuration

// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/app.js',  // Main JavaScript file to bundle
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),  // Output directory for bundled files
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,  // Match SCSS and SASS files
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,  // Conditionally use loaders based on environment
          'css-loader',  // Resolves CSS imports
          {
            loader: 'sass-loader',  // Compiles SCSS to CSS
            options: {
              implementation: require('sass'),  // Use Dart Sass
              sourceMap: true,  // Enable source maps
              sassOptions: {
                indentWidth: 4,  // Set tab spaces for SASS
                includePaths: [path.resolve(__dirname, 'src/styles')],  // Include path for SASS imports
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',  // Output naming pattern for extracted CSS
      chunkFilename: '[id].css',  // Naming pattern for additional chunks
    }),
  ],
  devtool: 'source-map',  // Enable source map for better debugging
};

// style.scss example
/*
$body-color: red;

body {
  color: $body-color;
}

@import "bootstrap";  // Example of importing Bootstrap styles
*/

// app.js
import './style.scss';  // Import SCSS styles into the application

// Build command should be run according to this configuration

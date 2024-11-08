// Filename: webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // Entry point of the application
  entry: './src/index.js',

  // Output configuration
  output: {
    filename: 'bundle.js', // Name of the output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },

  module: {
    rules: [
      {
        // Rule to handle .less files
        test: /\.less$/i,
        use: [
          // Use 'style-loader' in development, 'mini-css-extract-plugin' in production
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          
          // Transform CSS into CommonJS
          {
            loader: 'css-loader',
            options: {
              sourceMap: true, // Generate source maps for better debugging
            },
          },

          // Compile Less to CSS
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true, // Require parentheses around math operations
                paths: [path.resolve(__dirname, 'node_modules')], // Less paths
              },
              additionalData: (content, loaderContext) => {
                // Prepend content to LESS files
                const { resourcePath } = loaderContext;
                if (resourcePath.endsWith('special.less')) {
                  return '@specialVar: 1;' + content;
                }
                return content;
              },
              sourceMap: true, // Enable source maps
              webpackImporter: true, // Enable webpack importing
              lessLogAsWarnOrErr: process.env.NODE_ENV === 'production', // Log issues as warnings or errors based on environment
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // Plugin to extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css', // Output filename for CSS
    }),
  ],

  resolve: {
    byDependency: {
      // Specific options for resolving Less dependencies
      less: {
        mainFiles: ['main'], // Main file preference
      },
    },
  },

  devtool: 'source-map', // Option for generating sourcemaps
};

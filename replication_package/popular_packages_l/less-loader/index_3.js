// This configuration file is for webpack, which is used to bundle JavaScript and other resources for a web application. 
// The functionality includes configuring entry and output points, handling LESS file compilation, and enabling features like source maps.

const path = require('path'); // Node.js path module to handle and transform file paths
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Plugin to extract CSS into separate files

// Export the webpack configuration object
module.exports = {
  // Entry point of the application
  entry: './src/index.js',
  
  // Output configuration; the bundled file will be named 'bundle.js' and located in the 'dist' directory
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  
  // Module rules for processing different file types
  module: {
    rules: [
      {
        // Rule to process .less files
        test: /\.less$/i,
        use: [
          // Depending on NODE_ENV, use 'style-loader' for development or 'MiniCssExtractPlugin.loader' for production
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          
          {
            // Uses 'css-loader' with source maps enabled
            loader: 'css-loader',
            options: {
              sourceMap: true, 
            },
          },
          {
            // Uses 'less-loader' with additional options
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true,  // Configure LESS strict math
                paths: [path.resolve(__dirname, 'node_modules')],  // LESS paths
              },
              // Add custom data for specific LESS files
              additionalData: (content, loaderContext) => {
                const { resourcePath } = loaderContext;
                if (resourcePath.endsWith('special.less')) {
                  return '@specialVar: 1;' + content;  // Adds a LESS variable definition
                }
                return content;
              },
              sourceMap: true,  // Enable source maps
              webpackImporter: true,  // Use webpack importer
              lessLogAsWarnOrErr: process.env.NODE_ENV === 'production',  // Log level for production
            },
          },
        ],
      },
    ],
  },
  
  // Plugins configuration
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',  // Output CSS filename
    }),
  ],
  
  // Resolve configuration for module resolution
  resolve: {
    byDependency: {
      less: {
        mainFiles: ['main'],  // Main files to resolve for LESS imports
      },
    },
  },
  
  // Configure source map generation
  devtool: 'source-map',
};

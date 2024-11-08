// Filename: webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js', // Entry point for the application
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        // Rule for .less files
        test: /\.less$/i,
        use: [
          // Use 'style-loader' in development, 'MiniCssExtractPlugin.loader' in production
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true, // Enables sourcemaps
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true, // Less option for strict math
                paths: [path.resolve(__dirname, 'node_modules')],
              },
              additionalData: (content, loaderContext) => {
                const { resourcePath } = loaderContext;
                // Inject @specialVar in 'special.less' files
                if (resourcePath.endsWith('special.less')) {
                  return '@specialVar: 1;' + content;
                }
                return content;
              },
              sourceMap: true, // Enables sourcemaps for LESS
              webpackImporter: true,
              lessLogAsWarnOrErr: process.env.NODE_ENV === 'production', // Custom logging for LESS
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css', // Output filename format for extracted CSS
    }),
  ],
  resolve: {
    byDependency: {
      less: {
        mainFiles: ['main'], // Entry file for LESS
      },
    },
  },
  devtool: 'source-map', // Enables source maps for better debugging
};

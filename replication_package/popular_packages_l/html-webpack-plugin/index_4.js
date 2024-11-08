const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Webpack configuration
module.exports = {
  // Entry point for the application
  entry: './src/index.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  // Plugins setup
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Example',
      template: './src/template.html',
      filename: 'index.html',
      favicon: './src/favicon.ico',
      meta: { description: 'Sample project using html-webpack-plugin' },
      inject: true,
      scriptLoading: 'defer',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    })
  ],

  // Development server configuration
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
  }
};

// Required modules import
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Webpack configuration
module.exports = {
  // Application's entry point
  entry: './src/index.js',
  
  // Output configuration for bundled files
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js' // Bundled file name
  },
  
  // Plugins
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Example', // HTML document title
      template: './src/template.html', // HTML template path
      filename: 'index.html', // Output HTML file
      favicon: './src/favicon.ico', // Favicon path
      meta: { description: 'Sample project using html-webpack-plugin' }, // Meta tags
      inject: true, // Asset injection
      scriptLoading: 'defer', // Defer script loading
      minify: {
        collapseWhitespace: true, // Collapse spaces
        removeComments: true // Remove comments
      } // Minification options
    })
  ],
  
  // Development server configuration
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve from 'dist'
    compress: true, // Enable compression
    port: 8080 // Server port
  }
};

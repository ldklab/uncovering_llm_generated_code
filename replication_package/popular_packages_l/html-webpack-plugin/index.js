// Import the required packages
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Define a simple Webpack configuration incorporating the HTML webpack plugin
module.exports = {
  // The entry point file that starts the application
  entry: './src/index.js',
  
  // Define where Webpack should output the bundled files
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js' // Name of the generated bundle
  },
  
  // Define the plugins to enhance Webpack with additional capabilities
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Example', // Title for the generated HTML document
      template: './src/template.html', // Path to custom HTML template
      filename: 'index.html', // Name of the output HTML file
      favicon: './src/favicon.ico', // Path to a favicon to include
      meta: {
        description: 'Sample project using html-webpack-plugin'
      }, // Meta tags to include in the HTML
      inject: true, // Automatically inject all assets into the template
      scriptLoading: 'defer', // Defer loading of JavaScript resources
      minify: {
        collapseWhitespace: true, // Minify the output HTML by collapsing whitespace
        removeComments: true // Remove HTML comments
      } // Options for minifying the output HTML
    })
  ],
  
  // Configuration for the development server
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve files from the 'dist' directory
    compress: true, // Enable gzip compression
    port: 8080 // Port to run the server on
  }
};

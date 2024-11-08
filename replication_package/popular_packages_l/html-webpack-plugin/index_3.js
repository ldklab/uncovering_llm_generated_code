const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Example',
      template: './src/template.html',
      filename: 'index.html',
      favicon: './src/favicon.ico',
      meta: {
        description: 'Sample project using html-webpack-plugin'
      },
      inject: true,
      scriptLoading: 'defer',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
  }
};

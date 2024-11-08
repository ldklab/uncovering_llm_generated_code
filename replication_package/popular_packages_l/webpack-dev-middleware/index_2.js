const express = require('express');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const path = require('path');

// Webpack Configuration
const webpackConfig = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  mode: 'development',
};

// Set up Webpack compiler
const compiler = webpack(webpackConfig);

// Initialize Express app
const app = express();

// Apply Webpack Dev Middleware
app.use(middleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
}));

// Define a sample API route
app.get('/api/data', (req, res) => {
  res.json({ data: 'This is some data' });
});

// Start the Express server
app.listen(3000, () => {
  console.log('App listening on port 3000');
});

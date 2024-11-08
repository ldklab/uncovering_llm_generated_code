const express = require('express');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const path = require('path');

// Sample Webpack Configuration
const webpackConfig = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  mode: 'development',
};

const compiler = webpack(webpackConfig);

const app = express();

// Use webpack-dev-middleware
const devMiddlewareOptions = {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
  // other options as per the user's need
};

app.use(middleware(compiler, devMiddlewareOptions));

// Example route to demonstrate non-Webpack requests
app.get('/api/data', (req, res) => {
  res.json({ data: 'This is some data' });
});

// Start the server
app.listen(3000, () => {
  console.log('App listening on port 3000');
});

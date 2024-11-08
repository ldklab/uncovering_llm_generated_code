const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');

// Define the Webpack Configuration
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  mode: 'development',
};

const compiler = webpack(config);

const app = express();

// Middleware setup to serve files through webpack-dev-middleware
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: 'minimal',
  })
);

// Route for handling sample API requests
app.get('/api/data', (req, res) => res.json({ data: 'This is some data' }));

// Start listening on port 3000
app.listen(3000, () => console.log('App listening on port 3000'));

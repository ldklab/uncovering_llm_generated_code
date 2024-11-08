const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');

// Webpack Configuration
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

// Apply webpack-dev-middleware
app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
}));

// Example API route
app.get('/api/data', (req, res) => {
  res.json({ data: 'This is some data' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

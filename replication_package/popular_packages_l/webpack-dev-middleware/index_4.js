const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');

const webpackConfig = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  mode: 'development',
};

const compiler = webpack(webpackConfig);

const app = express();

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: 'minimal',
  })
);

app.get('/api/data', (req, res) => {
  res.json({ data: 'This is some data' });
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});

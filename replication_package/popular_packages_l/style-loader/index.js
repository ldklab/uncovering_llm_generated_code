// style-loader/index.js
const path = require('path');
const { getOptions } = require('loader-utils');

function insertStyleIntoDOM(css, options) {
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  if (options.attributes) {
    Object.keys(options.attributes).forEach(attr => {
      styleTag.setAttribute(attr, options.attributes[attr]);
    });
  }

  styleTag.appendChild(document.createTextNode(css));
  const target = document.querySelector(options.insert || 'head');
  target.appendChild(styleTag);
}

module.exports = function(source) {
  const options = getOptions(this) || {};
  const esModule = options.esModule !== false;

  return `${esModule ? 'const' : 'var'} css = ${JSON.stringify(source)};
    (${insertStyleIntoDOM.toString()})(css, ${JSON.stringify(options)});
    export default css;`;
};

// webpack.config.js example
// Assuming `style-loader` is in your project directory, this showcases how to integrate it with webpack.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          devMode ? path.resolve(__dirname, './style-loader') : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                namedExport: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
};

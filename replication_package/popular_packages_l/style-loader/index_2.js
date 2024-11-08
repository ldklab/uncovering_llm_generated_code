// style-loader/index.js
const path = require('path');
const { getOptions } = require('loader-utils');

function insertStyleIntoDOM(css, options) {
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  if (options.attributes) {
    for (const [attr, value] of Object.entries(options.attributes)) {
      styleTag.setAttribute(attr, value);
    }
  }

  styleTag.appendChild(document.createTextNode(css));
  const target = document.querySelector(options.insert || 'head');
  target.appendChild(styleTag);
}

module.exports = function(source) {
  const options = getOptions(this) || {};
  const esModule = options.esModule !== false;

  return `
    ${esModule ? 'const' : 'var'} css = ${JSON.stringify(source)};
    (${insertStyleIntoDOM.toString()})(css, ${JSON.stringify(options)});
    export default css;
  `;
};

// webpack.config.js example
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
  plugins: devMode ? [] : [new MiniCssExtractPlugin()],
};

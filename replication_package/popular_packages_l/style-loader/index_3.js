// style-loader/index.js
const path = require('path');
const { getOptions } = require('loader-utils');

// This function inserts a given CSS string into the DOM as a <style> element.
function insertStyleIntoDOM(css, options) {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      styleElement.setAttribute(key, value);
    }
  }

  styleElement.appendChild(document.createTextNode(css));
  const targetElement = document.querySelector(options.insert || 'head');
  targetElement.appendChild(styleElement);
}

module.exports = function(source) {
  const options = getOptions(this) || {};
  const isEsModule = options.esModule !== false;

  const cssString = JSON.stringify(source);
  const insertFunctionString = insertStyleIntoDOM.toString();
  const optionsString = JSON.stringify(options);

  return `${isEsModule ? 'const' : 'var'} css = ${cssString};
    (${insertFunctionString})(css, ${optionsString});
    export default css;`;
};

// webpack.config.js example
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevMode = process.env.NODE_ENV !== 'production';

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          isDevMode ? path.resolve(__dirname, './style-loader') : MiniCssExtractPlugin.loader,
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
  plugins: isDevMode ? [] : [new MiniCssExtractPlugin()],
};

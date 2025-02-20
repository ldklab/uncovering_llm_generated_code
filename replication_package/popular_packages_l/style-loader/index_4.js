// style-loader/index.js
const path = require('path');
const { getOptions } = require('loader-utils');

/**
 * Inserts a CSS style string into the DOM, creating a <style> element and appending it
 * to a specified target in the document (default: <head>).
 * 
 * @param {string} css - The CSS content to insert into the DOM.
 * @param {object} options - Configuration options for the style insertion.
 */
function insertStyleIntoDOM(css, options) {
  const styleTag = document.createElement('style');
  styleTag.type = 'text/css';

  // Set additional attributes on the <style> tag if provided in the options
  if (options.attributes) {
    Object.keys(options.attributes).forEach(attr => {
      styleTag.setAttribute(attr, options.attributes[attr]);
    });
  }

  // Append CSS content and insert <style> into target element in the DOM
  styleTag.appendChild(document.createTextNode(css));
  const target = document.querySelector(options.insert || 'head');
  target.appendChild(styleTag);
}

module.exports = function(source) {
  const options = getOptions(this) || {};
  const esModule = options.esModule !== false;

  // Return JS code as a string to insert CSS into the DOM
  return `${esModule ? 'export' : 'module.exports ='} ${JSON.stringify(source)};
    (${insertStyleIntoDOM.toString()})(css, ${JSON.stringify(options)});
    export default css;`;
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
          // Use custom style-loader in development, or MiniCssExtractPlugin.loader in production
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

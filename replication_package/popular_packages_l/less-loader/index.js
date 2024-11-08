// Filename: webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader, // extracts CSS in production
          {
            loader: 'css-loader',
            options: {
              sourceMap: true, // enable sourcemap
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true, // example less option
                paths: [path.resolve(__dirname, 'node_modules')],
              },
              additionalData: (content, loaderContext) => {
                const { resourcePath } = loaderContext;
                if (resourcePath.endsWith('special.less')) {
                  return '@specialVar: 1;' + content;
                }
                return content;
              },
              sourceMap: true,
              webpackImporter: true,
              lessLogAsWarnOrErr: process.env.NODE_ENV === 'production',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    byDependency: {
      less: {
        mainFiles: ['main'],
      },
    },
  },
  devtool: 'source-map', // any "source-map"-like devtool
};

// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'postcss-preset-env'
                  ],
                },
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.style.js$/,
          use: [
            'style-loader',
            'css-loader',
            'babel-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  parser: 'postcss-js',
                },
                execute: true,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash].css' : '[name].css',
      }),
    ],
  };
};

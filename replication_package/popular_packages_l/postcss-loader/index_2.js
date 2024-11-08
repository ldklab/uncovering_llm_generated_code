// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const cssLoaders = [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    {
      loader: 'css-loader',
      options: { importLoaders: 1 },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            [
              'postcss-preset-env',
              {
                // plugin options
              },
            ],
          ],
        },
        sourceMap: true,
      },
    },
  ];

  const styleJsLoaders = [
    'style-loader',
    'css-loader',
    'babel-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: { parser: 'postcss-js' },
        execute: true,
      },
    },
  ];

  return {
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: cssLoaders,
        },
        {
          test: /\.style.js$/,
          use: styleJsLoaders,
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      }),
    ],
  };
};

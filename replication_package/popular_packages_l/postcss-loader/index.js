// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: { importLoaders: 1 },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  // Define your postcss plugins here
                  plugins: [
                    [
                      'postcss-preset-env',
                      {
                        // Plugin options
                      },
                    ],
                  ],
                },
                sourceMap: true, // Enable source maps if needed
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
        filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      }),
    ],
  };
};

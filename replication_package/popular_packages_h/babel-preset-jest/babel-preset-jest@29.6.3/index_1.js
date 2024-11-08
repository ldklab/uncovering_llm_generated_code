/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Define a configuration object for Jest's Babel transformations
const jestBabelConfig = {
  // List of Babel plugins to apply, resolving 'babel-plugin-jest-hoist'
  plugins: [require.resolve('babel-plugin-jest-hoist')],

  // List of Babel presets to apply, resolving 'babel-preset-current-node-syntax'
  presets: [require.resolve('babel-preset-current-node-syntax')],
};

// Babel requires the export to be a function, so export this function
module.exports = () => jestBabelConfig;

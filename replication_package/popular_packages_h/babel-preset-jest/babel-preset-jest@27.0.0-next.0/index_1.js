/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Define a configuration object for Jest with Babel
const jestBabelConfig = {
  plugins: [require.resolve('babel-plugin-jest-hoist')], // Plugin for hoisting jest.mock calls
  presets: [require.resolve('babel-preset-current-node-syntax')], // Preset for Node.js syntax compatibility
};

// Export a function that returns the Jest Babel configuration
module.exports = () => jestBabelConfig;

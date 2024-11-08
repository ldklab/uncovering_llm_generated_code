/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = function () {
  return {
    plugins: [require.resolve('babel-plugin-jest-hoist')],
    presets: [require.resolve('babel-preset-current-node-syntax')],
  };
};

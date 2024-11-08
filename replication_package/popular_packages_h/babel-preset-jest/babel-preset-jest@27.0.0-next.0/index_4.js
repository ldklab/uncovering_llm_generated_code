/**
 * Preset configuration for Babel used in a Node.js environment with Jest.
 */

const jestPresetConfig = {
  plugins: [
    require.resolve('babel-plugin-jest-hoist')
  ],
  presets: [
    require.resolve('babel-preset-current-node-syntax')
  ],
};

/**
 * Export a function that returns the jestPresetConfig object.
 * This is required by @babel/core.
 */
module.exports = function() {
  return jestPresetConfig;
};

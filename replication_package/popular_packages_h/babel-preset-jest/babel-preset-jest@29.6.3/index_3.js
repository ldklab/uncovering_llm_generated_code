const jestConfig = {
  plugins: [require.resolve('babel-plugin-jest-hoist')],
  presets: [require.resolve('babel-preset-current-node-syntax')],
};

module.exports = function() {
  return jestConfig;
};

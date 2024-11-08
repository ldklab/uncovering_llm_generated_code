const plugins = [require.resolve('babel-plugin-jest-hoist')];
const presets = [require.resolve('babel-preset-current-node-syntax')];

const jestPreset = {
  plugins,
  presets,
};

function getJestPreset() {
  return jestPreset;
}

module.exports = getJestPreset;

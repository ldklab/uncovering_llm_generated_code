// This is a mock implementation of the `babel-loader` package for transforming JavaScript files using Babel, with optional caching.

const babel = require('@babel/core');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function babelLoader(source, options, filename) {
  const babelOptions = {
    presets: options.presets || [],
    plugins: options.plugins || [],
    filename: filename,
  };

  if (options.cacheDirectory) {
    const cacheDir = typeof options.cacheDirectory === 'string'
      ? options.cacheDirectory
      : path.join(process.cwd(), 'node_modules/.cache/babel-loader');

    // Generate a unique cache key based on options and source
    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify(babelOptions) + source)
      .digest('hex');

    const cachePath = path.join(cacheDir, `${cacheKey}.js`);

    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath, 'utf-8');
    }

    const { code } = babel.transformSync(source, babelOptions);

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cachePath, code, 'utf-8');

    return code;
  }

  // Perform babel transformation if caching is not enabled
  return babel.transformSync(source, babelOptions).code;
}

module.exports = function loader(content) {
  const callback = this.async();
  const options = this.getOptions() || {};
  const filename = this.resourcePath;

  Promise.resolve(babelLoader(content, options, filename))
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

module.exports.custom = function(callback) {
  return callback(babel);
};

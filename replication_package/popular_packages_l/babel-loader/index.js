// A simplified mock implementation of `babel-loader` package

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

  // Check if caching is enabled
  if (options.cacheDirectory) {
    const cacheDir =
      options.cacheDirectory === true
        ? path.join(process.cwd(), 'node_modules/.cache/babel-loader')
        : options.cacheDirectory;

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

  return babel.transformSync(source, babelOptions).code;
}

module.exports = function loader(content) {
  const callback = this.async();
  const options = this.getOptions() || {};
  const filename = this.resourcePath;
  
  babelLoader(content, options, filename)
    .then(result => {
      callback(null, result);
    })
    .catch(err => {
      callback(err);
    });
};

module.exports.custom = function(callback) {
  return callback(babel);
};

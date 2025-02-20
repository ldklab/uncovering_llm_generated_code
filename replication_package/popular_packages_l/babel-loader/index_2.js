// A simplified mock implementation of `babel-loader` package

const babel = require('@babel/core');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Function to compile the source code using Babel with caching capabilities.
function babelLoader(source, options, filename) {
  const babelOptions = {
    presets: options.presets || [],
    plugins: options.plugins || [],
    filename: filename,
  };

  // Determine caching behavior
  if (options.cacheDirectory) {
    // Define cache directory path
    const cacheDir =
      options.cacheDirectory === true
        ? path.join(process.cwd(), 'node_modules/.cache/babel-loader')
        : options.cacheDirectory;

    // Generate a unique cache key based on the options and source
    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify(babelOptions) + source)
      .digest('hex');

    const cachePath = path.join(cacheDir, `${cacheKey}.js`);

    // Check if cached transformation exists
    if (fs.existsSync(cachePath)) {
      // Return cached transformed code
      return fs.readFileSync(cachePath, 'utf-8');
    }

    // Transform the source code using Babel
    const { code } = babel.transformSync(source, babelOptions);

    // Ensure the cache directory exists, and save the code
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cachePath, code, 'utf-8');

    return code;
  }

  // If no caching, just return the transformed source code
  return babel.transformSync(source, babelOptions).code;
}

// Webpack loader function
module.exports = function loader(content) {
  const callback = this.async();
  const options = this.getOptions() || {};
  const filename = this.resourcePath;
  
  // Apply babelLoader asynchronously and handle the result
  Promise.resolve(babelLoader(content, options, filename))
    .then(result => {
      callback(null, result);
    })
    .catch(err => {
      callback(err);
    });
};

// Export a custom function for further customization
module.exports.custom = function(callback) {
  return callback(babel);
};

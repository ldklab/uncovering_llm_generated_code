// Simplified mock implementation of a Babel loader
const babel = require('@babel/core');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Function to handle Babel transformation
function babelLoader(source, options, filename) {
  const babelOptions = {
    presets: options.presets || [],
    plugins: options.plugins || [],
    filename: filename,
  };

  // Handle cache logic if cacheDirectory is set
  if (options.cacheDirectory) {
    const cacheDir = options.cacheDirectory === true
      ? path.join(process.cwd(), 'node_modules/.cache/babel-loader')
      : options.cacheDirectory;

    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify(babelOptions) + source)
      .digest('hex');

    const cachePath = path.join(cacheDir, `${cacheKey}.js`);

    // Return cached output if exists
    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath, 'utf-8');
    }

    // Transform source code using Babel
    const { code } = babel.transformSync(source, babelOptions);
    
    // Ensure cache directory exists
    fs.mkdirSync(cacheDir, { recursive: true });
    
    // Save transformed code to cache
    fs.writeFileSync(cachePath, code, 'utf-8');

    return code;
  }

  // Fallback to direct Babel transformation without caching
  return babel.transformSync(source, babelOptions).code;
}

// Loader module export for integration with bundler tools
module.exports = function loader(content) {
  const callback = this.async();
  const options = this.getOptions() || {};
  const filename = this.resourcePath;

  // Utilize babelLoader function and handle async responses
  try {
    const result = babelLoader(content, options, filename);
    callback(null, result);
  } catch (err) {
    callback(err);
  }
};

// Custom Babel callback capability
module.exports.custom = function(callback) {
  return callback(babel);
};

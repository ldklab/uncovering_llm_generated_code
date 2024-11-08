const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

class CopyWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CopyWebpackPlugin', (compilation, callback) => {
      const context = compiler.options.context;
      const patterns = this.options.patterns || [];

      const processPatterns = patterns.map(pattern => this.processPattern(pattern, context, compilation));
      
      Promise.all(processPatterns)
        .then(() => callback())
        .catch(callback);
    });
  }

  processPattern(pattern, context, compilation) {
    const { from, to } = pattern;
    const absoluteFrom = path.resolve(context, from);
    const files = glob.sync(absoluteFrom);

    return Promise.all(files.map(file => this.copyAndTransform(file, to, compilation, pattern)));
  }

  copyAndTransform(from, to, compilation, pattern) {
    return new Promise((resolve, reject) => {
      fs.readFile(from, (err, content) => {
        if (err) return reject(err);

        let outputPath = path.join(to, path.basename(from));
        if (typeof to === 'function') {
          outputPath = to({ context: path.dirname(from), absoluteFilename: from });
        }

        // Transformation Step
        if (pattern.transform) {
          content = pattern.transform(content, from);
        }

        compilation.assets[outputPath] = {
          source: () => content,
          size: () => content.length,
        };

        resolve();
      });
    });
  }
}

module.exports = CopyWebpackPlugin;

// Usage in Webpack configuration:
// const CopyWebpackPlugin = require('./path-to-copy-webpack-plugin');

// module.exports = {
//   plugins: [
//     new CopyWebpackPlugin({
//       patterns: [
//         { from: 'source', to: 'dest' },
//         { from: 'other', to: 'public' },
//       ],
//     }),
//   ],
// };

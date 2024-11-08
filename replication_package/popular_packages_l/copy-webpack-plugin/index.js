const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

class CopyWebpackPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CopyWebpackPlugin', (compilation, callback) => {
      const context = compiler.options.context;
      const patterns = this.options.patterns || [];

      Promise.all(
        patterns.map(pattern =>
          this.handlePattern(pattern, context, compilation)
        )
      )
      .then(() => callback())
      .catch(callback);
    });
  }

  handlePattern(pattern, context, compilation) {
    const { from, to } = pattern;
    const absoluteFrom = path.resolve(context, from);
    const filesToCopy = glob.sync(absoluteFrom);

    return Promise.all(
      filesToCopy.map(file => this.copyFile(file, to, compilation, pattern))
    );
  }

  copyFile(from, to, compilation, pattern) {
    return new Promise((resolve, reject) => {
      fs.readFile(from, (err, content) => {
        if (err) return reject(err);

        const outputPath = typeof to === 'function' ?
          to({ context: path.dirname(from), absoluteFilename: from }) :
          path.join(to, path.basename(from));

        // Optional transform step
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

// Webpack configuration using CopyWebpackPlugin
// const CopyWebpackPlugin = require('./copy-webpack-plugin');

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

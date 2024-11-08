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

      Promise.all(patterns.map(pattern => this.processPattern(pattern, context, compilation)))
        .then(() => callback())
        .catch(callback);
    });
  }

  processPattern(pattern, context, compilation) {
    const { from, to } = pattern;
    const resolvedFrom = path.resolve(context, from);
    const matchedFiles = glob.sync(resolvedFrom);

    return Promise.all(matchedFiles.map(file => this.copyAndTransformFile(file, to, compilation, pattern)));
  }

  copyAndTransformFile(from, to, compilation, pattern) {
    return new Promise((resolve, reject) => {
      fs.readFile(from, (err, content) => {
        if (err) return reject(err);

        let targetPath = typeof to === 'function' ? to({ context: path.dirname(from), absoluteFilename: from }) : path.join(to, path.basename(from));

        if (pattern.transform) {
          content = pattern.transform(content, from);
        }

        compilation.assets[targetPath] = {
          source: () => content,
          size: () => content.length,
        };

        resolve();
      });
    });
  }
}

module.exports = CopyWebpackPlugin;

// Example Webpack configuration utilizing CopyWebpackPlugin
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

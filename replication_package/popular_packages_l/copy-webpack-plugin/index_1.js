const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

class CopyWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CopyWebpackPlugin', async (compilation, callback) => {
      try {
        const context = compiler.options.context;
        const patterns = this.options.patterns || [];

        await Promise.all(patterns.map(pattern => this.handlePattern(pattern, context, compilation)));

        callback();
      } catch (error) {
        callback(error);
      }
    });
  }

  async handlePattern(pattern, context, compilation) {
    const absoluteFrom = path.resolve(context, pattern.from);
    const filesToCopy = glob.sync(absoluteFrom);

    await Promise.all(filesToCopy.map(file => this.copyFile(file, pattern.to, compilation, pattern)));
  }

  copyFile(from, to, compilation, pattern) {
    return new Promise((resolve, reject) => {
      fs.readFile(from, (err, content) => {
        if (err) return reject(err);

        let outputPath;
        if (typeof to === 'function') {
          outputPath = to({ context: path.dirname(from), absoluteFilename: from });
        } else {
          outputPath = path.join(to, path.basename(from));
        }

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

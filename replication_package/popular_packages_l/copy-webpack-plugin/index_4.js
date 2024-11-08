const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

class SimpleCopyWebpackPlugin {
  constructor(options = {}) {
    this.patterns = options.patterns || [];
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('SimpleCopyWebpackPlugin', (compilation, callback) => {
      const context = compiler.options.context;

      const copyTasks = this.patterns.map(({ from, to, transform }) => {
        return this.executeCopy({ from, to, transform }, context, compilation);
      });

      Promise.all(copyTasks).then(() => callback()).catch(callback);
    });
  }

  async executeCopy({ from, to, transform }, context, compilation) {
    const absoluteFrom = path.resolve(context, from);
    const files = glob.sync(absoluteFrom);

    await Promise.all(
      files.map(filePath => this.readAndTransformFile(filePath, to, compilation, transform))
    );
  }

  readAndTransformFile(filePath, outputPath, compilation, transform) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, content) => {
        if (err) return reject(err);

        const fileName = path.basename(filePath);
        const output = typeof outputPath === 'function' ?
          outputPath({ context: path.dirname(filePath), absoluteFilename: filePath }) :
          path.join(outputPath, fileName);

        const transformedContent = transform ? transform(content, filePath) : content;

        compilation.assets[output] = {
          source: () => transformedContent,
          size: () => transformedContent.length,
        };

        resolve();
      });
    });
  }
}

module.exports = SimpleCopyWebpackPlugin;

// Usage Example
/*
const SimpleCopyWebpackPlugin = require('./simple-copy-webpack-plugin');

module.exports = {
  plugins: [
    new SimpleCopyWebpackPlugin({
      patterns: [
        { from: 'source', to: 'dest' },
        { from: 'other', to: 'public' },
      ],
    }),
  ],
};
*/

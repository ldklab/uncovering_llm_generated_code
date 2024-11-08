// terser-webpack-plugin/index.js

const { cpus } = require('os');
const { terserMinify } = require('terser');

class TerserPlugin {
  constructor(options = {}) {
    this.options = {
      test: /\.m?js(\?.*)?$/i,
      parallel: true,
      extractComments: true,
      terserOptions: {},
      ...options,
    };
  }

  apply(compiler) {
    const { test, include, exclude, parallel, minify, terserOptions, extractComments } = this.options;

    compiler.hooks.compilation.tap('TerserPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise('TerserPlugin', async (chunks) => {
        const files = {};

        chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            if (this.isFile(file, test, include, exclude)) {
              files[file] = compilation.assets[file];
            }
          });
        });

        const tasks = Object.keys(files).map((file) => async () => {
          const asset = files[file];
          const source = asset.source();

          let result;
          try {
            const minifyFunc = minify || terserMinify;
            result = await minifyFunc({ [file]: source }, null, terserOptions, extractComments);
          } catch (error) {
            compilation.errors.push(error);
            return;
          }

          // Update the asset with minified content
          compilation.assets[file] = {
            source: () => result.code,
            size: () => Buffer.byteLength(result.code, 'utf8'),
          };

          if (result.extractedComments && extractComments) {
            // Process extracted comments
            const commentsFile = `${file}.LICENSE.txt`;
            compilation.assets[commentsFile] = {
              source: () => result.extractedComments.join('\n\n'),
              size: () => result.extractedComments.reduce((sum, comment) => sum + comment.length + 2, 0),
            };
          }
        });

        const parallelCount = parallel === true ? cpus().length - 1 : parallel;
        await this.runTasksInParallel(tasks, parallelCount);
      });
    });
  }

  isFile(filename, test, include, exclude) {
    return (
      (!test || new RegExp(test).test(filename)) &&
      (!include || new RegExp(include).test(filename)) &&
      (!exclude || !new RegExp(exclude).test(filename))
    );
  }

  async runTasksInParallel(tasks, parallelCount) {
    const parallelTasks = tasks.splice(0, parallelCount);
    await Promise.all(parallelTasks.map((task) => task()));
    if (tasks.length > 0) {
      await this.runTasksInParallel(tasks, parallelCount);
    }
  }
}

module.exports = TerserPlugin;

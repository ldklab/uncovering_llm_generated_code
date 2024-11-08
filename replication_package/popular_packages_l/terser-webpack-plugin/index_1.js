// TerserWebpackPlugin.js

const { cpus } = require('os');
const { terserMinify } = require('terser');

class TerserWebpackPlugin {
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
    const {
      test,
      include,
      exclude,
      parallel,
      minify,
      terserOptions,
      extractComments,
    } = this.options;

    compiler.hooks.compilation.tap('TerserWebpackPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise(
        'TerserWebpackPlugin',
        async (chunks) => {
          const files = {};
          chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
              if (this.isFileEligible(file, test, include, exclude)) {
                files[file] = compilation.assets[file];
              }
            });
          });

          const tasks = Object.keys(files).map((file) => async () => {
            const asset = files[file];
            const sourceCode = asset.source();

            let result;
            try {
              const minifyFunction = minify || terserMinify;
              result = await minifyFunction(
                { [file]: sourceCode },
                null,
                terserOptions,
                extractComments
              );
            } catch (error) {
              compilation.errors.push(error);
              return;
            }

            compilation.assets[file] = {
              source: () => result.code,
              size: () => Buffer.byteLength(result.code, 'utf8'),
            };

            if (result.extractedComments && extractComments) {
              const commentsFile = `${file}.LICENSE.txt`;
              compilation.assets[commentsFile] = {
                source: () => result.extractedComments.join('\n\n'),
                size: () =>
                  result.extractedComments.reduce(
                    (sum, comment) => sum + comment.length + 2,
                    0
                  ),
              };
            }
          });

          const maxParallelTasks = parallel === true ? cpus().length - 1 : parallel;
          await this.executeTasksInParallel(tasks, maxParallelTasks);
        }
      );
    });
  }

  isFileEligible(filename, test, include, exclude) {
    return (
      (!test || new RegExp(test).test(filename)) &&
      (!include || new RegExp(include).test(filename)) &&
      (!exclude || !new RegExp(exclude).test(filename))
    );
  }

  async executeTasksInParallel(tasks, maxParallelTasks) {
    const currentBatch = tasks.splice(0, maxParallelTasks);
    await Promise.all(currentBatch.map((task) => task()));
    if (tasks.length > 0) {
      await this.executeTasksInParallel(tasks, maxParallelTasks);
    }
  }
}

module.exports = TerserWebpackPlugin;

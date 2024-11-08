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
    compiler.hooks.compilation.tap('TerserPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise('TerserPlugin', async (chunks) => {
        const tasks = chunks.reduce((acc, chunk) => {
          chunk.files.forEach((file) => {
            if (this.isFile(file)) {
              acc.push(() => this.minifyFile(compilation, file));
            }
          });
          return acc;
        }, []);

        const parallelCount = this.getParallelCount();
        await this.runTasksInParallel(tasks, parallelCount);
      });
    });
  }

  isFile(filename) {
    const { test, include, exclude } = this.options;
    return (!test || new RegExp(test).test(filename)) &&
           (!include || new RegExp(include).test(filename)) &&
           (!exclude || !new RegExp(exclude).test(filename));
  }

  async minifyFile(compilation, file) {
    const asset = compilation.assets[file];
    const source = asset.source();
    const { minify = terserMinify, terserOptions, extractComments } = this.options;
    
    let result;
    try {
      result = await minify({ [file]: source }, null, terserOptions, extractComments);
    } catch (error) {
      compilation.errors.push(error);
      return;
    }

    // Update the minified asset
    compilation.assets[file] = this.createAsset(result.code);

    // Handle extracted comments
    if (result.extractedComments && extractComments) {
      compilation.assets[`${file}.LICENSE.txt`] = this.createAsset(result.extractedComments.join('\n\n'));
    }
  }

  createAsset(source) {
    return {
      source: () => source,
      size: () => Buffer.byteLength(source, 'utf8'),
    };
  }

  getParallelCount() {
    const { parallel } = this.options;
    return parallel === true ? cpus().length - 1 : parallel;
  }

  async runTasksInParallel(tasks, parallelCount) {
    while (tasks.length > 0) {
      const parallelTasks = tasks.splice(0, parallelCount);
      await Promise.all(parallelTasks.map(task => task()));
    }
  }
}

module.exports = TerserPlugin;

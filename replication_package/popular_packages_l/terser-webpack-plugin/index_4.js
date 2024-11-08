const { cpus } = require('os');
const { terserMinify } = require('terser');

class TerserPlugin {
  constructor(options = {}) {
    this.options = { 
      test: /\.m?js(\?.*)?$/i, 
      parallel: true, 
      extractComments: true, 
      terserOptions: {}, 
      ...options 
    };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('TerserPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise('TerserPlugin', async (chunks) => {
        const filesToMinify = this.getFilesToMinify(chunks, compilation);
        const tasks = this.createMinifyTasks(filesToMinify, compilation);

        const parallelCount = this.calculateParallelCount();
        await this.runTasksInParallel(tasks, parallelCount);
      });
    });
  }

  getFilesToMinify(chunks, compilation) {
    const { test, include, exclude } = this.options;
    const files = {};

    for (const chunk of chunks) {
      for (const file of chunk.files) {
        if (this.isFile(file, test, include, exclude)) {
          files[file] = compilation.assets[file];
        }
      }
    }
    return files;
  }

  createMinifyTasks(filesToMinify, compilation) {
    const { minify, terserOptions, extractComments } = this.options;

    return Object.entries(filesToMinify).map(([file, asset]) => async () => {
      const source = asset.source();

      try {
        const minifyFunc = minify || terserMinify;
        const result = await minifyFunc({ [file]: source }, null, terserOptions, extractComments);
        
        compilation.assets[file] = this.createAsset(result.code);

        if (result.extractedComments && extractComments) {
          const commentsFile = `${file}.LICENSE.txt`;
          compilation.assets[commentsFile] = this.createAsset(result.extractedComments.join('\n\n'), true);
        }
      } catch (error) {
        compilation.errors.push(error);
      }
    });
  }

  createAsset(content, isCommentFile = false) {
    return {
      source: () => content,
      size: () => isCommentFile ? 
        content.split('\n\n').reduce((sum, comment) => sum + comment.length + 2, 0) : 
        Buffer.byteLength(content, 'utf8'),
    };
  }

  isFile(filename, test, include, exclude) {
    return (
      (!test || new RegExp(test).test(filename)) &&
      (!include || new RegExp(include).test(filename)) &&
      (!exclude || !new RegExp(exclude).test(filename))
    );
  }

  calculateParallelCount() {
    return this.options.parallel === true ? cpus().length - 1 : this.options.parallel;
  }

  async runTasksInParallel(tasks, parallelCount) {
    const activeTasks = tasks.splice(0, parallelCount);
    await Promise.all(activeTasks.map((task) => task()));
    if (tasks.length > 0) {
      await this.runTasksInParallel(tasks, parallelCount);
    }
  }
}

module.exports = TerserPlugin;

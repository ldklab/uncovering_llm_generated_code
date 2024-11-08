const fs = require('fs');

class EnhancedResolver {
  constructor(options = {}) {
    this.settings = {
      extensions: options.extensions || ['.js', '.json', '.node'],
      alias: options.alias || {},
      fileSystem: options.fileSystem || fs,
      plugins: options.plugins || [],
      ...options,
    };
  }

  resolve(context, directory, moduleName, callback) {
    this._runPlugins('before-resolve', { context, directory, moduleName }, err => {
      if (err) return callback(err);

      let resultPath;
      try {
        resultPath = this._synchronizeResolve(directory, moduleName);
      } catch (error) {
        return callback(error);
      }

      this._runPlugins('after-resolve', { context, directory: resultPath, moduleName }, err => {
        if (err) return callback(err);
        callback(null, resultPath);
      });
    });
  }

  _synchronizeResolve(directory, moduleName) {
    for (const ext of this.settings.extensions) {
      const candidatePath = `${directory}/${moduleName}${ext}`;
      if (this.settings.fileSystem.existsSync(candidatePath)) {
        return candidatePath;
      }
    }
    throw new Error(`Cannot resolve ${moduleName} in ${directory}`);
  }

  static create(options) {
    return new EnhancedResolver(options);
  }

  _runPlugins(hook, details, callback) {
    const applicablePlugins = this.settings.plugins.filter(plugin => plugin.isApplicable(hook));
    let index = 0;

    const proceed = (error) => {
      if (error || index === applicablePlugins.length) return callback(error);
      applicablePlugins[index++].execute(details, proceed);
    };

    proceed();
  }
}

class ResolverPlugin {
  constructor(sources, target) {
    this.sources = sources;
    this.target = target;
  }

  isApplicable(hook) {
    return this.sources.includes(hook);
  }

  execute(details, callback) {
    // Implement specific plugin behavior here
    callback();
  }
}

module.exports = {
  EnhancedResolver,
  ResolverPlugin,
};

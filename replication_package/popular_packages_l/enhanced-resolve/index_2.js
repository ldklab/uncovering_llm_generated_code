const fs = require('fs');

class EnhancedResolve {
  constructor(config = {}) {
    this.config = {
      extensions: config.extensions || ['.js', '.json', '.node'],
      alias: config.alias || {},
      fileSystem: config.fileSystem || fs,
      plugins: config.plugins || [],
      ...config,
    };
  }

  resolve(context, basePath, moduleName, callback) {
    this._triggerPlugins('before-resolve', { context, basePath, moduleName }, error => {
      if (error) return callback(error);

      let finalPath;
      try {
        finalPath = this._resolvePath(basePath, moduleName);
      } catch (error) {
        return callback(error);
      }

      this._triggerPlugins('after-resolve', { context, basePath: finalPath, moduleName }, error => {
        if (error) return callback(error);
        callback(null, finalPath);
      });
    });
  }

  _resolvePath(basePath, moduleName) {
    for (const extension of this.config.extensions) {
      const pathToCheck = `${basePath}/${moduleName}${extension}`;
      if (this.config.fileSystem.existsSync(pathToCheck)) {
        return pathToCheck;
      }
    }
    throw new Error(`Cannot resolve module '${moduleName}' in '${basePath}'`);
  }

  static create(config) {
    return new EnhancedResolve(config);
  }

  _triggerPlugins(hookName, data, callback) {
    const applicablePlugins = this.config.plugins.filter(plugin => plugin.shouldApply(hookName));
    let currentIndex = 0;

    const moveNext = (error) => {
      if (error || currentIndex === applicablePlugins.length) return callback(error);
      applicablePlugins[currentIndex++].execute(data, moveNext);
    };

    moveNext();
  }
}

class SamplePlugin {
  constructor(hookTargets, destination) {
    this.hookTargets = hookTargets;
    this.destination = destination;
  }

  shouldApply(hookName) {
    return this.hookTargets.includes(hookName);
  }

  execute(data, callback) {
    callback();
  }
}

module.exports = {
  EnhancedResolve,
  SamplePlugin,
};

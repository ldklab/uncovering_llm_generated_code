const fs = require('fs');

class EnhancedResolve {
  constructor(options = {}) {
    this.options = {
      extensions: options.extensions || ['.js', '.json', '.node'],
      alias: options.alias || {},
      fileSystem: options.fileSystem || fs,
      plugins: options.plugins || [],
      ...options,
    };
  }

  resolve(context, path, request, callback) {
    this._applyPlugins('before-resolve', { context, path, request }, err => {
      if (err) return callback(err);

      let resolvedPath;
      try {
        resolvedPath = this._resolveSync(path, request);
      } catch (err) {
        return callback(err);
      }

      this._applyPlugins('after-resolve', { context, path: resolvedPath, request }, err => {
        if (err) return callback(err);
        callback(null, resolvedPath);
      });
    });
  }

  _resolveSync(path, request) {
    for (const ext of this.options.extensions) {
      const potentialPath = `${path}/${request}${ext}`;
      if (this.options.fileSystem.existsSync(potentialPath)) {
        return potentialPath;
      }
    }
    throw new Error(`Cannot resolve ${request} in ${path}`);
  }

  static create(options) {
    return new EnhancedResolve(options);
  }

  _applyPlugins(hookName, data, callback) {
    const plugins = this.options.plugins.filter(plugin => plugin.appliesTo(hookName));
    let index = 0;

    const next = (err) => {
      if (err || index === plugins.length) return callback(err);
      plugins[index++].apply(data, next);
    };

    next();
  }
}

class SamplePlugin {
  constructor(sources, target) {
    this.sources = sources;
    this.target = target;
  }

  appliesTo(hookName) {
    return this.sources.includes(hookName);
  }

  apply(data, callback) {
    callback();
  }
}

module.exports = {
  EnhancedResolve,
  SamplePlugin,
};

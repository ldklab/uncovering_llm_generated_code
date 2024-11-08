const fs = require('fs');

class EnhancedResolver {
  constructor(options = {}) {
    this.config = {
      extensions: options.extensions || ['.js', '.json', '.node'],
      alias: options.alias || {},
      fileSystem: options.fileSystem || fs,
      plugins: options.plugins || [],
      ...options
    };
  }

  resolve(context, path, request, callback) {
    this.executePlugins('pre-resolve', { context, path, request }, (err) => {
      if (err) return callback(err);

      let resolved;
      try {
        resolved = this.syncResolve(path, request);
      } catch (error) {
        return callback(error);
      }

      this.executePlugins('post-resolve', { context, path: resolved, request }, (err) => {
        if (err) return callback(err);
        callback(null, resolved);
      });
    });
  }

  syncResolve(dir, request) {
    for (const extension of this.config.extensions) {
      const filePath = `${dir}/${request}${extension}`;
      if (this.config.fileSystem.existsSync(filePath)) {
        return filePath;
      }
    }
    throw new Error(`Cannot resolve ${request} in ${dir}`);
  }

  static instantiate(options) {
    return new EnhancedResolver(options);
  }

  executePlugins(hook, data, callback) {
    const activePlugins = this.config.plugins.filter(p => p.isApplicable(hook));
    let currentIndex = 0;

    const next = (error) => {
      if (error || currentIndex === activePlugins.length) return callback(error);
      activePlugins[currentIndex++].apply(data, next);
    };

    next();
  }
}

class Plugin {
  constructor(hooks, target) {
    this.hooks = hooks;
    this.target = target;
  }

  isApplicable(hook) {
    return this.hooks.includes(hook);
  }

  apply(data, next) {
    // Plugin logic here
    next();
  }
}

module.exports = {
  EnhancedResolver,
  Plugin
};

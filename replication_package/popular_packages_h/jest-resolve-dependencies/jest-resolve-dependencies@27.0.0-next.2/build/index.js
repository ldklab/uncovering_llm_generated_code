'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DependencyResolver = void 0;

function path() {
  const data = _interopRequireWildcard(require('path'));

  path = function () {
    return data;
  };

  return data;
}

function _jestSnapshot() {
  const data = require('jest-snapshot');

  _jestSnapshot = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * DependencyResolver is used to resolve the direct dependencies of a module or
 * to retrieve a list of all transitive inverse dependencies.
 */
class DependencyResolver {
  constructor(resolver, hasteFS, snapshotResolver) {
    _defineProperty(this, '_hasteFS', void 0);

    _defineProperty(this, '_resolver', void 0);

    _defineProperty(this, '_snapshotResolver', void 0);

    this._resolver = resolver;
    this._hasteFS = hasteFS;
    this._snapshotResolver = snapshotResolver;
  }

  resolve(file, options) {
    const dependencies = this._hasteFS.getDependencies(file);

    if (!dependencies) {
      return [];
    }

    return dependencies.reduce((acc, dependency) => {
      if (this._resolver.isCoreModule(dependency)) {
        return acc;
      }

      let resolvedDependency;
      let resolvedMockDependency;

      try {
        resolvedDependency = this._resolver.resolveModule(
          file,
          dependency,
          options
        );
      } catch {
        try {
          resolvedDependency = this._resolver.getMockModule(file, dependency);
        } catch {
          // leave resolvedDependency as undefined if nothing can be found
        }
      }

      if (!resolvedDependency) {
        return acc;
      }

      acc.push(resolvedDependency); // If we resolve a dependency, then look for a mock dependency
      // of the same name in that dependency's directory.

      try {
        resolvedMockDependency = this._resolver.getMockModule(
          resolvedDependency,
          path().basename(dependency)
        );
      } catch {
        // leave resolvedMockDependency as undefined if nothing can be found
      }

      if (resolvedMockDependency) {
        const dependencyMockDir = path().resolve(
          path().dirname(resolvedDependency),
          '__mocks__'
        );
        resolvedMockDependency = path().resolve(resolvedMockDependency); // make sure mock is in the correct directory

        if (dependencyMockDir === path().dirname(resolvedMockDependency)) {
          acc.push(resolvedMockDependency);
        }
      }

      return acc;
    }, []);
  }

  resolveInverseModuleMap(paths, filter, options) {
    if (!paths.size) {
      return [];
    }

    const collectModules = (related, moduleMap, changed) => {
      const visitedModules = new Set();
      const result = [];

      while (changed.size) {
        changed = new Set(
          moduleMap.reduce((acc, module) => {
            if (
              visitedModules.has(module.file) ||
              !module.dependencies.some(dep => changed.has(dep))
            ) {
              return acc;
            }

            const file = module.file;

            if (filter(file)) {
              result.push(module);
              related.delete(file);
            }

            visitedModules.add(file);
            acc.push(file);
            return acc;
          }, [])
        );
      }

      return result.concat(
        Array.from(related).map(file => ({
          dependencies: [],
          file
        }))
      );
    };

    const relatedPaths = new Set();
    const changed = new Set();

    for (const path of paths) {
      if (this._hasteFS.exists(path)) {
        const modulePath = (0, _jestSnapshot().isSnapshotPath)(path)
          ? this._snapshotResolver.resolveTestPath(path)
          : path;
        changed.add(modulePath);

        if (filter(modulePath)) {
          relatedPaths.add(modulePath);
        }
      }
    }

    const modules = [];

    for (const file of this._hasteFS.getAbsoluteFileIterator()) {
      modules.push({
        dependencies: this.resolve(file, options),
        file
      });
    }

    return collectModules(relatedPaths, modules, changed);
  }

  resolveInverse(paths, filter, options) {
    return this.resolveInverseModuleMap(paths, filter, options).map(
      module => module.file
    );
  }
}

exports.DependencyResolver = DependencyResolver;

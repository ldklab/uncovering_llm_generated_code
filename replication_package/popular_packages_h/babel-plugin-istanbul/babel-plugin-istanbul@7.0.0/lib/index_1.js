"use strict";

// Import dependencies
const path = require("path");
const { realpathSync } = require("fs");
const { execFileSync } = require("child_process");
const { declare } = require("@babel/helper-plugin-utils");
const { programVisitor } = require("istanbul-lib-instrument");
const TestExclude = require("test-exclude");
const schema = require("@istanbuljs/schema");

// Function to resolve realpath
function getRealpath(n) {
  try {
    return realpathSync(n) || n;
  } catch {
    return n;
  }
}

// Memoization map to store loaded configurations
const memoize = new Map();

// Memoization separator based on OS
const memosep = path.sep === '/' ? ':' : ';';

// Load NYC configuration, utilizing memoization
function loadNycConfig(cwd, opts) {
  let memokey = cwd;
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];
  if (opts.nycrcPath) {
    args.push(opts.nycrcPath);
    memokey += memosep + opts.nycrcPath;
  }

  if (memoize.has(memokey)) {
    return memoize.get(memokey);
  }

  const result = JSON.parse(execFileSync(process.execPath, args));
  const error = result['load-nyc-config-sync-error'];
  if (error) {
    throw new Error(error);
  }

  const config = {
    ...schema.defaults.babelPluginIstanbul,
    cwd,
    ...result
  };
  memoize.set(memokey, config);
  return config;
}

// Function to find NYC configuration
function findConfig(opts) {
  const cwd = getRealpath(opts.cwd || process.env.NYC_CWD || process.cwd());
  const keys = Object.keys(opts);
  const ignoredKeys = ['nycrcPath', 'cwd'];

  const explicitlyConfigured = keys.filter((s) => !ignoredKeys.includes(s));
  if (explicitlyConfigured.length) {
    return { ...schema.defaults.babelPluginIstanbul, cwd, ...opts };
  }

  if (!ignoredKeys.some((k) => keys.includes(k)) && process.env.NYC_CONFIG) {
    return JSON.parse(process.env.NYC_CONFIG);
  }

  return loadNycConfig(cwd, opts);
}

// Function to create shouldSkip decision-making function
function makeShouldSkip() {
  let exclude;
  return function shouldSkip(file, nycConfig) {
    if (!exclude || exclude.cwd !== nycConfig.cwd) {
      exclude = new TestExclude({
        cwd: nycConfig.cwd,
        include: nycConfig.include,
        exclude: nycConfig.exclude,
        extension: nycConfig.extension,
        excludeNodeModules: nycConfig.excludeNodeModules !== false
      });
    }
    return !exclude.shouldInstrument(file);
  };
}

// Main export - Babel Plugin
module.exports = declare((api) => {
  api.assertVersion(7);
  const shouldSkip = makeShouldSkip();
  const t = api.types;

  return {
    visitor: {
      Program: {
        enter(path) {
          this.__dv__ = null;
          this.nycConfig = findConfig(this.opts);
          const realPath = getRealpath(this.file.opts.filename);

          if (shouldSkip(realPath, this.nycConfig)) {
            return;
          }

          let inputSourceMap = this.opts.inputSourceMap;
          if (this.opts.useInlineSourceMaps !== false && !inputSourceMap && this.file.inputMap) {
            inputSourceMap = this.file.inputMap.sourcemap;
          }

          const visitorOptions = {};
          for (const [name, defaultValue] of Object.entries(schema.defaults.instrumentVisitor)) {
            visitorOptions[name] = this.nycConfig[name] || defaultValue;
          }

          this.__dv__ = programVisitor(t, realPath, {
            ...visitorOptions,
            inputSourceMap
          });
          this.__dv__.enter(path);
          path.scope.crawl();
        },
        exit(path) {
          if (!this.__dv__) {
            return;
          }
          const result = this.__dv__.exit(path);
          if (this.opts.onCover) {
            this.opts.onCover(getRealpath(this.file.opts.filename), result.fileCoverage);
          }
        }
      }
    }
  };
});

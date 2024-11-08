"use strict";

const { default: path } = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { declare } = require("@babel/helper-plugin-utils");
const { programVisitor } = require("istanbul-lib-instrument");
const { default: TestExclude } = require("test-exclude");
const { default: schema } = require("@istanbuljs/schema");

function getRealpath(n) {
  try {
    return fs.realpathSync(n) || n;
  } catch (e) {
    return n;
  }
}

const memoize = new Map();
const memoSep = path.sep === '/' ? ':' : ';';

function loadNycConfig(cwd, opts) {
  let memoKey = cwd;
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];
  if ('nycrcPath' in opts) {
    args.push(opts.nycrcPath);
    memoKey += memoSep + opts.nycrcPath;
  }

  if (memoize.has(memoKey)) {
    return memoize.get(memoKey);
  }
  const result = JSON.parse(execFileSync(process.execPath, args));
  const error = result['load-nyc-config-sync-error'];
  if (error) {
    throw new Error(error);
  }
  const config = { ...schema.defaults.babelPluginIstanbul, cwd, ...result };
  memoize.set(memoKey, config);
  return config;
}

function findConfig(opts) {
  const cwd = getRealpath(opts.cwd || process.env.NYC_CWD || process.cwd());
  const keys = Object.keys(opts);
  const ignored = Object.keys(opts).filter(s => s === 'nycrcPath' || s === 'cwd');
  
  if (keys.length > ignored.length) {
    return { ...schema.defaults.babelPluginIstanbul, cwd, ...opts };
  }
  if (ignored.length === 0 && process.env.NYC_CONFIG) {
    return JSON.parse(process.env.NYC_CONFIG);
  }
  return loadNycConfig(cwd, opts);
}

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

module.exports = declare(api => {
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

          let { inputSourceMap } = this.opts;
          if (this.opts.useInlineSourceMaps !== false) {
            if (!inputSourceMap && this.file.inputMap) {
              inputSourceMap = this.file.inputMap.sourcemap;
            }
          }

          const visitorOptions = {};
          Object.entries(schema.defaults.instrumentVisitor).forEach(([name, defaultValue]) => {
            visitorOptions[name] = name in this.nycConfig ? this.nycConfig[name] : defaultValue;
          });

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

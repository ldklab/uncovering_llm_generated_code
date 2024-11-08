"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { declare } = require("@babel/helper-plugin-utils");
const { programVisitor } = require("istanbul-lib-instrument");
const TestExclude = require("test-exclude");
const schema = require("@istanbuljs/schema");

function getRealpath(filePath) {
  try {
    return fs.realpathSync(filePath) || filePath;
  } catch (error) {
    return filePath;
  }
}

const memoize = new Map();
const memosep = path.sep === '/' ? ':' : ';';

function loadNycConfig(cwd, options) {
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];
  let memokey = cwd;

  if (options.nycrcPath) {
    args.push(options.nycrcPath);
    memokey += memosep + options.nycrcPath;
  }

  if (memoize.has(memokey)) {
    return memoize.get(memokey);
  }

  const result = JSON.parse(execFileSync(process.execPath, args));
  if (result['load-nyc-config-sync-error']) {
    throw new Error(result['load-nyc-config-sync-error']);
  }

  const config = { 
    ...schema.defaults.babelPluginIstanbul, 
    cwd, 
    ...result 
  };
  
  memoize.set(memokey, config);
  return config;
}

function findConfig(options) {
  const cwd = getRealpath(options.cwd || process.env.NYC_CWD || process.cwd());
  const keys = Object.keys(options);

  if (keys.some(key => !['nycrcPath', 'cwd'].includes(key))) {
    return {
      ...schema.defaults.babelPluginIstanbul,
      cwd,
      ...options
    };
  }

  if (process.env.NYC_CONFIG) {
    return JSON.parse(process.env.NYC_CONFIG);
  }

  return loadNycConfig(cwd, options);
}

function makeShouldSkip() {
  let excludeInstance;
  
  return function shouldSkip(file, nycConfig) {
    if (!excludeInstance || excludeInstance.cwd !== nycConfig.cwd) {
      excludeInstance = new TestExclude({
        cwd: nycConfig.cwd,
        include: nycConfig.include,
        exclude: nycConfig.exclude,
        extension: nycConfig.extension,
        excludeNodeModules: nycConfig.excludeNodeModules !== false
      });
    }
    
    return !excludeInstance.shouldInstrument(file);
  };
}

exports.default = declare(api => {
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
            inputSourceMap = inputSourceMap || this.file.inputMap?.sourcemap;
          }

          const visitorOptions = {};
          Object.entries(schema.defaults.instrumentVisitor).forEach(([name, defaultValue]) => {
            visitorOptions[name] = this.nycConfig[name] ?? defaultValue;
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
          this.opts.onCover?.(getRealpath(this.file.opts.filename), result.fileCoverage);
        }
      }
    }
  };
});

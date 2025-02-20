"use strict";

import path from "path";
import { realpathSync } from "fs";
import { execFileSync } from "child_process";
import { declare } from "@babel/helper-plugin-utils";
import { programVisitor } from "istanbul-lib-instrument";
import TestExclude from "test-exclude";
import schema from "@istanbuljs/schema";

function getRealpath(n) {
  try {
    return realpathSync(n) || n;
  } catch (e) {
    return n;
  }
}

const memoize = new Map();
const memosep = path.sep === '/' ? ':' : ';';

function loadNycConfig(cwd, opts) {
  let memokey = cwd;
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];

  if ('nycrcPath' in opts) {
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

  const config = { ...schema.defaults.babelPluginIstanbul, cwd, ...result };
  memoize.set(memokey, config);
  return config;
}

function findConfig(opts) {
  const cwd = getRealpath(opts.cwd || process.env.NYC_CWD || process.cwd());
  const keys = Object.keys(opts);
  const ignored = keys.filter(s => s === 'nycrcPath' || s === 'cwd');

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

export default declare(api => {
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
          this.__dv__ = programVisitor(t, realPath, { ...visitorOptions, inputSourceMap });
          this.__dv__.enter(path);
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

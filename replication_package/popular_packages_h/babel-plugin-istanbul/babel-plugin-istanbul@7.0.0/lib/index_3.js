"use strict";

import path from "path";
import { realpathSync } from "fs";
import { execFileSync } from "child_process";
import { declare } from "@babel/helper-plugin-utils";
import { programVisitor } from "istanbul-lib-instrument";
import TestExclude from "test-exclude";
import schema from "@istanbuljs/schema";

function getRealpath(filepath) {
  try {
    return realpathSync(filepath) || filepath;
  } catch {
    return filepath;
  }
}

const configCache = new Map();
const separator = path.sep === '/' ? ':' : ';';

function loadNycConfig(cwd, options) {
  let cacheKey = cwd;
  const args = [path.resolve(__dirname, 'load-nyc-config-sync.js'), cwd];
  if ('nycrcPath' in options) {
    args.push(options.nycrcPath);
    cacheKey += separator + options.nycrcPath;
  }

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey);
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
  configCache.set(cacheKey, config);
  return config;
}

function findConfig(options) {
  const cwd = getRealpath(options.cwd || process.env.NYC_CWD || process.cwd());
  const optsKeys = Object.keys(options);
  const ignoredKeys = optsKeys.filter(key => key === 'nycrcPath' || key === 'cwd');
  
  if (optsKeys.length > ignoredKeys.length) {
    return {
      ...schema.defaults.babelPluginIstanbul,
      cwd,
      ...options
    };
  }

  if (ignoredKeys.length === 0 && process.env.NYC_CONFIG) {
    return JSON.parse(process.env.NYC_CONFIG);
  }

  return loadNycConfig(cwd, options);
}

function makeShouldInstrumentChecker() {
  let excludeConfig;
  return function shouldSkip(filePath, nycConfig) {
    if (!excludeConfig || excludeConfig.cwd !== nycConfig.cwd) {
      excludeConfig = new TestExclude({
        cwd: nycConfig.cwd,
        include: nycConfig.include,
        exclude: nycConfig.exclude,
        extension: nycConfig.extension,
        excludeNodeModules: nycConfig.excludeNodeModules !== false
      });
    }

    return !excludeConfig.shouldInstrument(filePath);
  };
}

export default declare(api => {
  api.assertVersion(7);
  const shouldSkipFile = makeShouldInstrumentChecker();
  const babelTypes = api.types;

  return {
    visitor: {
      Program: {
        enter(path) {
          this.__dv__ = null;
          this.nycConfig = findConfig(this.opts);
          const fileRealPath = getRealpath(this.file.opts.filename);

          if (shouldSkipFile(fileRealPath, this.nycConfig)) {
            return;
          }

          let inputSourceMap = this.opts.inputSourceMap;
          if (this.opts.useInlineSourceMaps !== false && !inputSourceMap && this.file.inputMap) {
            inputSourceMap = this.file.inputMap.sourcemap;
          }

          const visitorOptions = {};
          for (const [name, defaultValue] of Object.entries(schema.defaults.instrumentVisitor)) {
            visitorOptions[name] = this.nycConfig[name] ?? defaultValue;
          }

          this.__dv__ = programVisitor(babelTypes, fileRealPath, {
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

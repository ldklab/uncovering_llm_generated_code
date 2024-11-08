"use strict";

const path = require("path");
const fs = require("fs");
const _ = require("lodash");

const getModuleDependencies = require("./lib/getModuleDependencies");
const registerConfigAsDependency = require("./lib/registerConfigAsDependency");
const processTailwindFeatures = require("./processTailwindFeatures");
const formatCSS = require("./lib/formatCSS");
const resolveConfig = require("./util/resolveConfig");
const getAllConfigs = require("./util/getAllConfigs");
const { defaultConfigFile } = require("./constants");
const defaultConfigStub = require("../stubs/defaultConfig.stub.js");

function resolveConfigPath(filePath) {
  if (_.isObject(filePath)) {
    if (!_.has(filePath, 'config') && !_.isEmpty(filePath)) {
      return undefined;
    }
    if (_.has(filePath, 'config') && _.isString(filePath.config)) {
      return path.resolve(filePath.config);
    }
    if (_.has(filePath, 'config') && _.isObject(filePath.config)) {
      return undefined;
    }
  } else if (_.isString(filePath)) {
    return path.resolve(filePath);
  }

  try {
    const defaultConfigPath = path.resolve(defaultConfigFile);
    fs.accessSync(defaultConfigPath);
    return defaultConfigPath;
  } catch {
    return undefined;
  }
}

const getConfigFunction = config => () => {
  if (_.isUndefined(config)) {
    return resolveConfig([...getAllConfigs(defaultConfigStub)]);
  }
  if (process.env.JEST_WORKER_ID === undefined && !_.isObject(config)) {
    getModuleDependencies(config).forEach(mdl => {
      delete require.cache[require.resolve(mdl.file)];
    });
  }
  const configObject = _.isObject(config) ? _.get(config, 'config', config) : require(config);
  return resolveConfig([...getAllConfigs(configObject)]);
};

module.exports = function (config) {
  const plugins = [];
  const resolvedConfigPath = resolveConfigPath(config);

  if (!_.isUndefined(resolvedConfigPath)) {
    plugins.push(registerConfigAsDependency(resolvedConfigPath));
  }

  return {
    postcssPlugin: 'tailwindcss',
    plugins: [
      ...plugins,
      processTailwindFeatures(getConfigFunction(resolvedConfigPath || config)),
      formatCSS
    ]
  };
};

module.exports.postcss = true;

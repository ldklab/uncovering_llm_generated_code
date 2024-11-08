"use strict";

const path = require("path");
const fs = require("fs");
const _ = require("lodash");

const getModuleDependencies = require("./lib/getModuleDependencies").default;
const registerConfigAsDependency = require("./lib/registerConfigAsDependency").default;
const processTailwindFeatures = require("./processTailwindFeatures").default;
const formatCSS = require("./lib/formatCSS").default;
const resolveConfig = require("./util/resolveConfig").default;
const getAllConfigs = require("./util/getAllConfigs").default;
const { defaultConfigFile } = require("./constants");
const defaultConfigStub = require("../stubs/defaultConfig.stub.js").default;

function resolveConfigPath(filePath) {
  if (_.isObject(filePath) && !_.has(filePath, 'config') && !_.isEmpty(filePath)) {
    return undefined;
  }
  if (_.isObject(filePath) && _.has(filePath, 'config') && _.isString(filePath.config)) {
    return path.resolve(filePath.config);
  }
  if (_.isObject(filePath) && _.has(filePath, 'config') && _.isObject(filePath.config)) {
    return undefined;
  }
  if (_.isString(filePath)) {
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

const getConfigFunction = (config) => () => {
  if (_.isUndefined(config)) {
    return resolveConfig([...getAllConfigs(defaultConfigStub)]);
  }

  if (process.env.JEST_WORKER_ID === undefined) {
    if (!_.isObject(config)) {
      getModuleDependencies(config).forEach((mdl) => {
        delete require.cache[require.resolve(mdl.file)];
      });
    }
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
    plugins: [...plugins, processTailwindFeatures(getConfigFunction(resolvedConfigPath || config)), formatCSS]
  };
};

module.exports.postcss = true;

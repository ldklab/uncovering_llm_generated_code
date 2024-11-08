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

function resolveConfigFile(input) {
  if (_.isObject(input) && !_.has(input, 'config') && !_.isEmpty(input)) {
    return undefined;
  }
  if (_.isObject(input) && _.has(input, 'config') && _.isString(input.config)) {
    return path.resolve(input.config);
  }
  if (_.isObject(input) && _.has(input, 'config') && _.isObject(input.config)) {
    return undefined;
  }
  if (_.isString(input)) {
    return path.resolve(input);
  }
  try {
    const configPath = path.resolve(defaultConfigFile);
    fs.accessSync(configPath);
    return configPath;
  } catch {
    return undefined;
  }
}

const createConfigResolver = config => () => {
  if (_.isUndefined(config)) {
    return resolveConfig([...getAllConfigs(defaultConfigStub)]);
  }

  if (process.env.JEST_WORKER_ID === undefined && !_.isObject(config)) {
    getModuleDependencies(config).forEach(({ file }) => {
      delete require.cache[require.resolve(file)];
    });
  }

  const configObj = _.isObject(config) ? _.get(config, 'config', config) : require(config);
  return resolveConfig([...getAllConfigs(configObj)]);
};

module.exports = function (config) {
  const plugins = [];
  const configPath = resolveConfigFile(config);

  if (!_.isUndefined(configPath)) {
    plugins.push(registerConfigAsDependency(configPath));
  }

  return {
    postcssPlugin: 'tailwindcss',
    plugins: [
      ...plugins,
      processTailwindFeatures(createConfigResolver(configPath || config)),
      formatCSS
    ]
  };
};

module.exports.postcss = true;

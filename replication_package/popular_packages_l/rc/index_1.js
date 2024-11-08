const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const stripJsonComments = require('strip-json-comments');
const ini = require('ini');

function parseConfigFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(stripJsonComments(content));
  } catch (err) {
    return ini.parse(content);
  }
}

function loadConfigs(appname, configPaths) {
  const configsList = [];
  const combinedConfig = configPaths.reduce((accumulator, filePath) => {
    if (fs.existsSync(filePath)) {
      const configSegment = parseConfigFile(filePath);
      configsList.push(filePath);
      return { ...accumulator, ...configSegment };
    }
    return accumulator;
  }, {});
  return { config: combinedConfig, configs: configsList };
}

function findConfigFiles(appname) {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const potentialPaths = [
    path.join('/etc', `${appname}rc`),
    path.join('/etc', appname, 'config'),
    path.join(homeDir, `.${appname}rc`),
    path.join(homeDir, appname, 'config'),
    path.join(homeDir, '.config', appname),
    path.join(homeDir, '.config', appname, 'config'),
  ];

  let currentDir = process.cwd();
  while (true) {
    potentialPaths.push(path.join(currentDir, `.${appname}rc`));
    const parentDir = path.resolve(currentDir, '..');
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return potentialPaths;
}

function loadEnvVariables(appname) {
  const prefix = `${appname}_`;
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((config, [key, value]) => {
      const keys = key.slice(prefix.length).split('__').map(k => k.toLowerCase());
      let current = config;
      while (keys.length > 1) {
        const part = keys.shift();
        current = current[part] = current[part] || {};
      }
      current[keys[0]] = value;
      return config;
    }, {});
}

module.exports = function rc(appname, defaults = {}, argv = null, customParser = null) {
  const commandArgs = argv || process.argv.slice(2);
  const parsedArguments = minimist(commandArgs);
  const configFiles = parsedArguments.config ? [parsedArguments.config] : findConfigFiles(appname);
  const { config: fileConfig, configs } = loadConfigs(appname, configFiles);
  const envConfig = loadEnvVariables(appname);

  const finalConfig = {
    ...fileConfig,
    ...envConfig,
    ...defaults,
    ...(customParser ? customParser(parsedArguments) : parsedArguments),
  };

  finalConfig.configs = configs;
  finalConfig.config = configs[configs.length - 1];
  return finalConfig;
};

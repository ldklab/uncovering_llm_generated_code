const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const stripJsonComments = require('strip-json-comments');
const ini = require('ini');

function parseConfigFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(stripJsonComments(content));
  } catch {
    return ini.parse(content);
  }
}

function loadConfigs(appname, configPaths) {
  const configs = [];
  const result = configPaths.reduce((acc, filePath) => {
    if (fs.existsSync(filePath)) {
      const confPart = parseConfigFile(filePath);
      configs.push(filePath);
      return { ...acc, ...confPart };
    }
    return acc;
  }, {});
  return { config: result, configs };
}

function findConfigFiles(appname) {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const configPaths = [
    path.join('/etc', `${appname}rc`),
    path.join('/etc', `${appname}`, 'config'),
    path.join(homeDir, `.${appname}rc`),
    path.join(homeDir, `.${appname}`, 'config'),
    path.join(homeDir, '.config', `${appname}`),
    path.join(homeDir, '.config', `${appname}`, 'config'),
  ];

  let dir = process.cwd();
  do {
    configPaths.push(path.join(dir, `.${appname}rc`));
    dir = path.join(dir, '..');
  } while (dir !== path.resolve(dir, '..'));

  return configPaths;
}

function loadEnvVariables(appname) {
  const prefix = `${appname}_`;
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((envConfig, [key, value]) => {
      const pathParts = key.slice(prefix.length).split('__').map(part => part.toLowerCase());
      let curr = envConfig;
      while (pathParts.length > 1) {
        const segment = pathParts.shift();
        curr = curr[segment] = curr[segment] || {};
      }
      curr[pathParts[0]] = value;
      return envConfig;
    }, {});
}

module.exports = function rc(appname, defaults = {}, argv = null, customParser = null) {
  const args = argv || process.argv.slice(2);
  const parsedArgs = minimist(args);
  const configsFromFile = parsedArgs.config ? [parsedArgs.config] : findConfigFiles(appname);
  const { config: configFromFiles, configs } = loadConfigs(appname, configsFromFile);
  const configFromEnv = loadEnvVariables(appname);

  const mergedConfig = {
    ...configFromFiles,
    ...configFromEnv,
    ...defaults,
    ...(customParser ? customParser(parsedArgs) : parsedArgs),
  };

  mergedConfig.configs = configs;
  mergedConfig.config = configs[configs.length - 1];
  return mergedConfig;
};

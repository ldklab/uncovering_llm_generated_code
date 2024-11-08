const utils = require('./lib/utils');
const path = require('path');
const deepExtend = require('deep-extend');
const minimist = require('minimist');

const PLATFORM_IS_WIN = process.platform === "win32";
const HOME_DIRECTORY = PLATFORM_IS_WIN ? process.env.USERPROFILE : process.env.HOME;
const SYSTEM_CONFIG_DIR = '/etc';

module.exports = function(name, defaults, argv, parse) {
  if (typeof name !== 'string') {
    throw new Error('rc(name): name *must* be string');
  }

  argv = argv || minimist(process.argv.slice(2));

  if (typeof defaults === 'string') {
    defaults = utils.json(defaults);
  }
  defaults = defaults || {};

  parse = parse || utils.parse;

  const envConfigs = utils.env(name + '_');
  const configs = [defaults];
  const configFiles = [];

  const addConfigFile = (filePath) => {
    if (configFiles.includes(filePath)) return;

    const fileConfig = utils.file(filePath);
    if (fileConfig) {
      configs.push(parse(fileConfig));
      configFiles.push(filePath);
    }
  };

  if (!PLATFORM_IS_WIN) {
    const unixGlobalConfigs = [
      path.join(SYSTEM_CONFIG_DIR, name, 'config'),
      path.join(SYSTEM_CONFIG_DIR, `${name}rc`)
    ];
    unixGlobalConfigs.forEach(addConfigFile);
  }

  if (HOME_DIRECTORY) {
    const userConfigs = [
      path.join(HOME_DIRECTORY, '.config', name, 'config'),
      path.join(HOME_DIRECTORY, '.config', name),
      path.join(HOME_DIRECTORY, `.${name}`, 'config'),
      path.join(HOME_DIRECTORY, `.${name}rc`)
    ];
    userConfigs.forEach(addConfigFile);
  }

  addConfigFile(utils.find(`.${name}rc`));

  if (envConfigs.config) addConfigFile(envConfigs.config);
  if (argv.config) addConfigFile(argv.config);

  return deepExtend.apply(null, configs.concat([
    envConfigs,
    argv,
    configFiles.length ? {
      configs: configFiles,
      config: configFiles[configFiles.length - 1]
    } : undefined
  ]));
};

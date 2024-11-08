const utils = require('./lib/utils');
const path = require('path');
const deepExtend = require('deep-extend');
const etcDir = '/etc';
const isWindows = process.platform === "win32";
const homeDir = isWindows ? process.env.USERPROFILE : process.env.HOME;

module.exports = function (name, defaults, argv, parse) {
  if (typeof name !== 'string') {
    throw new Error('rc(name): name *must* be string');
  }

  argv = argv || require('minimist')(process.argv.slice(2));
  defaults = typeof defaults === 'string' ? utils.json(defaults) : (defaults || {});

  parse = parse || utils.parse;

  const envVars = utils.env(name + '_');
  const configs = [defaults];
  const configFiles = [];

  const addConfigFile = (file) => {
    if (configFiles.includes(file)) return;
    const fileConfig = utils.file(file);
    if (fileConfig) {
      configs.push(parse(fileConfig));
      configFiles.push(file);
    }
  };

  if (!isWindows) {
    [path.join(etcDir, name, 'config'), path.join(etcDir, name + 'rc')].forEach(addConfigFile);
  }

  if (homeDir) {
    [
      path.join(homeDir, '.config', name, 'config'),
      path.join(homeDir, '.config', name),
      path.join(homeDir, '.' + name, 'config'),
      path.join(homeDir, '.' + name + 'rc')
    ].forEach(addConfigFile);
  }

  addConfigFile(utils.find('.' + name + 'rc'));

  if (envVars.config) addConfigFile(envVars.config);
  if (argv.config) addConfigFile(argv.config);

  return deepExtend(...configs, envVars, argv, configFiles.length ? { configs: configFiles, config: configFiles[configFiles.length - 1] } : undefined);
};

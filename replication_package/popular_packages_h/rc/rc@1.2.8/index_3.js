const utils = require('./lib/utils');
const path = require('path');
const deepExtend = require('deep-extend');
const minimist = require('minimist');

const etc = '/etc';
const isWindows = process.platform === "win32";
const homeDirectory = isWindows ? process.env.USERPROFILE : process.env.HOME;

function loadConfig(name, defaults, argv, parse) {
  if (typeof name !== 'string') {
    throw new Error('rc(name): name *must* be string');
  }

  argv = argv || minimist(process.argv.slice(2));

  defaults = (typeof defaults === 'string' ? utils.json(defaults) : defaults) || {};
  parse = parse || utils.parse;
  const env = utils.env(name + '_');

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
    [path.join(etc, name, 'config'), path.join(etc, `${name}rc`)].forEach(addConfigFile);
  }

  if (homeDirectory) {
    [
      path.join(homeDirectory, '.config', name, 'config'),
      path.join(homeDirectory, '.config', name),
      path.join(homeDirectory, `.${name}`, 'config'),
      path.join(homeDirectory, `.${name}rc`)
    ].forEach(addConfigFile);
  }

  addConfigFile(utils.find(`.${name}rc`));
  if (env.config) addConfigFile(env.config);
  if (argv.config) addConfigFile(argv.config);

  return deepExtend.apply(null, configs.concat([
    env,
    argv,
    configFiles.length ? { configs: configFiles, config: configFiles[configFiles.length - 1] } : undefined,
  ]));
}

module.exports = loadConfig;

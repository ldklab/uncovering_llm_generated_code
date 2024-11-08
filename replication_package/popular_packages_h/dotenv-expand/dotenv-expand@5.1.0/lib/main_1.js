'use strict';

function dotenvExpand(config) {
  const environment = config.ignoreProcessEnv ? {} : process.env;

  function interpolate(envValue) {
    const matches = envValue.match(/(.?\${?(?:[a-zA-Z0-9_]+)?}?)/g) || [];

    return matches.reduce((newEnv, match) => {
      const parts = /(.?)\${?([a-zA-Z0-9_]+)?}?/g.exec(match);
      const prefix = parts[1];
      
      let value, replacePart;
      
      if (prefix === '\\') {
        replacePart = parts[0];
        value = replacePart.replace('\\$', '$');
      } else {
        const key = parts[2];
        replacePart = parts[0].substring(prefix.length);
        value = environment.hasOwnProperty(key) ? environment[key] : (config.parsed[key] || '');
        value = interpolate(value);
      }
      
      return newEnv.replace(replacePart, value);
    }, envValue);
  }

  for (const configKey in config.parsed) {
    const value = environment.hasOwnProperty(configKey) ? environment[configKey] : config.parsed[configKey];
    config.parsed[configKey] = interpolate(value);
  }

  for (const processKey in config.parsed) {
    environment[processKey] = config.parsed[processKey];
  }

  return config;
}

module.exports = dotenvExpand;

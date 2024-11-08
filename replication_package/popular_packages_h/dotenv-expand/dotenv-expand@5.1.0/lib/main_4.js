'use strict';

const dotenvExpand = (config) => {
  const environment = config.ignoreProcessEnv ? {} : process.env;

  const interpolate = (envValue) => {
    const interpolationRegex = /(.?\${?(?:[a-zA-Z0-9_]+)?}?)/g;
    const matches = envValue.match(interpolationRegex) || [];

    return matches.reduce((resolvedValue, match) => {
      const [fullMatch, prefix = '', key] = interpolationRegex.exec(match);
      let value;

      if (prefix === '\\') {
        value = fullMatch.replace('\\$', '$');
      } else {
        const replacePart = fullMatch.slice(prefix.length);
        const envKey = environment.hasOwnProperty(key) ? environment[key] : (config.parsed[key] || '');
        value = interpolate(envKey);
      }

      return resolvedValue.replace(fullMatch, value);
    }, envValue);
  };

  Object.keys(config.parsed).forEach((configKey) => {
    const initialValue = environment.hasOwnProperty(configKey) ? environment[configKey] : config.parsed[configKey];
    config.parsed[configKey] = interpolate(initialValue);
  });

  Object.assign(environment, config.parsed);

  return config;
};

module.exports = dotenvExpand;

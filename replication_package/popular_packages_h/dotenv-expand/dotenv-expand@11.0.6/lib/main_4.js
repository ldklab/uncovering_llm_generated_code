'use strict';

// This is a regex used to identify and capture environment variable patterns
const DOTENV_SUBSTITUTION_REGEX = /(\\)?(\$)(?!\()(\{?)([\w.]+)(?::?-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))?(\}?)/gi;

// Function to resolve escape sequences in strings
function _resolveEscapeSequences(value) {
  return value.replace(/\\\$/g, '$'); // Replace escaped $ with $
}

// Function that recursively performs variable interpolation
function interpolate(value, processEnv, parsed) {
  return value.replace(DOTENV_SUBSTITUTION_REGEX, (match, escaped, dollarSign, openBrace, key, defaultValue, closeBrace) => {
    if (escaped === '\\') {
      return match.slice(1);
    } else {
      if (processEnv[key]) {
        if (processEnv[key] === parsed[key]) {
          return processEnv[key];
        } else {
          return interpolate(processEnv[key], processEnv, parsed); // Handle nested interpolation
        }
      }

      if (parsed[key]) {
        if (parsed[key] === value) {
          return parsed[key];
        } else {
          return interpolate(parsed[key], processEnv, parsed);
        }
      }

      if (defaultValue) {
        if (defaultValue.startsWith('$')) {
          return interpolate(defaultValue, processEnv, parsed);
        } else {
          return defaultValue;
        }
      }

      return '';
    }
  });
}

// Main function to expand variables in a provided .env parsed object
function expand(options) {
  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }

  for (const key in options.parsed) {
    let value = options.parsed[key];

    const inProcessEnv = Object.prototype.hasOwnProperty.call(processEnv, key);
    if (inProcessEnv) {
      if (processEnv[key] === options.parsed[key]) {
        value = interpolate(value, processEnv, options.parsed);
      } else {
        value = processEnv[key];
      }
    } else {
      value = interpolate(value, processEnv, options.parsed);
    }

    options.parsed[key] = _resolveEscapeSequences(value);
  }

  for (const processKey in options.parsed) {
    processEnv[processKey] = options.parsed[processKey];
  }

  return options;
}

module.exports.expand = expand;

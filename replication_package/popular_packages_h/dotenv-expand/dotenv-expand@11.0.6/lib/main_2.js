'use strict';

// Define regex pattern for detecting and handling variable substitutions.
const DOTENV_SUBSTITUTION_REGEX = /(\\)?(\$)(?!\()(\{?)([\w.]+)(?::?-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))?(\}?)/gi;

// Helper function to resolve escape sequences, here it resolves escaped dollar signs.
function _resolveEscapeSequences(value) {
  return value.replace(/\\\$/g, '$');
}

// Main interpolation function to replace variables with their respective values.
function interpolate(value, processEnv, parsed) {
  return value.replace(DOTENV_SUBSTITUTION_REGEX, (match, escaped, dollarSign, openBrace, key, defaultValue, closeBrace) => {
    if (escaped === '\\') {
      return match.slice(1);
    } else {
      if (processEnv[key]) {
        if (processEnv[key] === parsed[key]) {
          return processEnv[key];
        } else {
          return interpolate(processEnv[key], processEnv, parsed);
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

// Function to expand variables in the provided options and resolve them against processEnv.
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

// Export the expand function for external use.
module.exports.expand = expand;

// dotenv-variable-expander.js

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Function to expand variables in environment configurations
function expandVariables(env) {
  const replaceVariables = (input) => {
    const variablePattern = /\$(?:\{([^}]+)\}|([A-Z0-9_]+))/gi;
    return input.replace(variablePattern, (_, fullMatch, shortMatch) => {
      const variableName = fullMatch ? fullMatch.split(':-')[0] : shortMatch;
      const defaultValue = fullMatch ? fullMatch.split(':-')[1] : '';
      return process.env[variableName] || defaultValue || '';
    });
  };

  if (env.parsed) {
    for (const key in env.parsed) {
      if (Object.hasOwnProperty.call(env.parsed, key)) {
        env.processEnv[key] = replaceVariables(env.parsed[key]);
      }
    }
  }
  return env;
}

// Main config function to parse and expand environment variables
function loadConfig(options = {}) {
  const configOptions = {
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
    processEnv: process.env,
    ...options
  };

  try {
    const parsed = dotenv.parse(fs.readFileSync(configOptions.path, { encoding: configOptions.encoding }));
    return expandVariables({ parsed, processEnv: configOptions.processEnv });
  } catch (error) {
    return { error };
  }
}

module.exports = { expandVariables, loadConfig };

// Execute with CLI for testing purposes
if (require.main === module) {
  const expandedEnv = loadConfig();
  console.log(expandedEnv.processEnv); // Outputs expanded environment variables
}

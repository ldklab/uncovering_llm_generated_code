// dotenv-expand.js

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Function to expand environment variable placeholders to actual values
function expand(env) {
  const regex = /\$(?:\{([^}]+)\}|([A-Z0-9_]+))/gi;
  
  const parseVariables = (str) => {
    return str.replace(regex, (_, $1, $2) => {
      if ($1) {
        const [varName, defaultValue] = $1.split(':-');
        return process.env[varName] || defaultValue || '';
      }
      return process.env[$2] || '';
    });
  };

  if (env.parsed) {
    for (const key in env.parsed) {
      if (env.parsed.hasOwnProperty(key)) {
        env.processEnv[key] = parseVariables(env.parsed[key]);
      }
    }
  }
  return env;
}

// Configuration function for loading and expanding environment variables
function config(options = {}) {
  const defaultOptions = {
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
    processEnv: process.env
  };
  const configOptions = { ...defaultOptions, ...options };

  try {
    const fileContent = fs.readFileSync(configOptions.path, { encoding: configOptions.encoding });
    const parsed = dotenv.parse(fileContent);
    const env = { parsed, processEnv: configOptions.processEnv };

    return expand(env);
  } catch (error) {
    return { error };
  }
}

module.exports = { expand, config };

// Usage example: if this file is executed directly, load and log .env configuration.
if (require.main === module) {
  const expandedEnv = config();
  console.log(expandedEnv.processEnv);
}

// dotenv-expand.js

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Expand function for variable expansion logic
function expand(env) {
  const parseVariables = (str) => {
    const regex = /\$(?:\{([^}]+)\}|([A-Z0-9_]+))/gi;
    return str.replace(regex, (_, $1, $2) => {
      if ($1) {
        const parts = $1.split(':-');
        return process.env[parts[0]] || parts[1] || '';
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
};

// Config wrapper for expanding after loading
function config(options = {}) {
  const configOptions = {
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
    processEnv: process.env,
    ...options // Allow overrides
  };

  try {
    const parsed = dotenv.parse(fs.readFileSync(configOptions.path, { encoding: configOptions.encoding }));
    const env = { parsed, processEnv: configOptions.processEnv };
    return expand(env);
  } catch (err) {
    return { error: err };
  }
}

module.exports = { expand, config };

// Usage example
if (require.main === module) {
  const example = config();
  console.log(example.processEnv); // Expanded environment variables
}

// dotenv-expand.js

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function expand(env) {
  const parseVariables = (str) => {
    const regex = /\$(?:\{([^}]+)\}|([A-Z0-9_]+))/gi;
    return str.replace(regex, (_, $1, $2) => {
      if ($1) {
        const [variable, defaultValue] = $1.split(':-');
        return process.env[variable] || defaultValue || '';
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

function config(options = {}) {
  const configOptions = {
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
    processEnv: process.env,
    ...options
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

if (require.main === module) {
  const example = config();
  console.log(example.processEnv);
}

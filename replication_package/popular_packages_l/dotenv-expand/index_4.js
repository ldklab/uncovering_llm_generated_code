const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Function to handle variable expansion
function expandVariables(env) {
  const variablePattern = /\$(?:\{([^}]+)\}|([A-Z0-9_]+))/gi;
  
  const resolveValue = (value) => {
    return value.replace(variablePattern, (match, capture1, capture2) => {
      if (capture1 !== undefined) {
        const [varName, defaultVal] = capture1.split(':-');
        return process.env[varName] || defaultVal || '';
      }
      return process.env[capture2] || '';
    });
  };

  if (env.parsed) {
    Object.keys(env.parsed).forEach((key) => {
      env.processEnv[key] = resolveValue(env.parsed[key]);
    });
  }

  return env;
}

// Function to load .env and apply expansion
function loadConfig(options = {}) {
  const defaultOptions = {
    path: path.resolve(process.cwd(), '.env'),
    encoding: 'utf8',
    processEnv: process.env,
  };

  const currentOptions = { ...defaultOptions, ...options };

  try {
    const dotenvContent = fs.readFileSync(currentOptions.path, { encoding: currentOptions.encoding });
    const parsedVariables = dotenv.parse(dotenvContent);
    const env = { parsed: parsedVariables, processEnv: currentOptions.processEnv };
    return expandVariables(env);
  } catch (error) {
    return { error };
  }
}

module.exports = { expand: expandVariables, config: loadConfig };

// Self-executing script logic
if (require.main === module) {
  const envVariables = loadConfig();
  console.log(envVariables.processEnv);
}

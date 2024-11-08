// cross-env.js
const { spawn } = require('child_process');
const path = require('path');

function parseEnvVar(envVar) {
  const [key, ...valParts] = envVar.split('=');
  const value = valParts.join('=');
  return [key, value];
}

function getEnvVariables(envVars) {
  return envVars.reduce((env, envVar) => {
    const [key, value] = parseEnvVar(envVar);
    if (key) env[key] = value;
    return env;
  }, Object.assign({}, process.env));
}

function crossEnv(args) {
  const envVars = [];
  const commandArgs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i].includes('=')) {
      envVars.push(args[i]);
    } else {
      commandArgs.push(args[i]);
    }
  }

  const command = commandArgs[0];
  const cmdArgs = commandArgs.slice(1);
  const env = getEnvVariables(envVars);

  return spawn(command, cmdArgs, {
    stdio: 'inherit',
    shell: true,
    env,
  }).on('exit', process.exit);
}

module.exports = { crossEnv };

if (require.main === module) {
  crossEnv(process.argv.slice(2));
}

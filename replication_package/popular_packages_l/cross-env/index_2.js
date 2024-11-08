// cross-env.js
const { spawn } = require('child_process');

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
  }, { ...process.env });
}

function crossEnv(args) {
  const envVars = [];
  const commandArgs = [];

  args.forEach(arg => {
    if (arg.includes('=')) {
      envVars.push(arg);
    } else {
      commandArgs.push(arg);
    }
  });

  const [command, ...cmdArgs] = commandArgs;
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

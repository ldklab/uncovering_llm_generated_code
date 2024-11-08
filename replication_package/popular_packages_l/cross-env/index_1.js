// cross-env.js
const { spawn } = require('child_process');

function parseEnvVar(variable) {
  const [key, ...valueParts] = variable.split('=');
  return [key, valueParts.join('=')];
}

function mergeEnvVariables(envVars) {
  return envVars.reduce((environment, variable) => {
    const [key, value] = parseEnvVar(variable);
    if (key) environment[key] = value;
    return environment;
  }, { ...process.env });
}

function crossEnv(args) {
  const envVarList = [];
  const commandList = [];

  args.forEach(arg => {
    arg.includes('=') ? envVarList.push(arg) : commandList.push(arg);
  });

  const [command, ...cmdArgs] = commandList;
  const environment = mergeEnvVariables(envVarList);

  return spawn(command, cmdArgs, {
    stdio: 'inherit',
    shell: true,
    env: environment,
  }).on('exit', process.exit);
}

module.exports = { crossEnv };

if (require.main === module) {
  crossEnv(process.argv.slice(2));
}

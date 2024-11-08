// cross-env.js
const { spawn } = require('child_process');

function parseEnvVar(envVar) {
  const [key, ...valueParts] = envVar.split('=');
  return [key, valueParts.join('=')];
}

function mergeEnvVariables(envAssignments) {
  return envAssignments.reduce((env, envVar) => {
    const [key, value] = parseEnvVar(envVar);
    if (key) env[key] = value;
    return env;
  }, { ...process.env });
}

function crossEnv(commandLineArgs) {
  const envAssignments = [];
  const cmdAndArgs = [];

  commandLineArgs.forEach(arg => 
    arg.includes('=') ? envAssignments.push(arg) : cmdAndArgs.push(arg)
  );

  const [command, ...cmdArgs] = cmdAndArgs;
  const env = mergeEnvVariables(envAssignments);

  return spawn(command, cmdArgs, {
    stdio: 'inherit',
    shell: true,
    env
  }).on('exit', process.exit);
}

module.exports = { crossEnv };

if (require.main === module) {
  crossEnv(process.argv.slice(2));
}

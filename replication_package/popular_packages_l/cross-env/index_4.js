// cross-env.js
const { spawn } = require('child_process');

const parseEnvVar = (envVar) => envVar.split('=').reduce((acc, cur, i) => {
  i === 0 ? acc.push(cur) : acc[1] += `${i > 1 ? '=' : ''}${cur}`;
  return acc;
}, []);

const getEnvVariables = (envVars) => {
  const env = { ...process.env };
  envVars.forEach(envVar => {
    const [key, value] = parseEnvVar(envVar);
    if (key) env[key] = value;
  });
  return env;
};

const crossEnv = (args) => {
  const envVars = args.filter(arg => arg.includes('='));
  const commandArgs = args.filter(arg => !arg.includes('='));
  
  if (commandArgs.length === 0) {
    console.error('No command specified.');
    process.exit(1);
  }

  const [command, ...cmdArgs] = commandArgs;
  const env = getEnvVariables(envVars);

  spawn(command, cmdArgs, {
    stdio: 'inherit',
    shell: true,
    env,
  }).on('exit', process.exit);
};

module.exports = { crossEnv };

if (require.main === module) {
  crossEnv(process.argv.slice(2));
}

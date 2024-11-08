const { spawn } = require('cross-spawn');
const commandConvert = require('./command');
const varValueConvert = require('./variable');

module.exports = crossEnv;

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;

function crossEnv(args, options = {}) {
  const [envSetters, command, commandArgs] = parseCommand(args);
  const env = getEnvVars(envSetters);

  if (!command) return null;

  const proc = spawn(
    commandConvert(command, env, true),
    commandArgs.map(arg => commandConvert(arg, env)),
    {
      stdio: 'inherit',
      shell: options.shell,
      env,
    }
  );

  ['SIGTERM', 'SIGINT', 'SIGBREAK', 'SIGHUP'].forEach(signal => {
    process.on(signal, () => proc.kill(signal));
  });

  proc.on('exit', (code, signal) => {
    const exitCode = code !== null ? code : (signal === 'SIGINT' ? 0 : 1);
    process.exit(exitCode);
  });

  return proc;
}

function parseCommand(args) {
  const envSetters = {};
  let command = null;
  let commandArgs = [];

  for (let i = 0; i < args.length; i++) {
    const match = envSetterRegex.exec(args[i]);

    if (match) {
      const value = match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : match[5];
      envSetters[match[1]] = value;
    } else {
      const remainingArgs = args.slice(i).map(arg =>
        arg.replace(/\\\\|(\\)?'|([\\])(?=[$"\\])/g, match => match === '\\\\' ? '\\' : (match === "\\'" ? "'" : ''))
      );
      command = remainingArgs[0];
      commandArgs = remainingArgs.slice(1);
      break;
    }
  }

  return [envSetters, command, commandArgs];
}

function getEnvVars(envSetters) {
  const envVars = { ...process.env };

  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA;
  }

  Object.keys(envSetters).forEach(varName => {
    envVars[varName] = varValueConvert(envSetters[varName], varName);
  });

  return envVars;
}

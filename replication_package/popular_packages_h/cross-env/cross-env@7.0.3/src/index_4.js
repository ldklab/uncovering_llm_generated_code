const { spawn } = require('cross-spawn');
const commandConvert = require('./command');
const varValueConvert = require('./variable');

module.exports = crossEnv;

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;

function crossEnv(args, options = {}) {
  const [envSetters, command, commandArgs] = parseCommand(args);
  const env = constructEnvVars(envSetters);

  if (command) {
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
      const exitCode = code === null ? (signal === 'SIGINT' ? 0 : 1) : code;
      process.exit(exitCode);
    });

    return proc;
  }

  return null;
}

function parseCommand(args) {
  const envSetters = {};
  let command = null;
  let commandArgs = [];

  for (let i = 0; i < args.length; i++) {
    const match = envSetterRegex.exec(args[i]);
    if (match) {
      const value = match[3] ?? match[5] ?? match[4];
      envSetters[match[1]] = value;
    } else {
      const [cmd, ...cmdArgs] = args.slice(i).map(arg =>
        arg.replace(/\\\\|(\\)?'|([\\])(?=[$"\\])/g, match => 
          ({ '\\\\': '\\', "\\'": "'"}[match] || ''))
      );
      command = cmd;
      commandArgs = cmdArgs;
      break;
    }
  }

  return [envSetters, command, commandArgs];
}

function constructEnvVars(envSetters) {
  const envVars = { ...process.env };
  
  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA;
  }

  Object.entries(envSetters).forEach(([varName, value]) => {
    envVars[varName] = varValueConvert(value, varName);
  });

  return envVars;
}

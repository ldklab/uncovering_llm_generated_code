const { spawn } = require('cross-spawn');
const commandConvert = require('./command');
const varValueConvert = require('./variable');

module.exports = crossEnv;

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;

function crossEnv(args, options = {}) {
  const [envSetters, command, commandArgs] = parseCommand(args);
  const env = prepareEnvironment(envSetters);

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

    handleProcessSignals(proc);
    proc.on('exit', (code, signal) => {
      process.exit(getExitCode(code, signal));
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
      envSetters[match[1]] = getValueFromMatch(match);
    } else {
      [command, ...commandArgs] = normalizeCommandArgs(args.slice(i));
      break;
    }
  }

  return [envSetters, command, commandArgs];
}

function getValueFromMatch(match) {
  if (typeof match[3] !== 'undefined') return match[3];
  if (typeof match[4] !== 'undefined') return match[4];
  return match[5];
}

function normalizeCommandArgs(commandArgs) {
  const regex = /\\\\|(\\)?'|([\\])(?=[$"\\])/g;
  return commandArgs.map(arg =>
    arg.replace(regex, m => {
      if (m === '\\\\') return '\\';
      if (m === "\\'") return "'";
      return '';
    })
  );
}

function prepareEnvironment(envSetters) {
  const envVars = { ...process.env };
  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA;
  }
  Object.keys(envSetters).forEach(varName => {
    envVars[varName] = varValueConvert(envSetters[varName], varName);
  });
  return envVars;
}

function handleProcessSignals(proc) {
  ['SIGTERM', 'SIGINT', 'SIGBREAK', 'SIGHUP'].forEach(signal => {
    process.on(signal, () => proc.kill(signal));
  });
}

function getExitCode(code, signal) {
  if (code === null) {
    return signal === 'SIGINT' ? 0 : 1;
  }
  return code;
}

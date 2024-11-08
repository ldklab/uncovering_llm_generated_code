const { spawn } = require('cross-spawn');
const commandConvert = require('./command');
const varValueConvert = require('./variable');

module.exports = crossEnv;

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;

function crossEnv(args, options = {}) {
  const [envSetters, command, commandArgs] = parseCommand(args);
  const env = getEnvVars(envSetters);
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
    setupSignalHandlers(proc);
    proc.on('exit', (code, signal) => {
      process.exit(determineExitCode(code, signal));
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
      envSetters[match[1]] = match[3] ?? match[4] ?? match[5];
    } else {
      command = args[i];
      commandArgs = processCommandArgs(args.slice(i));
      break;
    }
  }

  return [envSetters, command, commandArgs];
}

function processCommandArgs(args) {
  return args.map(arg => arg.replace(/\\\\|(\\)?'|([\\])(?=[$"\\])/g, m => {
    if (m === '\\\\') return '\\';
    if (m === "\\'") return "'";
    return '';
  }));
}

function getEnvVars(envSetters) {
  const envVars = { ...process.env };
  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA;
  }
  for (const [varName, value] of Object.entries(envSetters)) {
    envVars[varName] = varValueConvert(value, varName);
  }
  return envVars;
}

function setupSignalHandlers(proc) {
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
  process.on('SIGINT', () => proc.kill('SIGINT'));
  process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
  process.on('SIGHUP', () => proc.kill('SIGHUP'));
}

function determineExitCode(code, signal) {
  if (code === null) {
    return signal === 'SIGINT' ? 0 : 1;
  }
  return code;
}

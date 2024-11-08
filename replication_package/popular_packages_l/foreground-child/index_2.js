// index.js
import { spawn } from 'child_process'
import process from 'process'

export function runCommandInForeground(command, argumentsList, optionsOrCallback, maybeCallback) {
  const options = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
  const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;

  const cmdArguments = typeof argumentsList === 'string' ? [argumentsList] : argumentsList;
  const spawnOptions = { ...options, stdio: [0, 1, 2, 'ipc'] };

  const childProcess = spawn(command, cmdArguments, spawnOptions);

  childProcess.on('exit', (code, signal) => handleExitOutcome(code, signal, callback));
  childProcess.on('error', () => process.exit(1));

  return childProcess;
}

function handleExitOutcome(code, signal, callback) {
  if (!callback) {
    terminateProcess(code, signal);
  } else {
    handleCallback(callback).then(result => processOutcome(result, code, signal));
  }
}

async function handleCallback(callback) {
  try {
    return await callback();
  } catch {
    return process.exit(1);
  }
}

function processOutcome(result, exitCode, signal) {
  if (typeof result === 'number') {
    process.exit(result);
  } else if (typeof result === 'string') {
    process.kill(process.pid, result);
  } else if (result !== false) {
    terminateProcess(exitCode, signal);
  }
}

function terminateProcess(code, signal) {
  process.exit(code || (signal ? 1 : 0));
}

// proxy-signals.js
import process from 'process'

export function forwardSignals(childProcess) {
  const signalList = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];
  signalList.forEach(signal => 
    process.on(signal, () => childProcess.kill(signal))
  );
}

// watchdog.js
import { spawn } from 'child_process'
import process from 'process'

export function monitorChildProcess(childProcess) {
  const childWatcher = spawn(process.argv[0], [
    '-e',
    `
      process.stdin.resume();
      process.on('SIGHUP', () => {
        setTimeout(() => process.kill(${childProcess.pid}, 'SIGKILL'), 500);
      });
    `
  ]);

  process.on('exit', () => childWatcher.kill('SIGHUP'));

  return childWatcher;
}

// index.js
import { spawn } from 'child_process';
import process from 'process';

export function foregroundChild(cmd, args, optionsOrCallback, maybeCallback) {
  const isCallback = typeof optionsOrCallback === 'function';
  const options = isCallback ? {} : optionsOrCallback;
  const callback = isCallback ? optionsOrCallback : maybeCallback;

  const cmdWithArgs = Array.isArray(args) ? args : [args];
  const optionsWithStdio = { ...options, stdio: 'inherit' };

  const child = spawn(cmd, cmdWithArgs, optionsWithStdio);

  child.on('exit', (code, signal) => handleExit(code, signal, callback));
  child.on('error', () => process.exit(1));

  return child;
}

function handleExit(code, signal, callback) {
  if (callback) {
    const result = callback();
    if (result instanceof Promise) {
      result.then(res => handleCallbackResult(res, code, signal))
            .catch(() => process.exit(1));
    } else {
      handleCallbackResult(result, code, signal);
    }
  } else {
    process.exit(code || (signal ? 1 : 0));
  }
}

function handleCallbackResult(result, code, signal) {
  if (typeof result === 'number') {
    process.exit(result);
  } else if (typeof result === 'string') {
    process.kill(process.pid, result);
  } else if (result !== false) {
    process.exit(code || (signal ? 1 : 0));
  }
}

// proxy-signals.js
import process from 'process';

export function proxySignals(childProcess) {
  ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'].forEach(signal =>
    process.on(signal, () => childProcess.kill(signal))
  );
}

// watchdog.js
import { spawn } from 'child_process';
import process from 'process';

export function watchdog(childProcess) {
  const watchdogProcess = spawn(process.execPath, [
    '-e',
    `
      process.stdin.resume();
      process.on('SIGHUP', () => {
        setTimeout(() => process.kill(${childProcess.pid}, 'SIGKILL'), 500);
      });
    `
  ]);

  process.on('exit', () => watchdogProcess.kill('SIGHUP'));
  return watchdogProcess;
}

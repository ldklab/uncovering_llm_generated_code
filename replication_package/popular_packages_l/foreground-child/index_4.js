// index.js
import { spawn } from 'child_process';
import process from 'process';

export function foregroundChild(cmd, args, optionsOrCallback, maybeCallback) {
  let options = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;
  let callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;

  const cmdWithArgs = Array.isArray(args) ? args : [args];
  const optionsWithStdio = { ...options, stdio: [0, 1, 2, 'ipc'] };

  const child = spawn(cmd, cmdWithArgs, optionsWithStdio);

  child.on('exit', (code, signal) => {
    if (!callback) {
      process.exit(code || (signal ? 1 : 0));
    } else {
      const result = callback();
      if (result instanceof Promise) {
        result.then(res => handleCallbackResult(res, code, signal))
              .catch(() => process.exit(1));
      } else {
        handleCallbackResult(result, code, signal);
      }
    }
  });

  child.on('error', () => process.exit(1));

  function handleCallbackResult(result, code, signal) {
    if (typeof result === 'number') {
      process.exit(result);
    } else if (typeof result === 'string') {
      process.kill(process.pid, result);
    } else if (result !== false) {
      process.exit(code || (signal ? 1 : 0));
    }
  }

  return child;
}

// proxy-signals.js
import process from 'process';

export function proxySignals(childProcess) {
  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];
  signals.forEach(signal =>
    process.on(signal, () => childProcess.kill(signal))
  );
}

// watchdog.js
import { spawn } from 'child_process';
import process from 'process';

export function watchdog(childProcess) {
  const watchdogProcess = spawn(process.argv[0], [
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

// index.js
import { spawn } from 'child_process';
import process from 'process';

export function launchChild(cmd, args = [], optsOrCallback = {}, cb = null) {
  const options = typeof optsOrCallback === 'function' ? {} : optsOrCallback;
  const callback = typeof optsOrCallback === 'function' ? optsOrCallback : cb;
  const cmdArgs = typeof args === 'string' ? [args] : args;
  const optionsWithStdio = { ...options, stdio: ['inherit', 'inherit', 'inherit', 'ipc'] };

  const child = spawn(cmd, cmdArgs, optionsWithStdio);

  child.on('exit', (code, signal) => {
    if (!callback) {
      process.exit(code || (signal ? 1 : 0));
    } else {
      const result = callback();
      if (result instanceof Promise) {
        result
          .then((res) => evaluateCallback(res, code, signal))
          .catch(() => process.exit(1));
      } else {
        evaluateCallback(result, code, signal);
      }
    }
  });

  child.on('error', () => process.exit(1));

  function evaluateCallback(res, code, signal) {
    if (typeof res === 'number') {
      process.exit(res);
    } else if (typeof res === 'string') {
      process.kill(process.pid, res);
    } else if (res !== false) {
      process.exit(code || (signal ? 1 : 0));
    }
  }

  return child;
}

// proxy-signals.js
import process from 'process';

export function forwardSignalsToChild(childProcess) {
  ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'].forEach(signal => {
    process.on(signal, () => childProcess.kill(signal));
  });
}

// watchdog.js
import { spawn } from 'child_process';
import process from 'process';

export function createWatchdog(childProc) {
  const watchdog = spawn(process.argv[0], [
    '-e',
    `
    process.stdin.resume();
    process.on('SIGHUP', () => {
      setTimeout(() => process.kill(${childProc.pid}, 'SIGKILL'), 500);
    });
    `
  ]);

  process.on('exit', () => watchdog.kill('SIGHUP'));
  return watchdog;
}

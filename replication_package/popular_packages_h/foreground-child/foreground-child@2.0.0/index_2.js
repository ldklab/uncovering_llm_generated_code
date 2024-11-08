const signalExit = require('signal-exit');
const { spawn } = process.platform === 'win32' ? require('cross-spawn') : require('child_process');

/**
 * Normalizes the arguments for `foregroundChild`.
 * @param {Array} fgArgs - Arguments for child process execution.
 * @returns {Object} Normalized arguments including program, args, and callback.
 */
function normalizeFgArgs(fgArgs) {
  let program, args, cb;
  let processArgsEnd = fgArgs.length;

  const lastArg = fgArgs[fgArgs.length - 1];
  cb = typeof lastArg === 'function' ? lastArg : (done) => done();

  if (Array.isArray(fgArgs[0])) {
    [program, ...args] = fgArgs[0];
  } else {
    program = fgArgs[0];
    args = Array.isArray(fgArgs[1]) ? fgArgs[1] : fgArgs.slice(1, processArgsEnd - (typeof lastArg === 'function' ? 1 : 0));
  }

  return { program, args, cb };
}

/**
 * Executes a child process in the foreground.
 * @param {...any} fgArgs - Arguments for the child process.
 */
function foregroundChild(...fgArgs) {
  const { program, args, cb } = normalizeFgArgs(fgArgs);
  const spawnOpts = { stdio: [0, 1, 2] };
  if (process.send) spawnOpts.stdio.push('ipc');

  const child = spawn(program, args, spawnOpts);
  const unproxySignals = proxySignals(process, child);

  process.on('exit', () => child.kill('SIGHUP'));
  
  child.on('close', (code, signal) => {
    process.exitCode = signal ? 128 + signal : code;
    
    let done = false;
    const doneCB = () => {
      if (!done) {
        done = true;
        unproxySignals();
        process.removeListener('exit', () => child.kill('SIGHUP'));
        if (signal) {
          setTimeout(() => {}, 200);
          process.kill(process.pid, signal);
        } else {
          process.exit(process.exitCode);
        }
      }
    };

    const result = cb(doneCB);
    if (result && result.then) {
      result.then(doneCB);
    }
  });

  if (process.send) {
    process.removeAllListeners('message');

    child.on('message', (message, sendHandle) => process.send(message, sendHandle));
    process.on('message', (message, sendHandle) => child.send(message, sendHandle));
  }

  return child;
}

/**
 * Sets up signal proxying from parent to child.
 * @param {process} parent - Parent process.
 * @param {ChildProcess} child - Child process.
 * @returns {Function} Function to unproxy signals.
 */
function proxySignals(parent, child) {
  const listeners = new Map();

  for (const sig of signalExit.signals()) {
    const listener = () => child.kill(sig);
    listeners.set(sig, listener);
    parent.on(sig, listener);
  }

  return function unproxySignals() {
    for (const [sig, listener] of listeners) {
      parent.removeListener(sig, listener);
    }
  }
}

module.exports = foregroundChild;

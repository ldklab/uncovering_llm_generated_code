const signalExit = require('signal-exit');
const spawn = process.platform === 'win32' ? require('cross-spawn') : require('child_process').spawn;

function normalizeFgArgs(fgArgs) {
  let program, args, cb;
  let processArgsEnd = fgArgs.length;
  const lastFgArg = fgArgs[fgArgs.length - 1];
  
  if (typeof lastFgArg === "function") {
    cb = lastFgArg;
    processArgsEnd -= 1;
  } else {
    cb = (done) => done();
  }

  if (Array.isArray(fgArgs[0])) {
    [program, ...args] = fgArgs[0];
  } else {
    program = fgArgs[0];
    args = Array.isArray(fgArgs[1]) ? fgArgs[1] : fgArgs.slice(1, processArgsEnd);
  }

  return { program, args, cb };
}

function foregroundChild(...fgArgs) {
  const { program, args, cb } = normalizeFgArgs(fgArgs);
  const spawnOpts = { stdio: [0, 1, 2] };

  if (process.send) {
    spawnOpts.stdio.push('ipc');
  }

  const child = spawn(program, args, spawnOpts);
  const unproxySignals = proxySignals(process, child);

  process.on('exit', childHangup);
  function childHangup() {
    child.kill('SIGHUP');
  }

  child.on('close', (code, signal) => {
    process.exitCode = signal ? 128 + signal : code;
    let done = false;

    const doneCB = () => {
      if (done) return;
      done = true;
      unproxySignals();
      process.removeListener('exit', childHangup);

      if (signal) {
        setTimeout(() => {}, 200);
        process.kill(process.pid, signal);
      } else {
        process.exit(process.exitCode);
      }
    };

    const result = cb(doneCB);
    if (result && result.then) result.then(doneCB);
  });

  if (process.send) {
    process.removeAllListeners('message');

    child.on('message', (message, sendHandle) => {
      process.send(message, sendHandle);
    });

    process.on('message', (message, sendHandle) => {
      child.send(message, sendHandle);
    });
  }

  return child;
}

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
  };
}

module.exports = foregroundChild;

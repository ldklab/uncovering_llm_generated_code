const signalExit = require('signal-exit');
const spawnUtil = process.platform === 'win32' ? require('cross-spawn') : require('child_process').spawn;

function normalizeArguments(fgArgs) {
  let program, args, callback;
  let argEnd = fgArgs.length;
  const lastArg = fgArgs[fgArgs.length - 1];

  if (typeof lastArg === "function") {
    callback = lastArg;
    argEnd -= 1;
  } else {
    callback = (done) => done();
  }

  if (Array.isArray(fgArgs[0])) {
    [program, ...args] = fgArgs[0];
  } else {
    program = fgArgs[0];
    args = Array.isArray(fgArgs[1]) ? fgArgs[1] : fgArgs.slice(1, argEnd);
  }

  return { program, args, callback };
}

function foregroundChild(...fgArgs) {
  const { program, args, callback } = normalizeArguments(fgArgs);

  const spawnOptions = { stdio: [0, 1, 2] };
  if (process.send) spawnOptions.stdio.push('ipc');

  const childProcess = spawnUtil(program, args, spawnOptions);
  const unproxy = manageSignals(process, childProcess);
  
  process.on('exit', handleChildHangup);

  function handleChildHangup() {
    childProcess.kill('SIGHUP');
  }

  childProcess.on('close', (code, signal) => {
    process.exitCode = signal ? 128 + signal : code;

    let finished = false;
    const onDone = () => {
      if (finished) return;
      finished = true;

      unproxy();
      process.removeListener('exit', handleChildHangup);

      if (signal) {
        setTimeout(() => {}, 200);
        process.kill(process.pid, signal);
      } else {
        process.exit(process.exitCode);
      }
    };

    const result = callback(onDone);
    if (result && result.then) result.then(onDone);
  });

  if (process.send) {
    process.removeAllListeners('message');

    childProcess.on('message', (msg, sendHandle) => {
      process.send(msg, sendHandle);
    });

    process.on('message', (msg, sendHandle) => {
      childProcess.send(msg, sendHandle);
    });
  }

  return childProcess;
}

function manageSignals(parent, child) {
  const listeners = new Map();

  for (const sig of signalExit.signals()) {
    const listener = () => child.kill(sig);
    listeners.set(sig, listener);
    parent.on(sig, listener);
  }

  return function stopProxy() {
    for (const [sig, listener] of listeners) {
      parent.removeListener(sig, listener);
    }
  };
}

module.exports = foregroundChild;

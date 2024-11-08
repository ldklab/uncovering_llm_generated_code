// signal-exit.js
const signals = [
  'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK', 
  'SIGUSR1', 'SIGUSR2', 'SIGPIPE'
];
const originalEmit = process.emit;

export function onExit(callback, options = {}) {
  if (!process || typeof process.emit !== 'function') {
    return () => {}; // No-op for unsuitable process
  }

  let fired = false;
  let hookedSignals = new Set();
  
  function exitHandler(exitCode, signal) {
    if (fired) return;
    fired = true;

    if (!hookedSignals.has(signal) || callback(exitCode, signal) !== true) {
      process.exit(exitCode);
    }
  }

  function signalHandler(signal) {
    hookedSignals.add(signal);
    exitHandler(null, signal);
  }

  process.on('exit', exitHandler);

  signals.forEach(signal => {
    try {
      process.on(signal, signalHandler);
    } catch (err) {}
  });

  if (options.alwaysLast) {
    process.emit = function (...args) {
      const type = args[0];
      if (type === 'exit') {
        process.removeListener('exit', exitHandler);
        const result = originalEmit.apply(process, args);
        process.on('exit', exitHandler);
        return result;
      }
      return originalEmit.apply(process, args);
    }
  }

  return function remove() {
    if (fired) return;
    process.removeListener('exit', exitHandler);
    signals.forEach(signal => process.removeListener(signal, signalHandler));
    if (options.alwaysLast) {
      process.emit = originalEmit;
    }
  };
}

// browser.js (No operation shim for browser)
export function onExit(callback, options = {}) {
  return () => {}; // No-op, not applicable in browser
}

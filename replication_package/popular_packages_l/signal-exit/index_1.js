// signal-exit.js
const signals = [
  'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK', 
  'SIGUSR1', 'SIGUSR2', 'SIGPIPE'
];
const originalEmit = process.emit;

export function onExit(callback, options = {}) {
  if (!process || typeof process.emit !== 'function') {
    return () => {}; // For environments without a proper process object
  }

  let hasExited = false;
  let trackedSignals = new Set();
  
  const exitHandler = (exitCode, signal) => {
    if (hasExited) return;
    hasExited = true;

    if (!trackedSignals.has(signal) || callback(exitCode, signal) !== true) {
      process.exit(exitCode);
    }
  };

  const handleSignal = (signal) => {
    trackedSignals.add(signal);
    exitHandler(null, signal);
  };

  process.on('exit', exitHandler);

  signals.forEach(signal => {
    try {
      process.on(signal, handleSignal);
    } catch (error) {
      // Catch and ignore errors for signals unsupported on the current platform
    }
  });

  if (options.alwaysLast) {
    process.emit = function (...args) {
      const eventType = args[0];
      if (eventType === 'exit') {
        process.removeListener('exit', exitHandler);
        const eventResult = originalEmit.apply(process, args);
        process.on('exit', exitHandler);
        return eventResult;
      }
      return originalEmit.apply(process, args);
    };
  }

  return function cleanup() {
    if (hasExited) return;
    process.removeListener('exit', exitHandler);
    signals.forEach(signal => process.removeListener(signal, handleSignal));
    if (options.alwaysLast) {
      process.emit = originalEmit;
    }
  };
}

// browser.js (No operation shim for browser)
export function onExit(callback, options = {}) {
  return () => {}; // No-op for situations where process handling doesn't apply
}

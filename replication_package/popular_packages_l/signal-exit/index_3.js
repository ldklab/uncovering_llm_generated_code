// signal-exit.js
const signals = [
  'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK',
  'SIGUSR1', 'SIGUSR2', 'SIGPIPE'
];
const originalEmit = process.emit;

function onExit(callback, options = {}) {
  if (!process || typeof process.emit !== 'function') {
    return () => {}; // Return a no-op for non-applicable processes
  }

  let fired = false; // Prevent the callback from running more than once
  let hookedSignals = new Set(); // Track signals that triggered the handler

  function exitHandler(exitCode, signal) {
    if (fired) return;
    fired = true;

    // If the callback doesn't return true, proceed with process exit
    if (!hookedSignals.has(signal) || callback(exitCode, signal) !== true) {
      process.exit(exitCode);
    }
  }

  function signalHandler(signal) {
    hookedSignals.add(signal);
    exitHandler(null, signal);
  }

  process.on('exit', exitHandler); // Handle standard exit events

  signals.forEach(signal => {
    try {
      process.on(signal, signalHandler); // Attach handlers for each signal
    } catch (err) {
      // Ignore errors if signal can't be attached
    }
  });

  if (options.alwaysLast) {
    process.emit = function (...args) {
      const type = args[0];
      if (type === 'exit') {
        process.removeListener('exit', exitHandler); // Temporarily detach
        const result = originalEmit.apply(process, args); // Emit event
        process.on('exit', exitHandler); // Reattach
        return result;
      }
      return originalEmit.apply(process, args);
    };
  }

  return function remove() {
    if (fired) return;
    process.removeListener('exit', exitHandler);
    signals.forEach(signal => process.removeListener(signal, signalHandler));
    if (options.alwaysLast) {
      process.emit = originalEmit; // Restore original process.emit method
    }
  };
}

// browser.js (No operation shim for browser)
function onExitForBrowser(callback, options = {}) {
  return () => {}; // No-op, as signals/events do not apply in browsers
}

export { onExit, onExitForBrowser as onExit };

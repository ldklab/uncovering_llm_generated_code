// signal-exit.js
const signals = [
  'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK', 
  'SIGUSR1', 'SIGUSR2', 'SIGPIPE'
];
const originalEmit = process.emit;

export function onExit(callback, options = {}) {
  // Check if the `process` object is available and has an `emit` method.
  if (!process || typeof process.emit !== 'function') {
    return () => {}; // Return a no-operation function for non-standard environments.
  }

  let fired = false;  // Ensures the exit handler is only executed once.
  let hookedSignals = new Set();

  function exitHandler(exitCode, signal) {
    if (fired) return;  // Prevent further execution if already handled.
    fired = true;  // Mark as handled.
    
    // If the signal hasn't been handled or if callback returns non-true, exit with the code.
    if (!hookedSignals.has(signal) || callback(exitCode, signal) !== true) {
      process.exit(exitCode);
    }
  }

  function signalHandler(signal) {
    hookedSignals.add(signal);  // Record that this signal handler was fired.
    exitHandler(null, signal);  // Run the common exit handler.
  }

  // Set up exit handler for regular exit events.
  process.on('exit', exitHandler);

  // Attach handlers for each specified signal to trigger the exitHandler.
  signals.forEach(signal => {
    try {
      process.on(signal, signalHandler);
    } catch (err) {
      // Silently fail if a signal can't be set up, this might occur on some platforms.
    }
  });

  // Special behavior for the 'alwaysLast' option: ensure our handler is the last called on 'exit'.
  if (options.alwaysLast) {
    process.emit = function (...args) {
      const type = args[0];
      if (type === 'exit') {
        process.removeListener('exit', exitHandler); // Temporarily remove handler.
        const result = originalEmit.apply(process, args); // Emit the signal.
        process.on('exit', exitHandler); // Re-attach handler to ensure it's always last.
        return result;
      }
      return originalEmit.apply(process, args);
    }
  }

  // Function to clean up the installed handlers.
  return function remove() {
    if (fired) return;  // If already handled, do nothing.
    process.removeListener('exit', exitHandler);
    signals.forEach(signal => process.removeListener(signal, signalHandler));
    if (options.alwaysLast) {
      process.emit = originalEmit; // Restore the original emit function.
    }
  };
}

// browser.js (No operation shim for browser)
export function onExit(callback, options = {}) {
  // In a browser environment, this is a no-op.
  return () => {}; // Return a no-operation function.
}

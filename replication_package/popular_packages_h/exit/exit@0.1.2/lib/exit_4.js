'use strict';

module.exports = function customExit(exitCode, streams = [process.stdout, process.stderr]) {
  let drainedStreamsCount = 0;

  function checkAllStreamsDrained() {
    if (drainedStreamsCount === streams.length) {
      process.exit(exitCode);
    }
  }

  streams.forEach((stream) => {
    if (stream.bufferSize === 0) {
      drainedStreamsCount++;
    } else {
      stream.write('', 'utf-8', () => {
        drainedStreamsCount++;
        checkAllStreamsDrained();
      });
    }

    // Override write to prevent further data writing to the stream.
    stream.write = function() {};
  });

  // Check if already drained at the start.
  checkAllStreamsDrained();

  // Ensures the correct exit code on Windows systems.
  process.on('exit', () => {
    process.exit(exitCode);
  });
};

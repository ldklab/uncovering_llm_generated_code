'use strict';

module.exports = function exit(exitCode, streams = [process.stdout, process.stderr]) {
  let drainedStreams = 0;

  function checkAndExit() {
    if (drainedStreams === streams.length) {
      process.exit(exitCode);
    }
  }

  streams.forEach(stream => {
    if (stream.bufferSize === 0) {
      drainedStreams++;
    } else {
      stream.write('', 'utf-8', () => {
        drainedStreams++;
        checkAndExit();
      });
    }

    stream.write = () => {};
  });

  checkAndExit();

  process.on('exit', () => {
    process.exit(exitCode);
  });
};

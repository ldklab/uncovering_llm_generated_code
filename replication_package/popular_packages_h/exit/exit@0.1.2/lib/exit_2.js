'use strict';

module.exports = function exit(exitCode, streams = [process.stdout, process.stderr]) {
  let drainCount = 0;

  const tryToExit = () => {
    if (drainCount === streams.length) {
      process.exit(exitCode);
    }
  };

  streams.forEach((stream) => {
    if (stream.bufferSize === 0) {
      drainCount++;
    } else {
      stream.write('', 'utf-8', () => {
        drainCount++;
        tryToExit();
      });
    }
    stream.write = () => {};
  });

  tryToExit();

  process.on('exit', () => {
    process.exit(exitCode);
  });
};

/*
 * exit
 * https://github.com/cowboy/node-exit
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function exit(exitCode, streams = [process.stdout, process.stderr]) {
  let drainCount = 0;

  function tryToExit() {
    if (drainCount === streams.length) {
      process.exit(exitCode);
    }
  }

  streams.forEach((stream) => {
    if (stream.write === writeNoOp) return;
    if (stream.bufferSize === 0) {
      drainCount++;
    } else {
      stream.write('', 'utf-8', () => {
        drainCount++;
        tryToExit();
      });
    }
    
    stream.write = writeNoOp;
  });

  tryToExit();

  process.on('exit', () => {
    process.exit(exitCode);
  });
};

function writeNoOp() {}

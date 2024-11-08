'use strict';

const { PassThrough } = require('stream');

module.exports = merge2;

function merge2(...args) {
  const streamsQueue = [];
  let merging = false;
  let options = args[args.length - 1];

  if (options && typeof options === 'object' && !Array.isArray(options) && !(options instanceof PassThrough)) {
    args.pop();
  } else {
    options = {};
  }

  const { end = true, pipeError = false, objectMode = true, highWaterMark = 64 * 1024 } = options;
  const mergedStream = new PassThrough({ objectMode, highWaterMark });

  mergedStream.setMaxListeners(0);
  mergedStream.add = (...streams) => {
    streams.forEach(stream => streamsQueue.push(pauseStream(stream, { objectMode, highWaterMark })));
    mergeNext();
    return mergedStream;
  };

  if (args.length) {
    mergedStream.add(...args);
  }

  mergedStream.on('unpipe', (source) => {
    source.emit('merge2UnpipeEnd');
  });

  function mergeNext() {
    if (merging) return;
    merging = true;

    const streams = streamsQueue.shift();
    if (!streams) return process.nextTick(finishMerge);

    const activeStreams = Array.isArray(streams) ? streams : [streams];
    let remaining = activeStreams.length;

    activeStreams.forEach(stream => pipeStream(stream, () => {
      if (--remaining === 0) {
        merging = false;
        mergeNext();
      }
    }));
  }

  function pipeStream(stream, done) {
    if (stream._readableState?.endEmitted) return done();

    const onEnd = () => {
      cleanup();
      done();
    };

    const onError = (err) => {
      mergedStream.emit('error', err);
    };

    const cleanup = () => {
      stream.off('end', onEnd);
      stream.off('merge2UnpipeEnd', onEnd);
      if (pipeError) stream.off('error', onError);
    };

    stream.on('end', onEnd);
    stream.on('merge2UnpipeEnd', onEnd);
    if (pipeError) stream.on('error', onError);

    stream.pipe(mergedStream, { end: false });
    stream.resume();
  }

  function pauseStream(stream, options) {
    if (!Array.isArray(stream)) {
      if (!stream._readableState && stream.pipe) {
        stream = stream.pipe(new PassThrough(options));
      }
      if (!stream.pause || !stream.pipe) {
        throw new Error('Only readable stream can be merged.');
      }
      stream.pause();
    } else {
      return stream.map(s => pauseStream(s, options));
    }
    return stream;
  }

  function finishMerge() {
    merging = false;
    mergedStream.emit('queueDrain');
    if (end) mergedStream.end();
  }

  return mergedStream;
}

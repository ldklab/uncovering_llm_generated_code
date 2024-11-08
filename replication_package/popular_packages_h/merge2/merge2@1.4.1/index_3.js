'use strict';

const { PassThrough } = require('stream');

function merge2(...args) {
  const streamsQueue = [];
  let merging = false;
  let options = args[args.length - 1];

  if (options && typeof options === 'object' && options.pipe == null) {
    args.pop();
  } else {
    options = {};
  }

  const doEnd = options.end !== false;
  const doPipeError = options.pipeError === true;
  options.objectMode = options.objectMode ?? true;
  options.highWaterMark = options.highWaterMark ?? 64 * 1024;

  const mergedStream = new PassThrough(options);

  function addStream(...streams) {
    streamsQueue.push(...streams.map(stream => pauseStreams(stream, options)));
    mergeStream();
    return this;
  }

  function mergeStream() {
    if (merging) return;
    merging = true;

    const streams = streamsQueue.shift();
    if (!streams) {
      process.nextTick(endStream);
      return;
    }

    let pipesCount = streams.length;
    streams.forEach(stream => pipe(stream, () => {
      if (--pipesCount === 0) {
        merging = false;
        mergeStream();
      }
    }));
  }

  function pipe(stream, callback) {
    if (stream._readableState.endEmitted) {
      return callback();
    }

    const onEnd = () => {
      stream.off('merge2UnpipeEnd', onEnd);
      stream.off('end', onEnd);
      if (doPipeError) stream.off('error', onError);
      callback();
    };

    const onError = err => mergedStream.emit('error', err);

    stream.on('merge2UnpipeEnd', onEnd);
    stream.on('end', onEnd);
    if (doPipeError) stream.on('error', onError);

    stream.pipe(mergedStream, { end: false });
    stream.resume();
  }

  function endStream() {
    merging = false;
    mergedStream.emit('queueDrain');
    if (doEnd) mergedStream.end();
  }

  mergedStream.setMaxListeners(0);
  mergedStream.add = addStream;
  mergedStream.on('unpipe', stream => stream.emit('merge2UnpipeEnd'));

  if (args.length) {
    addStream(...args);
  }
  return mergedStream;
}

function pauseStreams(streams, options) {
  if (!Array.isArray(streams)) {
    if (!streams._readableState && streams.pipe) {
      streams = streams.pipe(new PassThrough(options));
    }
    if (!streams._readableState || !streams.pause || !streams.pipe) {
      throw new Error('Only readable stream can be merged.');
    }
    streams.pause();
  } else {
    streams.forEach((stream, index) => {
      streams[index] = pauseStreams(stream, options);
    });
  }
  return streams;
}

module.exports = merge2;

'use strict';

const { PassThrough } = require('stream');

module.exports = mergeStreams;

function mergeStreams(...args) {
  let streamsQueue = [];
  let merging = false;
  let options = args[args.length - 1];

  if (options && typeof options === 'object' && !Array.isArray(options) && !options.pipe) {
    args.pop();
  } else {
    options = {};
  }

  const endOnComplete = options.end !== false;
  const handleError = options.pipeError === true;
  options.objectMode = options.objectMode ?? true;
  options.highWaterMark = options.highWaterMark ?? 64 * 1024;

  const mergedStream = new PassThrough(options);

  mergedStream.setMaxListeners(0);
  mergedStream.add = addStream;

  mergedStream.on('unpipe', function (stream) {
    stream.emit('merge2UnpipeEnd');
  });

  if (args.length) {
    addStream(...args);
  }
  
  function addStream(...streams) {
    streamsQueue.push(...streams.map(stream => pauseStreams(stream, options)));
    initiateMerge();
    return this;
  }

  function initiateMerge() {
    if (merging) return;
    merging = true;

    let currentStreams = streamsQueue.shift();
    if (!currentStreams) {
      process.nextTick(() => finishMerge());
      return;
    }
    
    if (!Array.isArray(currentStreams)) {
      currentStreams = [currentStreams];
    }

    let activeStreams = currentStreams.length + 1;

    for (const stream of currentStreams) {
      pipeStream(stream);
    }
    
    proceedToNext();
    
    function proceedToNext() {
      if (--activeStreams > 0) return;
      merging = false;
      initiateMerge();
    }

    function pipeStream(stream) {
      const cleanup = () => {
        stream.removeListener('merge2UnpipeEnd', cleanup);
        stream.removeListener('end', cleanup);
        if (handleError) {
          stream.removeListener('error', onError);
        }
        proceedToNext();
      };

      const onError = (err) => mergedStream.emit('error', err);

      if (stream._readableState.endEmitted) {
        return proceedToNext();
      }

      stream.on('merge2UnpipeEnd', cleanup);
      stream.on('end', cleanup);

      if (handleError) {
        stream.on('error', onError);
      }

      stream.pipe(mergedStream, { end: false });
      stream.resume();
    }
  }

  function finishMerge() {
    merging = false;
    mergedStream.emit('queueDrain');
    if (endOnComplete) {
      mergedStream.end();
    }
  }

  function pauseStreams(stream, options) {
    if (Array.isArray(stream)) {
      return stream.map(singleStream => pauseStreams(singleStream, options));
    }

    if (!stream._readableState && stream.pipe) {
      stream = stream.pipe(new PassThrough(options));
    }

    if (!stream._readableState || !stream.pause || !stream.pipe) {
      throw new Error('Only readable streams can be merged.');
    }

    stream.pause();
    return stream;
  }

  return mergedStream;
}

'use strict'
const { PassThrough } = require('stream')

module.exports = mergeStreams

function mergeStreams() {
  const streamsQueue = []
  const args = Array.from(arguments)
  let merging = false
  let options = args[args.length - 1]

  if (options && typeof options === 'object' && options.pipe == null) {
    args.pop()
  } else {
    options = {}
  }

  const endMergedStream = options.end !== false
  const propagateErrors = options.pipeError === true

  options.objectMode = options.objectMode ?? true
  options.highWaterMark = options.highWaterMark ?? 64 * 1024

  const mergedStream = new PassThrough(options)

  function add() {
    for (const stream of arguments) {
      streamsQueue.push(prepareStream(stream, options))
    }
    startMerge()
    return this
  }

  function startMerge() {
    if (merging) return
    merging = true

    const streams = streamsQueue.shift()
    if (!streams) {
      process.nextTick(completeMerge)
      return
    }

    const currentStreams = Array.isArray(streams) ? streams : [streams]
    let pipesLeft = currentStreams.length + 1

    for (const stream of currentStreams) {
      handleStream(stream)
    }

    onPipeCompletion()

    function handleStream(stream) {
      if (stream._readableState.endEmitted) return onPipeCompletion()

      stream.on('end', onPipeCompletion)
      if (propagateErrors) stream.on('error', handleError)

      stream.pipe(mergedStream, { end: false })
      stream.resume()

      function handleError(error) {
        mergedStream.emit('error', error)
      }
    }

    function onPipeCompletion() {
      if (--pipesLeft === 0) {
        merging = false
        startMerge()
      }
    }
  }

  function completeMerge() {
    merging = false
    mergedStream.emit('queueDrain')
    if (endMergedStream) {
      mergedStream.end()
    }
  }

  mergedStream.setMaxListeners(0)
  mergedStream.add = add
  mergedStream.on('unpipe', stream => stream.emit('merge2UnpipeEnd'))

  if (args.length) {
    add.apply(null, args)
  }

  return mergedStream
}

function prepareStream(streams, options) {
  if (Array.isArray(streams)) {
    return streams.map(stream => prepareStream(stream, options))
  }

  if (!streams._readableState && streams.pipe) {
    streams = streams.pipe(new PassThrough(options))
  }

  if (!streams._readableState || !streams.pause || !streams.pipe) {
    throw new Error('Only readable stream can be merged.')
  }

  streams.pause()
  return streams
}

const { Stream } = require('stream');

function eos(stream, options, callback) {
  // If options is a function, reassign it as callback and use an empty object as options
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  options = options || {};
  callback = callback || function() {};

  // Determine if readable, writable, and error options are set
  const isReadable = options.readable !== false;
  const isWritable = options.writable !== false;
  const handleError = options.error !== false;
  
  // Track event states
  let hasClosed = false;
  let hasEnded = false;

  // Define cleanup function to remove event listeners
  function removeListeners() {
    stream.removeListener('close', handleClose);
    stream.removeListener('finish', handleFinish);
    stream.removeListener('end', handleEnd);
    stream.removeListener('error', handleErrorEvent);
  }

  // Error handler
  function handleErrorEvent(err) {
    if (!handleError) return;
    removeListeners();
    callback.call(stream, err);
  }

  // End event handler
  function handleEnd() {
    hasEnded = true;
    if (isWritable && hasClosed) return;
    if (!isReadable) return callback.call(stream);
    if (isWritable && stream.writable && !hasClosed) return;
    removeListeners();
    callback.call(stream);
  }

  // Close event handler
  function handleClose() {
    hasClosed = true;
    if (isReadable && hasEnded) return;
    if (isWritable && stream.writable && !hasEnded) return;
    removeListeners();
    callback.call(stream);
  }

  // Finish event handler
  function handleFinish() {
    handleEnd();
  }

  // Bind event handlers to the stream
  const handleEndBound = handleEnd.bind(stream);
  const handleFinishBound = handleFinish.bind(stream);
  const handleCloseBound = handleClose.bind(stream);
  const handleErrorBound = handleErrorEvent.bind(stream);

  // Attach event listeners based on options
  if (isReadable) stream.on('end', handleEndBound);
  if (isWritable) stream.on('finish', handleFinishBound);
  if (handleError) stream.on('error', handleErrorBound);
  stream.on('close', handleCloseBound);

  // Return the original stream
  return stream;
}

module.exports = eos;

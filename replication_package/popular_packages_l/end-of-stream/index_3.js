const { Stream } = require('stream');

function eos(stream, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  
  opts = opts || {};
  callback = callback || function() {};

  const shouldMonitorReadable = opts.readable !== false;
  const shouldMonitorWritable = opts.writable !== false;
  const shouldMonitorError = opts.error !== false;
  
  let closed = false;
  let ended = false;

  function cleanupListeners() {
    stream.removeListener('close', handleClose);
    stream.removeListener('finish', handleFinish);
    stream.removeListener('end', handleEnd);
    stream.removeListener('error', handleError);
  }

  function handleError(err) {
    if (!shouldMonitorError) return;
    cleanupListeners();
    callback.call(stream, err);
  }

  function handleEnd() {
    ended = true;
    if (shouldMonitorWritable && closed) return;
    if (!shouldMonitorReadable) return callback.call(stream);
    if (shouldMonitorWritable && stream.writable && !closed) return;
    cleanupListeners();
    callback.call(stream);
  }

  function handleClose() {
    closed = true;
    if (shouldMonitorReadable && ended) return;
    if (shouldMonitorWritable && stream.writable && !ended) return;
    cleanupListeners();
    callback.call(stream);
  }

  function handleFinish() {
    handleEnd();
  }

  const onClose = handleClose.bind(stream);
  const onFinish = handleFinish.bind(stream);
  const onEnd = handleEnd.bind(stream);
  const onError = handleError.bind(stream);

  if (shouldMonitorReadable) stream.on('end', onEnd);
  if (shouldMonitorWritable) stream.on('finish', onFinish);
  if (shouldMonitorError) stream.on('error', onError);
  stream.on('close', onClose);

  return stream;
}

module.exports = eos;

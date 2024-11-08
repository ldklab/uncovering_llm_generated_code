const { Stream } = require('stream');

function eos(stream, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  opts = opts || {};
  callback = callback || function() {};

  const {
    readable = true,
    writable = true,
    error = true,
  } = opts;

  let onClose, onFinish, onEnd, onError;
  let isClosed = false;
  let isEnded = false;

  function cleanupListeners() {
    stream.removeListener('close', onClose);
    stream.removeListener('finish', onFinish);
    stream.removeListener('end', onEnd);
    stream.removeListener('error', onError);
  }

  function handleError(err) {
    if (!error) return;
    cleanupListeners();
    callback.call(stream, err);
  }

  function handleEnd() {
    isEnded = true;
    if ((writable && isClosed) || !readable) {
      cleanupListeners();
      callback.call(stream);
    }
  }

  function handleClose() {
    isClosed = true;
    if ((readable && isEnded) || (writable && stream.writable && !isEnded)) {
      cleanupListeners();
      callback.call(stream);
    }
  }

  function handleFinish() {
    handleEnd();
  }

  onClose = handleClose.bind(stream);
  onFinish = handleFinish.bind(stream);
  onEnd = handleEnd.bind(stream);
  onError = handleError.bind(stream);

  if (readable) stream.on('end', onEnd);
  if (writable) stream.on('finish', onFinish);
  if (error) stream.on('error', onError);
  stream.on('close', onClose);

  return stream;
}

module.exports = eos;

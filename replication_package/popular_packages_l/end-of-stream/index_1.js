const { Stream } = require('stream');

function eos(stream, opts = {}, callback = () => {}) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  const readable = opts.readable !== false;
  const writable = opts.writable !== false;
  const error = opts.error !== false;
  
  let closed = false;
  let ended = false;

  function cleanup() {
    stream.removeListener('close', onClose);
    stream.removeListener('finish', onFinish);
    stream.removeListener('end', onEnd);
    stream.removeListener('error', onError);
  }

  function onError(err) {
    if (!error) return;
    cleanup();
    callback.call(stream, err);
  }

  function onEnd() {
    ended = true;
    if (writable && closed) return;
    if (!readable) return callback.call(stream);
    if (writable && stream.writable && !closed) return;
    cleanup();
    callback.call(stream);
  }

  function onClose() {
    closed = true;
    if (readable && ended) return;
    if (writable && stream.writable && !ended) return;
    cleanup();
    callback.call(stream);
  }

  function onFinish() {
    onEnd();
  }

  const onEndBound = onEnd.bind(stream);
  const onFinishBound = onFinish.bind(stream);
  const onErrorBound = onError.bind(stream);
  const onCloseBound = onClose.bind(stream);

  if (readable) stream.on('end', onEndBound);
  if (writable) stream.on('finish', onFinishBound);
  if (error) stream.on('error', onErrorBound);
  stream.on('close', onCloseBound);

  return stream;
}

module.exports = eos;

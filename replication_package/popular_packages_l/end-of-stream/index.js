const { Stream } = require('stream');

function eos(stream, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  
  opts = opts || {};
  callback = callback || function() {};

  const readable = opts.readable !== false;
  const writable = opts.writable !== false;
  const error = opts.error !== false;
  
  let onclose, onfinish, onend, onerror;
  let closed = false;
  let ended = false;

  function cleanup() {
    stream.removeListener('close', onclose);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
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

  onclose = onClose.bind(stream);
  onfinish = onFinish.bind(stream);
  onend = onEnd.bind(stream);
  onerror = onError.bind(stream);

  if (readable) stream.on('end', onend);
  if (writable) stream.on('finish', onfinish);
  if (error) stream.on('error', onerror);
  stream.on('close', onclose);

  return stream;
}

module.exports = eos;
```
```
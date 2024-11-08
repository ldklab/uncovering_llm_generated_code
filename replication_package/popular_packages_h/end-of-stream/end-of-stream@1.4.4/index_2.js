const once = require('once');

const noop = function() {};

const isRequest = function(stream) {
    return stream.setHeader && typeof stream.abort === 'function';
};

const isChildProcess = function(stream) {
    return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
};

const eos = function(stream, opts, callback) {
    if (typeof opts === 'function') return eos(stream, null, opts);
    if (!opts) opts = {};

    callback = once(callback || noop);

    let ws = stream._writableState;
    let rs = stream._readableState;
    let readable = opts.readable || (opts.readable !== false && stream.readable);
    let writable = opts.writable || (opts.writable !== false && stream.writable);
    let cancelled = false;

    const onLegacyFinish = function() {
        if (!stream.writable) onFinish();
    };

    const onFinish = function() {
        writable = false;
        if (!readable) callback.call(stream);
    };

    const onEnd = function() {
        readable = false;
        if (!writable) callback.call(stream);
    };

    const onExit = function(exitCode) {
        callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
    };

    const onError = function(err) {
        callback.call(stream, err);
    };

    const onClose = function() {
        process.nextTick(onCloseNextTick);
    };

    const onCloseNextTick = function() {
        if (cancelled) return;
        if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
        if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
    };

    const onRequest = function() {
        stream.req.on('finish', onFinish);
    };

    if (isRequest(stream)) {
        stream.on('complete', onFinish);
        stream.on('abort', onClose);
        if (stream.req) onRequest();
        else stream.on('request', onRequest);
    } else if (writable && !ws) { // legacy streams
        stream.on('end', onLegacyFinish);
        stream.on('close', onLegacyFinish);
    }

    if (isChildProcess(stream)) stream.on('exit', onExit);

    stream.on('end', onEnd);
    stream.on('finish', onFinish);
    if (opts.error !== false) stream.on('error', onError);
    stream.on('close', onClose);

    return function() {
        cancelled = true;
        stream.removeListener('complete', onFinish);
        stream.removeListener('abort', onClose);
        stream.removeListener('request', onRequest);
        if (stream.req) stream.req.removeListener('finish', onFinish);
        stream.removeListener('end', onLegacyFinish);
        stream.removeListener('close', onLegacyFinish);
        stream.removeListener('finish', onFinish);
        stream.removeListener('exit', onExit);
        stream.removeListener('end', onEnd);
        stream.removeListener('error', onError);
        stream.removeListener('close', onClose);
    };
};

module.exports = eos;

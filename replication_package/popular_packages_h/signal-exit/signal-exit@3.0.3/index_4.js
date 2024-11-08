const assert = require('assert');
const signals = require('./signals.js');
const isWin = /^win/i.test(process.platform);
const EventEmitter = require('events');

let emitter;
if (!process.__signal_exit_emitter__) {
  emitter = new EventEmitter();
  process.__signal_exit_emitter__ = emitter;
  emitter.setMaxListeners(Infinity);
  emitter.count = 0;
  emitter.emitted = {};
} else {
  emitter = process.__signal_exit_emitter__;
}

module.exports = function registerCallback(cb, opts) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

  if (!loaded) {
    load();
  }

  const ev = opts && opts.alwaysLast ? 'afterexit' : 'exit';
  const remove = () => {
    emitter.removeListener(ev, cb);
    if (!emitter.listeners('exit').length && !emitter.listeners('afterexit').length) {
      unload();
    }
  };
  emitter.on(ev, cb);

  return remove;
};

module.exports.unload = unload;
function unload() {
  if (!loaded) return;
  loaded = false;

  signals.forEach(sig => {
    try {
      process.removeListener(sig, sigListeners[sig]);
    } catch (err) {}
  });
  process.emit = originalProcessEmit;
  process.reallyExit = originalProcessReallyExit;
  emitter.count -= 1;
}

function emit(event, code, signal) {
  if (emitter.emitted[event]) return;
  emitter.emitted[event] = true;
  emitter.emit(event, code, signal);
}

const sigListeners = {};
signals.forEach(sig => {
  sigListeners[sig] = function listener() {
    const listeners = process.listeners(sig);
    if (listeners.length === emitter.count) {
      unload();
      emit('exit', null, sig);
      emit('afterexit', null, sig);
      if (isWin && sig === 'SIGHUP') sig = 'SIGINT';
      process.kill(process.pid, sig);
    }
  };
});

module.exports.signals = () => signals;

module.exports.load = load;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;

  emitter.count += 1;
  signals = signals.filter(sig => {
    try {
      process.on(sig, sigListeners[sig]);
      return true;
    } catch (err) {
      return false;
    }
  });

  process.emit = processEmit;
  process.reallyExit = processReallyExit;
}

const originalProcessReallyExit = process.reallyExit;
function processReallyExit(code) {
  process.exitCode = code || 0;
  emit('exit', process.exitCode, null);
  emit('afterexit', process.exitCode, null);
  originalProcessReallyExit.call(process, process.exitCode);
}

const originalProcessEmit = process.emit;
function processEmit(ev, arg) {
  if (ev === 'exit') {
    if (arg !== undefined) process.exitCode = arg;
    const ret = originalProcessEmit.apply(this, arguments);
    emit('exit', process.exitCode, null);
    emit('afterexit', process.exitCode, null);
    return ret;
  } else {
    return originalProcessEmit.apply(this, arguments);
  }
}

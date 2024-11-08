const assert = require('assert');
const signals = require('./signals.js');

const EventEmitter = require('events');
const isWindows = /^win/i.test(process.platform);

let emitter = process.__signal_exit_emitter__ || new EventEmitter();
process.__signal_exit_emitter__ = emitter;

if (!emitter.infinite) {
  emitter.setMaxListeners(Infinity);
  emitter.infinite = true;
}

emitter.count = emitter.count || 0;
emitter.emitted = emitter.emitted || {};

module.exports = function (cb, opts) {
  assert.equal(typeof cb, 'function', 'Callback must be a function');

  if (!loaded) {
    load();
  }

  const event = (opts && opts.alwaysLast) ? 'afterexit' : 'exit';
  
  const remove = () => {
    emitter.removeListener(event, cb);
    if (!emitter.listeners('exit').length && !emitter.listeners('afterexit').length) {
      unload();
    }
  };

  emitter.on(event, cb);
  return remove;
};

module.exports.unload = unload;

let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;

  emitter.count += 1;
  
  signals.forEach(sig => {
    try {
      process.on(sig, createSignalListener(sig));
      emitter.count += 1;
    } catch (error) {
      // Signal not supported on this platform, ignore.
    }
  });

  process.emit = enhancedProcessEmit;
  process.reallyExit = enhancedProcessReallyExit;
}

function unload() {
  if (!loaded) return;
  loaded = false;

  signals.forEach(sig => {
    try {
      process.removeListener(sig, createSignalListener(sig));
    } catch (error) {}
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

module.exports.signals = () => signals;

module.exports.load = load;

const sigListeners = {};

function createSignalListener(sig) {
  sigListeners[sig] = function () {
    const listeners = process.listeners(sig);
    if (listeners.length === emitter.count) {
      unload();
      emit('exit', null, sig);
      emit('afterexit', null, sig);
      
      if (isWindows && sig === 'SIGHUP') {
        sig = 'SIGINT';
      }
      process.kill(process.pid, sig);
    }
  };
  return sigListeners[sig];
}

const originalProcessEmit = process.emit;
const originalProcessReallyExit = process.reallyExit;

function enhancedProcessEmit(ev, arg) {
  if (ev === 'exit') {
    if (arg !== undefined) {
      process.exitCode = arg;
    }
    const ret = originalProcessEmit.apply(this, arguments);
    emit('exit', process.exitCode, null);
    emit('afterexit', process.exitCode, null);
    return ret;
  }
  return originalProcessEmit.apply(this, arguments);
}

function enhancedProcessReallyExit(code) {
  process.exitCode = code || 0;
  emit('exit', process.exitCode, null);
  emit('afterexit', process.exitCode, null);
  originalProcessReallyExit.call(process, process.exitCode);
}

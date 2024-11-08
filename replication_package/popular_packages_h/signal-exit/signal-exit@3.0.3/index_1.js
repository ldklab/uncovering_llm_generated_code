const assert = require('assert');
const signals = require('./signals.js');
const isWindows = /^win/i.test(process.platform);

const EventEmitter = require('events');

let emitter;
if (!process.__signal_exit_emitter__) {
  emitter = process.__signal_exit_emitter__ = new EventEmitter();
  emitter.count = 0;
  emitter.emitted = {};
  emitter.setMaxListeners(Infinity);
  emitter.infinite = true;
} else {
  emitter = process.__signal_exit_emitter__;
}

module.exports = function (callback, options) {
  assert.strictEqual(typeof callback, 'function', 'A callback function is required');

  if (!loaded) {
    load();
  }

  const event = options?.alwaysLast ? 'afterexit' : 'exit';

  emitter.on(event, callback);

  const removeListener = () => {
    emitter.removeListener(event, callback);
    if (!emitter.listeners('exit').length && !emitter.listeners('afterexit').length) {
      unload();
    }
  };

  return removeListener;
};

module.exports.unload = unload;

function unload() {
  if (!loaded) return;
  loaded = false;

  for (const signal of signals) {
    try {
      process.removeListener(signal, signalListeners[signal]);
    } catch {}
  }
  process.emit = originalProcessEmit;
  process.reallyExit = originalProcessReallyExit;
  emitter.count--;
}

function emit(event, code, signal) {
  if (!emitter.emitted[event]) {
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  }
}

const sigListeners = {};
for (const signal of signals) {
  sigListeners[signal] = () => {
    const listeners = process.listeners(signal);
    if (listeners.length === emitter.count) {
      unload();
      emit('exit', null, signal);
      if (isWindows && signal === 'SIGHUP') signal = 'SIGINT';
      process.kill(process.pid, signal);
    }
  };
}

module.exports.signals = () => signals;
module.exports.load = load;

let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  emitter.count++;

  signals = signals.filter(signal => {
    try {
      process.on(signal, sigListeners[signal]);
      return true;
    } catch {
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
  originalProcessReallyExit.call(process, process.exitCode);
}

const originalProcessEmit = process.emit;

function processEmit(event, arg) {
  if (event === 'exit') {
    if (arg !== undefined) process.exitCode = arg;
    const ret = originalProcessEmit.apply(this, arguments);
    emit('exit', process.exitCode, null);
    return ret;
  } else {
    return originalProcessEmit.apply(this, arguments);
  }
}

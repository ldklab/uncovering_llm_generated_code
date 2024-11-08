const assert = require('assert');
const signals = require('./signals.js');
const EE = require('events');

const isWin = /^win/i.test(process.platform);
let emitter = process.__signal_exit_emitter__ || initializeEmitter();

module.exports = function (cb, opts) {
  assert.equal(typeof cb, 'function', 'Callback must be a function');
  if (!loaded) load();

  const eventType = opts && opts.alwaysLast ? 'afterexit' : 'exit';
  const removeListener = () => {
    emitter.removeListener(eventType, cb);
    if (!emitter.listeners('exit').length && !emitter.listeners('afterexit').length) {
      unload();
    }
  };
  
  emitter.on(eventType, cb);
  return removeListener;
};

module.exports.unload = unload;
module.exports.signals = () => signals;
module.exports.load = load;

let loaded = false;

function initializeEmitter() {
  const newEmitter = new EE();
  newEmitter.setMaxListeners(Infinity);
  newEmitter.count = 0;
  newEmitter.emitted = {};
  process.__signal_exit_emitter__ = newEmitter;
  return newEmitter;
}

function load() {
  if (loaded) return;
  loaded = true;
  emitter.count += 1;

  signals.forEach((sig) => {
    try {
      process.on(sig, sigListeners[sig]);
    } catch (error) { /* Signal might not be supported */ }
  });

  process.emit = customEmit;
  process.reallyExit = customReallyExit;
}

function unload() {
  if (!loaded) return;
  loaded = false;

  signals.forEach((sig) => {
    try {
      process.removeListener(sig, sigListeners[sig]);
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

const sigListeners = {};
signals.forEach((sig) => {
  sigListeners[sig] = function listener() {
    const listeners = process.listeners(sig);
    if (listeners.length === emitter.count) {
      unload();
      emit('exit', null, sig);
      emit('afterexit', null, sig);
      if (isWin && sig === 'SIGHUP') sig = 'SIGINT';
      process.kill(process.pid, sig);
    }
  }
});

const originalProcessReallyExit = process.reallyExit;
function customReallyExit(code) {
  process.exitCode = code || 0;
  emit('exit', process.exitCode, null);
  emit('afterexit', process.exitCode, null);
  originalProcessReallyExit.call(process, process.exitCode);
}

const originalProcessEmit = process.emit;
function customEmit(event, arg) {
  if (event === 'exit') {
    if (arg !== undefined) process.exitCode = arg;
    const result = originalProcessEmit.apply(this, arguments);
    emit('exit', process.exitCode, null);
    emit('afterexit', process.exitCode, null);
    return result;
  } else {
    return originalProcessEmit.apply(this, arguments);
  }
}

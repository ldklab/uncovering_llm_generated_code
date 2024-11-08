"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsByNumber = exports.signalsByName = void 0;

const { constants: { signals: osSignals } } = require("os");

const { getSignals } = require("./signals.js");
const { SIGRTMAX } = require("./realtime.js");

const mapSignalsByName = () => {
  const signals = getSignals();
  return signals.reduce((acc, { name, number, description, supported, action, forced, standard }) => {
    acc[name] = { name, number, description, supported, action, forced, standard };
    return acc;
  }, {});
};

const signalsByName = mapSignalsByName();
exports.signalsByName = signalsByName;

const mapSignalsByNumber = () => {
  const signals = getSignals();
  const maxNumber = SIGRTMAX + 1;
  const indexedSignals = Array.from({ length: maxNumber }, (_, number) => findSignalPropertiesByNumber(number, signals));
  return Object.assign({}, ...indexedSignals);
};

const findSignalPropertiesByNumber = (number, signals) => {
  const signal = locateSignalByNumber(number, signals);
  
  if (!signal) {
    return {};
  }

  const { name, description, supported, action, forced, standard } = signal;
  
  return {
    [number]: { name, number, description, supported, action, forced, standard }
  };
};

const locateSignalByNumber = (number, signals) => {
  return signals.find(({ name }) => osSignals[name] === number) ||
         signals.find(signal => signal.number === number);
};

const signalsByNumber = mapSignalsByNumber();
exports.signalsByNumber = signalsByNumber;

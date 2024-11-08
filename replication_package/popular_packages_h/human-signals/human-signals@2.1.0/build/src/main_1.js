"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsByNumber = exports.signalsByName = void 0;

const { constants: { signals: osSignals } } = require("os");
const { getSignals } = require("./signals.js");
const { SIGRTMAX } = require("./realtime.js");

const getSignalsByName = () => {
  const signals = getSignals();
  return signals.reduce((acc, { name, number, description, supported, action, forced, standard }) => ({
    ...acc,
    [name]: { name, number, description, supported, action, forced, standard }
  }), {});
};

const getSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (signal === undefined) return {};
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: { name, number, description, supported, action, forced, standard }
  };
};

const findSignalByNumber = (number, signals) => {
  const signal = signals.find(({ name }) => osSignals[name] === number);
  if (signal !== undefined) return signal;
  return signals.find(signal => signal.number === number);
};

const getSignalsByNumber = () => {
  const signals = getSignals();
  const signalsArray = Array.from({ length: SIGRTMAX + 1 }, (_, number) =>
    getSignalByNumber(number, signals)
  );
  return Object.assign({}, ...signalsArray);
};

const signalsByName = getSignalsByName();
const signalsByNumber = getSignalsByNumber();

exports.signalsByName = signalsByName;
exports.signalsByNumber = signalsByNumber;

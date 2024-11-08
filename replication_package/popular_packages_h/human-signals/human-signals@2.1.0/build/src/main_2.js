"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { constants } = require("os");
const { getSignals: getSignalsFromModule } = require("./signals.js");
const { SIGRTMAX } = require("./realtime.js");

// Generate mapping of signals by name
const getSignalsByName = () => {
  const signals = getSignalsFromModule();
  return signals.reduce((signalByNameMemo, { name, number, description, supported, action, forced, standard }) => ({
    ...signalByNameMemo,
    [name]: { name, number, description, supported, action, forced, standard }
  }), {});
};

const signalsByName = getSignalsByName();
exports.signalsByName = signalsByName;

// Generate mapping of signals by number
const getSignalsByNumber = () => {
  const signals = getSignalsFromModule();
  const length = SIGRTMAX + 1;
  const signalsA = Array.from({ length }, (_, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsA);
};

const getSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (signal === undefined) {
    return {};
  }
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: { name, number, description, supported, action, forced, standard }
  };
};

const findSignalByNumber = (number, signals) => {
  const signal = signals.find(({ name }) => constants.signals[name] === number);
  if (signal !== undefined) {
    return signal;
  }
  return signals.find(signalA => signalA.number === number);
};

const signalsByNumber = getSignalsByNumber();
exports.signalsByNumber = signalsByNumber;

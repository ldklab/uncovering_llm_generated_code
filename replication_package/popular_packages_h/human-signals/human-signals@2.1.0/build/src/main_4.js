"use strict";

// Imports
const { constants: { signals: OS_SIGNALS } } = require("os");
const { getSignals } = require("./signals.js");
const { SIGRTMAX } = require("./realtime.js");

// Generate a map of signals indexed by their name
const getSignalsByName = function() {
  const signals = getSignals();
  return signals.reduce((signalByNameMemo, { name, number, description, supported, action, forced, standard }) => {
    return {
      ...signalByNameMemo,
      [name]: { name, number, description, supported, action, forced, standard }
    };
  }, {});
};

const signalsByName = getSignalsByName();
exports.signalsByName = signalsByName;

// Generate a map of signals indexed by their number, include real-time signals
const getSignalsByNumber = function() {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsArray = Array.from({ length }, (_, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsArray);
};

const getSignalByNumber = function(number, signals) {
  const signal = findSignalByNumber(number, signals);
  if (!signal) return {};
  
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: { name, number, description, supported, action, forced, standard }
  };
};

const findSignalByNumber = function(number, signals) {
  return signals.find(({ name }) => OS_SIGNALS[name] === number) ||
         signals.find(signal => signal.number === number);
};

const signalsByNumber = getSignalsByNumber();
exports.signalsByNumber = signalsByNumber;

import { constants } from "node:os";
import { SIGRTMAX } from "./realtime.js";
import { getSignals } from "./signals.js";

const formatSignalByName = (signal) => [signal.name, signal];

const getSignalsByName = () => {
  const signals = getSignals();
  return Object.fromEntries(signals.map(formatSignalByName));
};

export const signalsByName = getSignalsByName();

const formatSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (!signal) return {};

  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: { name, number, description, supported, action, forced, standard },
  };
};

const getSignalsByNumber = () => {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsArray = Array.from({ length }, (_, number) =>
    formatSignalByNumber(number, signals)
  );
  return Object.assign({}, ...signalsArray);
};

export const signalsByNumber = getSignalsByNumber();

const findSignalByNumber = (number, signals) =>
  signals.find(({ name }) => constants.signals[name] === number) ||
  signals.find((signal) => signal.number === number);

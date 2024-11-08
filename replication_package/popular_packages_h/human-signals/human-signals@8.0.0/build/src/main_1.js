import { constants } from "node:os";
import { SIGRTMAX } from "./realtime.js";
import { getSignals } from "./signals.js";

const getSignalsByName = () => {
  const signals = getSignals();
  return Object.fromEntries(signals.map((signal) => [
    signal.name,
    signal
  ]));
};

export const signalsByName = getSignalsByName();

const getSignalsByNumber = () => {
  const signals = getSignals();
  const signalObjects = Array.from({ length: SIGRTMAX + 1 }, (_, number) =>
    getSignalByNumber(number, signals)
  );
  return Object.assign({}, ...signalObjects);
};

const getSignalByNumber = (number, signals) => {
  const signal = findSignalByNumber(number, signals);
  return signal ? {
    [number]: signal
  } : {};
};

const findSignalByNumber = (number, signals) => {
  return signals.find(({ name }) => constants.signals[name] === number) || 
         signals.find((signal) => signal.number === number);
};

export const signalsByNumber = getSignalsByNumber();

// human-signals.js
export const signalsByName = {
  SIGINT: {
    name: 'SIGINT',
    number: 2,
    description: 'User interruption with CTRL-C',
    supported: true,
    action: 'terminate',
    forced: false,
    standard: 'ansi',
  },
  SIGFPE: {
    name: 'SIGFPE',
    number: 8,
    description: 'Floating point arithmetic error',
    supported: true,
    action: 'core',
    forced: false,
    standard: 'ansi',
  },
  // Add more signals as needed...
};

export const signalsByNumber = {};

Object.values(signalsByName).forEach(signal => {
  signalsByNumber[signal.number] = signal;
});

export function getSignalByName(name) {
  return signalsByName[name];
}

export function getSignalByNumber(number) {
  return signalsByNumber[number];
}

// Usage example:
console.log(getSignalByName('SIGINT'));
console.log(getSignalByNumber(8));

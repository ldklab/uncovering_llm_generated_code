// human-signals.js
export const signals = [
  {
    name: 'SIGINT',
    number: 2,
    description: 'User interruption with CTRL-C',
    supported: true,
    action: 'terminate',
    forced: false,
    standard: 'ansi',
  },
  {
    name: 'SIGFPE',
    number: 8,
    description: 'Floating point arithmetic error',
    supported: true,
    action: 'core',
    forced: false,
    standard: 'ansi',
  },
  // Add more signals as needed...
];

export const signalsByName = Object.fromEntries(
  signals.map(signal => [signal.name, signal])
);

export const signalsByNumber = Object.fromEntries(
  signals.map(signal => [signal.number, signal])
);

export function getSignalByName(name) {
  return signalsByName[name];
}

export function getSignalByNumber(number) {
  return signalsByNumber[number];
}

// Usage example:
console.log(getSignalByName('SIGINT'));
console.log(getSignalByNumber(8));

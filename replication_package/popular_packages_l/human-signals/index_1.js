// signals.js
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
  // Additional signals can be added here...
};

// Create an object mapping signal numbers to their details using signalsByName
export const signalsByNumber = {};
for (const signal of Object.values(signalsByName)) {
  signalsByNumber[signal.number] = signal;
}

// Retrieve signal information by name
export function getSignalByName(name) {
  return signalsByName[name];
}

// Retrieve signal information by number
export function getSignalByNumber(number) {
  return signalsByNumber[number];
}

// Example usage for demonstration
console.log(getSignalByName('SIGINT'));
console.log(getSignalByNumber(8));

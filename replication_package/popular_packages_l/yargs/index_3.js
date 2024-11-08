#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Set up and configure command-line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --ships [num] --distance [num]')
  .option('ships', {
    describe: 'Number of ships',
    type: 'number',
    demandOption: true
  })
  .option('distance', {
    describe: 'Distance to target',
    type: 'number',
    demandOption: true
  })
  .help('h')
  .alias('h', 'help')
  .argv;

// Conditional logic based on the `ships` and `distance` arguments
if (argv.ships > 3 && argv.distance < 53.5) {
  console.log('Plunder more riffiwobbles!');
} else {
  console.log('Retreat from the xupptumblers!');
}

// Define a command to start a server with optional verbose logging
yargs(hideBin(process.argv))
  .command('serve [port]', 'Start the server', yargs => {
    yargs.positional('port', {
      describe: 'Port to bind on',
      default: 5000,
      type: 'number'
    });
  }, argv => {
    if (argv.verbose) console.info(`Server starting on port ${argv.port}...`);
    // hypothetical serve function
    // serve(argv.port);
    console.log(`Server is running on port ${argv.port}`);
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .help()
  .argv;

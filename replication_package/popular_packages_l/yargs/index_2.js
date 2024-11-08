#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Configure command-line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 --ships [num] --distance [num]')
  .describe('ships', 'Number of ships')
  .describe('distance', 'Distance to target')
  .demandOption(['ships', 'distance'], 'Please provide both ships and distance arguments to work with this tool')
  .help('h')
  .alias('h', 'help')
  .argv;

// Conditional logic based on input arguments
if (argv.ships > 3 && argv.distance < 53.5) {
  console.log('Plunder more riffiwobbles!');
} else {
  console.log('Retreat from the xupptumblers!');
}

// Command handling with options
yargs(hideBin(process.argv))
  .command('serve [port]', 'Start the server', yargs => {
    yargs.positional('port', {
      describe: 'Port to bind on',
      default: 5000
    });
  }, argv => {
    if (argv.verbose) console.info(`Server starting on port ${argv.port}...`);
    console.log(`Server is running on port ${argv.port}`);
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .help()
  .argv;

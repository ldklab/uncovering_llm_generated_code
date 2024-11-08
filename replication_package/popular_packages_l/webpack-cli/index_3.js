#!/usr/bin/env node

const { execSync } = require('child_process');

// Command mapping with shorthand aliases
const commands = {
  build: 'webpack',
  bundle: 'webpack',
  b: 'webpack',

  configtest: (path) => `webpack --config-test ${path}`,
  t: (path) => `webpack --config-test ${path}`,

  help: 'webpack --help',
  h: 'webpack --help',

  info: 'webpack-cli info',
  i: 'webpack-cli info',

  init: (path = '.') => `webpack-cli init ${path}`,
  create: (path = '.') => `webpack-cli init ${path}`,
  new: (path = '.') => `webpack-cli init ${path}`,
  c: (path = '.') => `webpack-cli init ${path}`,
  n: (path = '.') => `webpack-cli init ${path}`,

  loader: (output) => `webpack-cli loader ${output}`,
  l: (output) => `webpack-cli loader ${output}`,

  plugin: (output) => `webpack-cli plugin ${output}`,
  p: (output) => `webpack-cli plugin ${output}`,

  serve: 'webpack serve',
  server: 'webpack serve',
  s: 'webpack serve',

  version: 'webpack --version',
  v: 'webpack --version',

  watch: 'webpack --watch',
  w: 'webpack --watch',
};

// Parse function to identify the command and its arguments
function parseArguments(argv) {
  let command = '';
  const args = [];

  argv.slice(2).forEach(arg => {
    if (arg.startsWith('-')) {
      args.push(arg);
    } else if (command === '') {
      command = arg;
    } else {
      args.push(arg);
    }
  });

  return { command, args };
}

// Main execution function
function main() {
  const { command, args } = parseArguments(process.argv);
  const executeCommand = commands[command] || commands['build'];
  let commandString;

  if (typeof executeCommand === 'function') {
    commandString = executeCommand(...args);
  } else {
    commandString = executeCommand;
  }

  try {
    execSync(commandString, { stdio: 'inherit' });
    process.exit(0);
  } catch (err) {
    console.error('Error executing command:', err.message);
    process.exit(1);
  }
}

// Initiate the process
main();

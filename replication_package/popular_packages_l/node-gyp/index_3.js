// index.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function configure() {
  const bindingGyp = path.join(process.cwd(), 'binding.gyp');
  if (!fs.existsSync(bindingGyp)) {
    throw new Error("binding.gyp not found in current directory.");
  }
  console.log('Configuring project...');
  execSync('node-gyp configure', { stdio: 'inherit' });
}

function build() {
  console.log('Building project...');
  execSync('node-gyp build', { stdio: 'inherit' });
}

function clean() {
  console.log('Cleaning up build directory...');
  execSync('node-gyp clean', { stdio: 'inherit' });
}

function rebuild() {
  console.log('Rebuilding project...');
  clean();
  configure();
  build();
}

function help() {
  console.log(`
    node-gyp commands:
    - configure: Generate configuration files for the current platform.
    - build: Compile the native addon.
    - clean: Remove the build files.
    - rebuild: Perform clean, configure, and build operations.
  `);
}

function runCommand(command) {
  switch (command) {
    case 'configure':
      configure();
      break;
    case 'build':
      build();
      break;
    case 'clean':
      clean();
      break;
    case 'rebuild':
      rebuild();
      break;
    case 'help':
    default:
      help();
  }
}

const command = process.argv[2] || 'help';
runCommand(command);

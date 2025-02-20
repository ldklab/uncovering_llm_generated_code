// index.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NODE_VERSION = process.version;

function configure() {
  const bindingGypPath = path.resolve(process.cwd(), 'binding.gyp');
  if (!fs.existsSync(bindingGypPath)) {
    throw new Error("binding.gyp not found in the current directory.");
  }
  console.log('Configuring project...');
  try {
    execSync('node-gyp configure', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to configure project:', error);
  }
}

function build() {
  console.log('Building project...');
  try {
    execSync('node-gyp build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to build project:', error);
  }
}

function clean() {
  console.log('Cleaning up build directory...');
  try {
    execSync('node-gyp clean', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to clean build directory:', error);
  }
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

function executeNodeGypCommand(command) {
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

const userCommand = process.argv[2] || 'help';
executeNodeGypCommand(userCommand);

// index.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function verifyBindingGyp() {
  const bindingGypPath = path.join(process.cwd(), 'binding.gyp');
  if (!fs.existsSync(bindingGypPath)) {
    throw new Error("binding.gyp not found in current directory.");
  }
}

function runNodeGypCommand(command) {
  console.log(`${command.charAt(0).toUpperCase() + command.slice(1)} project...`);
  execSync(`node-gyp ${command}`, { stdio: 'inherit' });
}

function configure() {
  verifyBindingGyp();
  runNodeGypCommand('configure');
}

function build() {
  runNodeGypCommand('build');
}

function clean() {
  runNodeGypCommand('clean');
}

function rebuild() {
  console.log('Rebuilding project...');
  clean();
  configure();
  build();
}

function displayHelp() {
  console.log(`
    node-gyp commands:
    - configure: Generate configuration files for the current platform.
    - build: Compile the native addon.
    - clean: Remove the build files.
    - rebuild: Perform clean, configure, and build operations.
    - help: Display this help message.
  `);
}

function executeCommand(command) {
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
      displayHelp();
  }
}

const userCommand = process.argv[2] || 'help';
executeCommand(userCommand);

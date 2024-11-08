// index.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check and configure the project
function configure() {
  const bindingGypFilePath = path.join(process.cwd(), 'binding.gyp');

  if (!fs.existsSync(bindingGypFilePath)) {
    throw new Error('Error: binding.gyp file not found in the current directory.');
  }

  console.log('Configuring the project with node-gyp...');
  execSync('node-gyp configure', { stdio: 'inherit' });
}

// Function to build the project using node-gyp
function build() {
  console.log('Building the project with node-gyp...');
  execSync('node-gyp build', { stdio: 'inherit' });
}

// Function to clean the build directory
function clean() {
  console.log('Cleaning the build directory using node-gyp...');
  execSync('node-gyp clean', { stdio: 'inherit' });
}

// Function to rebuild the project by cleaning and then configuring and building
function rebuild() {
  console.log('Rebuilding the project...');
  clean();
  configure();
  build();
}

// Function to display help information on available commands
function help() {
  console.log(`
    Available node-gyp commands:
    - configure: Generate configuration files for the current platform.
    - build: Compile the native addon using node-gyp.
    - clean: Remove existing build files from the build directory.
    - rebuild: Conduct a clean, configure, and build sequence.
  `);
}

// Function to handle and route command line arguments to corresponding actions
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
    case '-h':
    case '--help':
    case 'help':
    default:
      help();
  }
}

// Determine the command from the arguments, default to 'help' if none specified
const command = process.argv[2] || 'help';
runCommand(command);

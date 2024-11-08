// envinfo.js
const { execSync } = require('child_process');
const os = require('os');

// Function to gather system-related information
function gatherSystemInfo() {
  return {
    OS: `${os.type()} ${os.release()}`,
    CPU: os.cpus()[0].model,
    Memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
    Shell: process.env.SHELL || 'N/A'
  };
}

// Function to execute a command and return its output
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return 'Not Found';
  }
}

// Function to gather information about command line tools
function gatherBinaryInfo() {
  return {
    Node: runCommand('node -v'),
    npm: runCommand('npm -v'),
    Yarn: runCommand('yarn -v')
  };
}

// Function to gather information about browsers
function gatherBrowserInfo() {
  return {
    Chrome: runCommand("google-chrome --version || chrome --version"),
    Firefox: runCommand("firefox --version"),
    Safari: runCommand("safaridriver --version")
  };
}

// Function to format information as JSON
function formatAsJson(info) {
  return JSON.stringify(info, null, 2);
}

// Main function for gathering and formatting info
async function run(config, options = {}) {
  const info = {};

  if (config.System) {
    info.System = gatherSystemInfo();
  }

  if (config.Binaries) {
    info.Binaries = gatherBinaryInfo();
  }

  if (config.Browsers) {
    info.Browsers = gatherBrowserInfo();
  }

  return options.json ? formatAsJson(info) : info;
}

// Function to display information in the console
function displayInfo() {
  const config = { System: true, Binaries: true, Browsers: true };
  run(config, { json: true }).then(info => console.log(info));
}

// If the script is run directly, display the info
if (require.main === module) {
  displayInfo();
}

module.exports = { run };

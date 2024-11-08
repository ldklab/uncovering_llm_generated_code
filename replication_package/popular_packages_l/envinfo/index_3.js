const { execSync } = require('child_process');
const os = require('os');

function getSystemDetails() {
  return {
    OS: `${os.type()} ${os.release()}`,
    CPU: os.cpus()[0].model,
    Memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
    Shell: process.env.SHELL || 'N/A',
  };
}

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch {
    return 'Not Found';
  }
}

function fetchBinaryDetails() {
  return {
    Node: executeCommand('node -v'),
    npm: executeCommand('npm -v'),
    Yarn: executeCommand('yarn -v'),
  };
}

function fetchBrowserDetails() {
  return {
    Chrome: executeCommand("google-chrome --version || chrome --version"),
    Firefox: executeCommand("firefox --version"),
    Safari: executeCommand("safaridriver --version"),
  };
}

function convertToJson(data) {
  return JSON.stringify(data, null, 2);
}

async function gatherInformation(config, options = {}) {
  const details = {};

  if (config.System) {
    details.System = getSystemDetails();
  }

  if (config.Binaries) {
    details.Binaries = fetchBinaryDetails();
  }

  if (config.Browsers) {
    details.Browsers = fetchBrowserDetails();
  }
  
  return options.json ? convertToJson(details) : details;
}

function showInformation() {
  const config = { System: true, Binaries: true, Browsers: true };
  gatherInformation(config, { json: true }).then(console.log);
}

if (require.main === module) {
  showInformation();
}

module.exports = { gatherInformation };

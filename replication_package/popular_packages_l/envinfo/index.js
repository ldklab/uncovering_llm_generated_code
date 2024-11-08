markdown
// envinfo.js
const { execSync } = require('child_process');
const os = require('os');

function gatherSystemInfo() {
  return {
    OS: `${os.type()} ${os.release()}`,
    CPU: os.cpus()[0].model,
    Memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
    Shell: process.env.SHELL || 'N/A',
  };
}

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'Not Found';
  }
}

function gatherBinaryInfo() {
  return {
    Node: runCommand('node -v'),
    npm: runCommand('npm -v'),
    Yarn: runCommand('yarn -v'),
  };
}

function gatherBrowserInfo() {
  return {
    Chrome: runCommand("google-chrome --version || chrome --version"),
    Firefox: runCommand("firefox --version"),
    Safari: runCommand("safaridriver --version"),
  };
}

function formatAsJson(info) {
  return JSON.stringify(info, null, 2);
}

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

function displayInfo() {
  const config = { System: true, Binaries: true, Browsers: true };
  run(config, { json: true }).then(info => console.log(info));
}

if (require.main === module) {
  displayInfo();
}

module.exports = { run };

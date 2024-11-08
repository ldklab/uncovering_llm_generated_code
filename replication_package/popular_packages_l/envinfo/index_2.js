// envinfo.js
const { execSync } = require('child_process');
const os = require('os');

const gatherSystemInfo = () => ({
  OS: `${os.type()} ${os.release()}`,
  CPU: os.cpus()[0].model,
  Memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
  Shell: process.env.SHELL || 'N/A',
});

const runCommand = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return 'Not Found';
  }
};

const gatherBinaryInfo = () => ({
  Node: runCommand('node -v'),
  npm: runCommand('npm -v'),
  Yarn: runCommand('yarn -v'),
});

const gatherBrowserInfo = () => ({
  Chrome: runCommand("google-chrome --version || chrome --version"),
  Firefox: runCommand("firefox --version"),
  Safari: runCommand("safaridriver --version"),
});

const formatAsJson = (info) => JSON.stringify(info, null, 2);

const run = async (config, options = {}) => {
  const info = {};

  if (config.System) info.System = gatherSystemInfo();
  if (config.Binaries) info.Binaries = gatherBinaryInfo();
  if (config.Browsers) info.Browsers = gatherBrowserInfo();

  return options.json ? formatAsJson(info) : info;
};

const displayInfo = () => {
  const config = { System: true, Binaries: true, Browsers: true };
  run(config, { json: true }).then(console.log);
};

if (require.main === module) {
  displayInfo();
}

module.exports = { run };

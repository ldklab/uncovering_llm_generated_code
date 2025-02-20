// envinfo.js
const { execSync } = require('child_process');
const os = require('os');

/**
 * Collects system-related information such as OS, CPU model,
 * total memory, and the default shell.
 */
function gatherSystemInfo() {
  return {
    OS: `${os.type()} ${os.release()}`,
    CPU: os.cpus()[0].model,
    Memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
    Shell: process.env.SHELL || 'N/A',
  };
}

/**
 * Executes a given command in the shell and returns the output.
 * In case of an error, returns 'Not Found'.
 * 
 * @param {string} cmd - The command to execute.
 * @return {string} - The command output or 'Not Found'.
 */
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'Not Found';
  }
}

/**
 * Collects information about commonly used development binaries and their versions.
 */
function gatherBinaryInfo() {
  return {
    Node: runCommand('node -v'),
    npm: runCommand('npm -v'),
    Yarn: runCommand('yarn -v'),
  };
}

/**
 * Gathers information about installed web browsers and their versions.
 */
function gatherBrowserInfo() {
  return {
    Chrome: runCommand("google-chrome --version || chrome --version"),
    Firefox: runCommand("firefox --version"),
    Safari: runCommand("safaridriver --version"),
  };
}

/**
 * Formats the collected information as a JSON string with indentation.
 * 
 * @param {Object} info - The information to format.
 * @return {string} - The formatted JSON string.
 */
function formatAsJson(info) {
  return JSON.stringify(info, null, 2);
}

/**
 * Main function to gather and optionally format system, binary, and browser information.
 * 
 * @param {Object} config - Configuration object specifying what info to gather.
 * @param {Object} [options] - Options that may alter how the info is returned.
 * @return {Promise<string|Object>} - The collected information either as JSON or object.
 */
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

/**
 * Displays the collected information on the console as JSON.
 */
function displayInfo() {
  const config = { System: true, Binaries: true, Browsers: true };
  run(config, { json: true }).then(info => console.log(info));
}

// Execute displayInfo if this script is run as a standalone module.
if (require.main === module) {
  displayInfo();
}

module.exports = { run };

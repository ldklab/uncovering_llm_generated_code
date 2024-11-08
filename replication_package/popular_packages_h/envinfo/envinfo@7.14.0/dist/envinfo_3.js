// Main Code
(() => {
  const {
    extractSystemInfo,
    extractSoftwareInfo,
    extractPackageInfo,
    formatOutput,
    helpers,
  } = require('./infoModules');

  async function getInfo(options) {
    options.console && console.log('Processing the requested information...');
    try {
      const systemInfo = await extractSystemInfo();
      const softwareInfo = await extractSoftwareInfo();
      const packageInfo = await extractPackageInfo(options);

      const result = {
        ...systemInfo,
        ...softwareInfo,
        ...packageInfo,
      };

      const output = formatOutput(result, options);
      return output;
    } catch (error) {
      console.error('Error while retrieving information:', error.message);
    }
  }

  module.exports = { getInfo, helpers };
})();

// infoModules.js
module.exports = {
  extractSystemInfo,
  extractSoftwareInfo,
  extractPackageInfo,
  formatOutput,
  helpers: require('./infoHelpers')
};

function extractSystemInfo() {
  // System information extraction logic
  return Promise.resolve({ OS: 'Linux', RAM: '16GB' });
}

function extractSoftwareInfo() {
  // Software information extraction logic
  return Promise.resolve({ Node: 'v14.17.0', npm: 'v6.14.13' });
}

function extractPackageInfo(options) {
  // Package information extraction logic
  return Promise.resolve({ express: '4.17.1', lodash: '4.17.15' });
}

function formatOutput(info, options) {
  if (options.format === 'json') {
    return JSON.stringify(info);
  } else if (options.format === 'yaml') {
    return yaml.stringify(info);
  } else {
    return markdown(info);
  }
}

// infoHelpers.js
module.exports = {
  log,
  runCommand,
  readPackageJson,
};

function log(message) {
  console.log(message);
}

function runCommand(command) {
  // Simulate running a command
  return Promise.resolve('Command output');
}

function readPackageJson() {
  // Simulate reading a package.json file
  return Promise.resolve({ name: 'test-package', version: '1.0.0' });
}

function markdown(info) {
  // Fake markdown formatting
  return `###
  ${JSON.stringify(info, null, 2)}
  ###`;
}

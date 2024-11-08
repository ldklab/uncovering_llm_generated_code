const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

function getModuleExport(id) {
  if (cache[id]) return cache[id].exports;
  const module = cache[id] = { loaded: false, exports: {} };
  packages[id].call(module.exports, module, module.exports, getModuleExport);
  module.loaded = true;
  return module.exports;
}

const isWindows = process.platform.startsWith('win');
const packages = [
  function (module, exports, require) { module.exports = require('path'); },
  function (module, exports, require) {
    const path = require(0);
    const log = (...args) => process.env.DEBUG && console.log(...args);
    const runCommand = (command, unifyOutput = false) => {
      return new Promise((resolve, reject) => {
        exec(command, { stdio: ['ignore', 'pipe', 'ignore'] }, (error, stdout, stderr) => {
          const output = unifyOutput ? `${stdout}${stderr}` : stdout;
          resolve((error ? '' : output).trim());
        });
      });
    };
    module.exports = { log, runCommand, getPackageInfo };
  },
];

let cache = {};
const modules = { require: getModuleExport };

getModuleExport(1).runCommand('node -v').then(version => {
  console.log('Node.js Version:', version);
});

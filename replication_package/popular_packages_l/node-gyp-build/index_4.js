// Revised node-gyp-build/index.js

const { existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

function loadBinding(directory) {
  const getPrebuildFilePath = (suffix) => join(directory, 'prebuilds', `${process.platform}-${process.arch}`, suffix);

  const prebuildFiles = [
    getPrebuildFilePath(`node-${process.versions.node}.node`),
    getPrebuildFilePath(`abi-${process.versions.modules}.node`),
    getPrebuildFilePath('napi.node')
  ];

  for (const file of prebuildFiles) {
    if (existsSync(file)) {
      return require(file);
    }
  }

  console.log('No prebuild found, compiling...');
  execSync('node-gyp rebuild', { stdio: 'inherit', cwd: directory });

  const bindingFile = join(directory, 'build', 'Release', 'binding.node');
  return require(bindingFile);
}

module.exports = loadBinding;

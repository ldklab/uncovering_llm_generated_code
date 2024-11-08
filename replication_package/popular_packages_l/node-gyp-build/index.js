// node-gyp-build/index.js

const { existsSync } = require('fs');
const { join } = require('path');

function loadBinding(dir) {
  const prebuildDir = join(dir, 'prebuilds', process.platform + '-' + process.arch);
  const prebuildFiles = [
    join(prebuildDir, `node-${process.versions.node}.node`),
    join(prebuildDir, `abi-${process.versions.modules}.node`),
    join(prebuildDir, `napi.node`)
  ];

  for (const file of prebuildFiles) {
    if (existsSync(file)) {
      return require(file);
    }
  }

  // If no prebuilds are found, fall back to node-gyp rebuild
  const { execSync } = require('child_process');
  console.log('No prebuild found, compiling...');
  execSync('node-gyp rebuild', { stdio: 'inherit', cwd: dir });

  // Load compiled binary
  const bindingFile = join(dir, 'build', 'Release', 'binding.node');
  return require(bindingFile);
}

module.exports = loadBinding;

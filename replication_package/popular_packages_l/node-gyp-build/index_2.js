const { existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

/**
 * Load the native binding for the provided directory.
 * 
 * This function first attempts to load prebuilt binaries from a directory
 * structure based on the current platform and CPU architecture. If no
 * suitable prebuilt binary is found, it falls back to compiling the
 * native module using `node-gyp`.
 * 
 * @param {string} dir - The directory containing the native module source.
 * @returns {any} The required native module.
 */
function loadNativeBinding(directory) {
  const platformArchDir = join(directory, 'prebuilds', `${process.platform}-${process.arch}`);
  const prebuiltFiles = [
    join(platformArchDir, `node-${process.versions.node}.node`),
    join(platformArchDir, `abi-${process.versions.modules}.node`),
    join(platformArchDir, `napi.node`)
  ];

  for (const filePath of prebuiltFiles) {
    if (existsSync(filePath)) {
      return require(filePath);
    }
  }

  console.log('No prebuilt binary found, compiling with node-gyp...');
  execSync('node-gyp rebuild', { stdio: 'inherit', cwd: directory });

  const compiledBinaryPath = join(directory, 'build', 'Release', 'binding.node');
  return require(compiledBinaryPath);
}

module.exports = loadNativeBinding;

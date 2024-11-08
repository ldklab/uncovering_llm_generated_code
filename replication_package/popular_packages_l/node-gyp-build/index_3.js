// This Node.js code provides a function for loading native binary modules, which are
// typically used for performance-critical operations or to access functionality not
// available in JavaScript alone. The code first attempts to load these binaries from
// prebuilt files and, if not found, falls back on rebuilding them with node-gyp.

const { existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

function loadNativeModule(projectDir) {
  const platformArch = `${process.platform}-${process.arch}`;
  const prebuildsPath = join(projectDir, 'prebuilds', platformArch);
  
  // List of potential prebuilt binary file paths
  const potentialFiles = [
    join(prebuildsPath, `node-${process.versions.node}.node`),
    join(prebuildsPath, `abi-${process.versions.modules}.node`),
    join(prebuildsPath, 'napi.node')
  ];

  // Try to require the first existing prebuilt binary file
  for (const filePath of potentialFiles) {
    if (existsSync(filePath)) {
      return require(filePath);
    }
  }

  // Fallback to building from source if no prebuilt binaries exist
  console.error('Prebuilt binary not found, compiling...');
  execSync('node-gyp rebuild', { stdio: 'inherit', cwd: projectDir });
  
  // Load and return the newly built binary
  const compiledBinary = join(projectDir, 'build', 'Release', 'binding.node');
  return require(compiledBinary);
}

module.exports = loadNativeModule;

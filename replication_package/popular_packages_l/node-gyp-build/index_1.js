// Load necessary modules for file and path operations.
const { existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

// Function to load the binding module or compile it if not available.
function loadBinding(dir) {
  // Construct the directory path where prebuilt modules might be stored.
  const prebuildDir = join(dir, 'prebuilds', `${process.platform}-${process.arch}`);

  // List of potential files with prebuilt binaries to check for existence.
  const prebuildFiles = [
    join(prebuildDir, `node-${process.versions.node}.node`),
    join(prebuildDir, `abi-${process.versions.modules}.node`),
    join(prebuildDir, `napi.node`)
  ];

  // Iterate through potential prebuilt binary files and try to load them if they exist.
  for (const file of prebuildFiles) {
    if (existsSync(file)) {
      // Require and return the first found prebuilt binary.
      return require(file);
    }
  }

  // No prebuilt binary files were found, so compile the module using node-gyp.
  console.log('No prebuild found, compiling...');
  execSync('node-gyp rebuild', { stdio: 'inherit', cwd: dir });

  // After compilation, require and return the compiled binary module.
  const bindingFile = join(dir, 'build', 'Release', 'binding.node');
  return require(bindingFile);
}

// Export the loadBinding function for use in other parts of the application.
module.exports = loadBinding;

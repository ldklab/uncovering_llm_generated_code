const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Temporary files cleanup container
const tempFiles = [];

// Default options for temporary files/directories
const optionsDefaults = {
  dir: os.tmpdir(),      // Default directory for temp files
  mode: 0o600,           // Default permissions
  prefix: 'tmp-',        // Prefix for temp names
  postfix: '',           // Postfix for temp names
  keep: false,           // Should temp files be kept after process exit?
  tries: 3,              // Number of attempts to generate a unique name
};

// Generate random hexadecimal string
function randomChars() {
  return crypto.randomBytes(3).toString('hex');
}

// Synchronously generate a unique temporary file name
function tmpNameSync(options = {}) {
  const opts = { ...optionsDefaults, ...options };
  for (let i = 0; i < opts.tries; i++) {
    const name = path.join(opts.dir, opts.prefix + randomChars() + opts.postfix);
    if (!fs.existsSync(name)) {
      return name;
    }
  }
  throw new Error('Could not generate a unique tmp filename');
}

// Create and open a temporary file synchronously
function fileSync(options = {}) {
  const name = tmpNameSync(options);
  const fd = fs.openSync(name, 'w', options.mode || 0o600);
  
  // Cleanup function to close file and optionally delete it
  const cleanupCallback = () => {
    try {
      fs.closeSync(fd);
    } catch (err) {}
    try {
      if (!options.keep) fs.unlinkSync(name);
    } catch (err) {}
  };

  // Register cleanup function if needed
  if (!options.keep) {
    tempFiles.push(cleanupCallback);
  }

  return { name, fd, cleanupCallback };
}

// Create a temporary directory synchronously
function dirSync(options = {}) {
  const name = tmpNameSync(options);
  fs.mkdirSync(name, options.mode || 0o700);

  // Cleanup function to remove the directory
  const cleanupCallback = () => {
    try {
      fs.rmdirSync(name, { recursive: options.unsafeCleanup || false });
    } catch (err) {}
  };

  // Register cleanup function if needed
  if (!options.keep) {
    tempFiles.push(cleanupCallback);
  }

  return { name, cleanupCallback };
}

// Set up to clean up temp files/directories on process exit
function setGracefulCleanup() {
  process.on('exit', () => {
    tempFiles.forEach(callback => callback());
  });
}

// Exporting the module functions
module.exports = {
  fileSync,
  dirSync,
  tmpNameSync,
  setGracefulCleanup,
};

// Example usage showing the module's functionality
const tmp = require('./tmp');
tmp.setGracefulCleanup();

// Create a temporary file and output its path
const tmpfile = tmp.fileSync();
console.log('Temp file created at:', tmpfile.name);
tmpfile.cleanupCallback(); // Clean up the file

// Create a temporary directory and output its path
const tmpdir = tmp.dirSync();
console.log('Temp directory created at:', tmpdir.name);
tmpdir.cleanupCallback(); // Clean up the directory
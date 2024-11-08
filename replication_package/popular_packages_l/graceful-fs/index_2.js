// graceful-fs.js
const fs = require('fs');

// Queue to manage file system operation retries
const queue = [];
let ready = true;
const retryLimit = 1000;

/**
 * Adds a file system function to the retry queue.
 * @param {Function} fn - The function to execute
 */
function enqueue(fn) {
  queue.push(fn);
  processQueue();
}

/**
 * Processes the queue if it's ready.
 */
function processQueue() {
  if (ready && queue.length > 0) {
    const fn = queue.shift();
    fn(handleCompletion);
  }
}

/**
 * Marks the queue as ready and re-processes it.
 */
function handleCompletion() {
  ready = true;
  setTimeout(processQueue, 0);
}

/**
 * A modified version of fs.rename that handles EACCES and EPERM errors by retrying.
 * @param {string} oldPath - The old path of the file
 * @param {string} newPath - The new path of the file
 * @param {Function} callback - Callback to handle the result
 */
function gracefulRename(oldPath, newPath, callback) {
  let attempts = 0;
  
  const tryRename = () => {
    fs.rename(oldPath, newPath, (err) => {
      if (err && (err.code === 'EACCES' || err.code === 'EPERM') && attempts < retryLimit) {
        attempts++;
        setTimeout(tryRename, 10);
      } else {
        callback(err);
      }
    });
  };

  tryRename();
}

/**
 * A modified version of fs.open that handles EMFILE errors by retrying.
 * @param {string} path - Path to the file
 * @param {string} flags - File system flags
 * @param {number} mode - The file mode
 * @param {Function} callback - Callback to handle the result
 */
function gracefulOpen(path, flags, mode, callback) {
  const tryOpen = (retryCount = 0) => {
    fs.open(path, flags, mode, (err, fd) => {
      if (err && err.code === 'EMFILE' && retryCount < retryLimit) {
        enqueue(() => tryOpen(retryCount + 1));
      } else {
        callback(err, fd);
      }
    });
  };

  tryOpen();
}

// Export the patched `fs` methods
module.exports = {
  ...fs,
  rename: gracefulRename,
  open: gracefulOpen,
  // Additional wrapped functions can be added here
};

// Example usage
const gracefulFs = require('./graceful-fs');
gracefulFs.open('myfile.txt', 'r', (err, fd) => {
  // Handle file open
});

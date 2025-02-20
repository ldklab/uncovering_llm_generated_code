// graceful-fs.js
const fs = require('fs');

const queue = [];
let ready = true;
const retryLimit = 1000;

/**
 * Adds the fs operation function to the queue and attempts to process the queue.
 * @param {Function} fn - The fs function to execute
 */
function enqueue(fn) {
  queue.push(fn);
  processQueue();
}

/**
 * Processes the queue if it's ready and not empty by calling the next function.
 */
function processQueue() {
  if (ready && queue.length) {
    ready = false;
    const fn = queue.shift();
    fn(handleCompletion);
  }
}

/**
 * Called when an operation completes, sets the queue to ready and processes the next operation.
 */
function handleCompletion() {
  ready = true;
  setTimeout(processQueue, 0);
}

/**
 * A retry mechanism for the fs.rename function to handle retryable errors.
 * @param {string} oldPath - The current file path
 * @param {string} newPath - The new file path
 * @param {Function} callback - Callback function
 */
function gracefulRename(oldPath, newPath, callback) {
  let retries = 0;
  const attempt = () => {
    fs.rename(oldPath, newPath, (err) => {
      if (err && (err.code === 'EACCES' || err.code === 'EPERM') && retries < retryLimit) {
        retries++;
        setTimeout(attempt, 10);
      } else {
        callback(err);
      }
    });
  };
  attempt();
}

/**
 * Handles retries for the fs.open function when encountering EMFILE errors.
 * @param {string} path - Path to the file
 * @param {string|number} flags - Flags for opening the file
 * @param {number} mode - Mode to set
 * @param {Function} callback - Callback function
 */
function gracefulOpen(path, flags, mode, callback) {
  const attempt = (retryCount = 0) => {
    fs.open(path, flags, mode, (err, fd) => {
      if (err && err.code === 'EMFILE' && retryCount < retryLimit) {
        enqueue(() => attempt(retryCount + 1));
      } else {
        callback(err, fd);
      }
    });
  };
  attempt();
}

// Export the patched `fs` methods
module.exports = {
  ...fs,
  rename: gracefulRename,
  open: gracefulOpen,
};

// Example usage
const gracefulFs = require('./graceful-fs');
gracefulFs.open('myfile.txt', 'r', (err, fd) => {
  // Handle file open
});

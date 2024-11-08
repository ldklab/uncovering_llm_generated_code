// graceful-fs.js
const fs = require('fs');

const queue = [];
let ready = true;
let retryLimit = 1000;

/**
 * Add an fs operation to the queue to manage retries.
 * @param {Function} fn - An fs operation to enqueue
 */
function enqueue(fn) {
  queue.push(fn);
  processQueue();
}

/**
 * Process the next fs operation in the queue.
 */
function processQueue() {
  if (ready && queue.length) {
    ready = false;
    const fn = queue.shift();
    fn(handleCompletion);
  }
}

/**
 * Callback handler to mark the completion of an fs operation
 * and trigger the next operation in the queue.
 */
function handleCompletion() {
  ready = true;
  setTimeout(processQueue, 0);
}

/**
 * A wrapped fs.rename that retries on EACCES and EPERM errors.
 * @param {string} oldPath - The old file path
 * @param {string} newPath - The new file path
 * @param {Function} callback - Callback function after rename
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
 * A wrapped fs.open that handles EMFILE errors with retries.
 * @param {string} path - The file path to open
 * @param {string|number} flags - The flags for opening the file
 * @param {number|string|undefined} mode - The file mode
 * @param {Function} callback - Callback after attempt to open the file
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

// Export customized versions of fs methods that include retries
module.exports = {
  ...fs,
  rename: gracefulRename,
  open: gracefulOpen,
};

// Example usage of the patched graceful-fs module
const gracefulFs = require('./graceful-fs');
gracefulFs.open('myfile.txt', 'r', (err, fd) => {
  if (err) {
    console.error("Failed to open file:", err);
  } else {
    console.log("File opened successfully, fd:", fd);
    fs.close(fd, (closeErr) => {
      if (closeErr) console.error("Failed to close file", closeErr);
    });
  }
});

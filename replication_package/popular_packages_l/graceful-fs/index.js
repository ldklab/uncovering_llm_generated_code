// graceful-fs.js
const fs = require('fs');
const path = require('path');

const queue = [];
let ready = true;
let retryLimit = 1000;

/**
 * Generic queue manager to handle fs operation retries.
 * @param {Function} fn - The fs function to execute
 */
function enqueue(fn) {
  queue.push(fn);
  processQueue();
}

function processQueue() {
  if (ready && queue.length) {
    const fn = queue.shift();
    fn(handleCompletion);
  }
}

function handleCompletion() {
  ready = true;
  setTimeout(processQueue, 0);
}

/**
 * Patch the `rename` function.
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
 * Wrap fs.open to handle EMFILE errors gracefully.
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

/**
 * Patch other methods as needed
 * TODO: Implement other patched methods similar to open or rename
 */

// Export the patched `fs` methods
module.exports = {
  ...fs,
  rename: gracefulRename,
  open: gracefulOpen,
  // Add other wrapped functions here
};

// Example usage
const gracefulFs = require('./graceful-fs');
gracefulFs.open('myfile.txt', 'r', (err, fd) => {
  // Handle file open
});

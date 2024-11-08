const fs = require('fs');

// Queue for managing fs operations and error handling
const queue = [];
let isReady = true;
const maxRetries = 1000;

// Enqueue fs functions to be processed
function enqueue(fn) {
  queue.push(fn);
  executeQueue();
}

// Process the queue when ready
function executeQueue() {
  if (isReady && queue.length) {
    isReady = false;
    const fn = queue.shift();
    fn(completeFn);
  }
}

// Complete a function and reset readiness
function completeFn() {
  isReady = true;
  setImmediate(executeQueue);
}

// Rename a file with retry mechanism for EACCES and EPERM errors
function renameWithRetry(oldPath, newPath, callback) {
  let retryCount = 0;
  const attemptRename = () => {
    fs.rename(oldPath, newPath, (err) => {
      if (err && ['EACCES', 'EPERM'].includes(err.code) && retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptRename, 10);
      } else {
        callback(err);
      }
    });
  };
  attemptRename();
}

// Open a file and handle EMFILE errors by queuing retries
function openWithRetry(filePath, flags, mode, callback) {
  const attemptOpen = (retries = 0) => {
    fs.open(filePath, flags, mode, (err, fd) => {
      if (err && err.code === 'EMFILE' && retries < maxRetries) {
        enqueue(() => attemptOpen(retries + 1));
      } else {
        callback(err, fd);
      }
    });
  };
  attemptOpen();
}

// Export altered fs methods with enhanced handling for common error scenarios
module.exports = {
  ...fs,
  rename: renameWithRetry,
  open: openWithRetry
};

// Example usage of the enhanced 'graceful-fs'
const enhancedFs = require('./graceful-fs');
enhancedFs.open('myfile.txt', 'r', (err, fd) => {
  if (err) {
    console.error('Failed to open file:', err);
  } else {
    console.log('File opened successfully:', fd);
  }
});

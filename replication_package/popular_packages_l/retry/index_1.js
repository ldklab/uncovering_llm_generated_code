class RetryOperation {
  constructor(timeouts, options = {}) {
    this.timeouts = timeouts;
    this.maxRetries = options.retries || 10;
    this.retryErrors = [];
    this.currentAttempt = 0;
    this.forever = options.forever || false;
    this.unref = options.unref || false;
    this.maxRetryTime = options.maxRetryTime || Infinity;
    
    this.startTime = Date.now();
  }

  attempt(callback) {
    if (this.shouldRetry()) {
      const timeout = this.nextTimeout();
      if (this.isMaxRetryTimeExceeded()) return this.fail(callback, 'Max retry time exceeded');
      
      setTimeout(() => {
        this.currentAttempt++;
        callback(null, this.currentAttempt);
      }, timeout);
    } else {
      this.fail(callback, 'Max retries reached');
    }
  }

  shouldRetry() {
    return this.forever || this.currentAttempt < this.maxRetries;
  }

  nextTimeout() {
    return this.timeouts[this.currentAttempt] || 0;
  }

  isMaxRetryTimeExceeded() {
    return Date.now() - this.startTime > this.maxRetryTime;
  }

  fail(callback, message) {
    callback(new Error(message), this.currentAttempt);
  }

  retry(error) {
    if (!error) return false;
    if (this.shouldRetry()) {
      this.retryErrors.push(error);
      return true;
    }
    return false;
  }

  errors() {
    return this.retryErrors;
  }

  mainError() {
    const mostFrequentMessage = this.mostFrequentError();
    return this.retryErrors.find(err => err.message === mostFrequentMessage);
  }

  mostFrequentError() {
    const errorCounts = this.retryErrors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(errorCounts).reduce((a, b) => errorCounts[a] > errorCounts[b] ? a : b);
  }
}

function timeouts(options = {}) {
  const retries = options.retries || 10;
  const factor = options.factor || 2;
  const minTimeout = options.minTimeout || 1000;
  const maxTimeout = options.maxTimeout || Infinity;
  const randomize = options.randomize || false;

  return Array.from({ length: retries }, (_, attempt) => createTimeout(attempt, { minTimeout, factor, maxTimeout, randomize }));
}

function operation(options) {
  return new RetryOperation(timeouts(options), options);
}

function createTimeout(attempt, opts = {}) {
  const minTimeout = opts.minTimeout || 1000;
  const factor = opts.factor || 2;
  const maxTimeout = opts.maxTimeout || Infinity;
  const randomize = opts.randomize || false;

  let timeout = Math.min(minTimeout * Math.pow(factor, attempt), maxTimeout);
  if (randomize) {
    timeout *= Math.random() + 1;
  }
  return Math.round(timeout);
}

module.exports = {
  RetryOperation,
  timeouts,
  operation,
  createTimeout
};

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

  attempt(fn) {
    const canRetry = this.currentAttempt < this.maxRetries || this.forever;
    if (canRetry) {
      const timeout = this.timeouts[this.currentAttempt] || 0;
      if (Date.now() - this.startTime > this.maxRetryTime) {
        return fn(new Error('Max retry time exceeded'), this.currentAttempt);
      }

      setTimeout(() => {
        this.currentAttempt++;
        fn(null, this.currentAttempt);
      }, timeout);
    } else {
      fn(new Error('Max retries reached'), this.currentAttempt);
    }
  }

  retry(err) {
    if (!err) return false;
    if (this.forever || this.currentAttempt < this.maxRetries) {
      this.retryErrors.push(err);
      return true;
    }
    return false;
  }

  errors() {
    return this.retryErrors;
  }

  mainError() {
    const errorCounts = this.retryErrors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentMessage = Object.keys(errorCounts).reduce((a, b) => 
      errorCounts[a] > errorCounts[b] ? a : b
    );
    return this.retryErrors.find(err => err.message === mostFrequentMessage);
  }
}

function timeouts(options = {}) {
  const retries = options.retries || 10;
  const factor = options.factor || 2;
  const minTimeout = options.minTimeout || 1000;
  const maxTimeout = options.maxTimeout || Infinity;
  const randomize = options.randomize || false;

  return Array.from({ length: retries }, (_, attempt) => {
    let timeout = Math.min(minTimeout * Math.pow(factor, attempt), maxTimeout);
    if (randomize) {
      timeout *= Math.random() + 1;
    }
    return Math.round(timeout);
  });
}

function operation(options) {
  return new RetryOperation(timeouts(options), options);
}

module.exports = {
  RetryOperation,
  timeouts,
  operation,
  createTimeout(attempt, opts = {}) {
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
};

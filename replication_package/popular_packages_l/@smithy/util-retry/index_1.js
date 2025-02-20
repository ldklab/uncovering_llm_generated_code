// @smithy/util-retry/index.js
export class StandardRetryStrategy {
  constructor(maxAttempts = 3) {
    this.maxAttempts = maxAttempts;
  }

  shouldRetry(error, attempt) {
    // Determines if the request can be retried
    return attempt < this.maxAttempts && error.retryable;
  }

  retryBackoff(attempt) {
    // Provides a default backoff timing for exponential backoff
    return 100 + attempt * 1000;
  }
}

export class ConfiguredRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttempts, backoffFunction) {
    super(maxAttempts);
    this.backoffFunction = backoffFunction;
  }

  retryBackoff(attempt) {
    return this.backoffFunction(attempt);
  }
}

export class S3Client {
  constructor(config = {}) {
    const { maxAttempts, retryStrategy } = config;
    this.retryStrategy = retryStrategy || new StandardRetryStrategy(maxAttempts);
  }

  async sendRequest(request, attempt = 1) {
    try {
      // Perform actual request and return on success
      return await this.performRequest(request);
    } catch (error) {
      // Retry if strategy allows, otherwise throw error
      if (this.retryStrategy.shouldRetry(error, attempt)) {
        await this.wait(this.retryStrategy.retryBackoff(attempt));
        return this.sendRequest(request, attempt + 1);
      } else {
        throw error;
      }
    }
  }

  async performRequest(request) {
    // Simulated request success; replace with actual network request code
    return Promise.resolve("Request successful");
  }

  async wait(duration) {
    // Simulate wait (backoff) by delaying for 'duration' milliseconds
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}

// Usage example for clients with different retry strategies
const defaultClient = new S3Client();  // Default strategy with 3 attempts
const configuredClient = new S3Client({
  retryStrategy: new ConfiguredRetryStrategy(4, (attempt) => 100 + attempt * 1000),
});

export default {
  S3Client,
  StandardRetryStrategy,
  ConfiguredRetryStrategy
};

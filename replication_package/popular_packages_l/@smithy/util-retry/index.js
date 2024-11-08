// @smithy/util-retry/index.js
export class StandardRetryStrategy {
  constructor(maxAttempts = 3) {
    this.maxAttempts = maxAttempts;
  }

  shouldRetry(error, attempt) {
    // Placeholder for logic to determine if an error is retryable
    return attempt < this.maxAttempts && error.retryable;
  }

  retryBackoff(attempt) {
    // Default backoff strategy
    return 100 + attempt * 1000; // Example backoff
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
    this.retryStrategy = retryStrategy
      ? retryStrategy
      : new StandardRetryStrategy(maxAttempts);
  }

  async sendRequest(request, attempt = 1) {
    try {
      // Indeed, perform the request operation
      return await this.performRequest(request);
    } catch (error) {
      if (this.retryStrategy.shouldRetry(error, attempt)) {
        const backoff = this.retryStrategy.retryBackoff(attempt);
        await this.wait(backoff);
        return this.sendRequest(request, attempt + 1);
      } else {
        throw error;
      }
    }
  }

  async performRequest(request) {
    // Simulates performing the S3 request
    // This would actually involve network operations.
    return Promise.resolve("Request successful");
  }

  async wait(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}

// Usage example
const defaultClient = new S3Client();  // Uses StandardRetryStrategy with 3 max attempts
const configuredClient = new S3Client({
  retryStrategy: new ConfiguredRetryStrategy(4, (attempt) => 100 + attempt * 1000),
});

export default {
  S3Client,
  StandardRetryStrategy,
  ConfiguredRetryStrategy
};

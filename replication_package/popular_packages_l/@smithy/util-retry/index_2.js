// @smithy/util-retry/index.js
export class StandardRetryStrategy {
  constructor(maxAttempts = 3) {
    this.maxAttempts = maxAttempts;
  }

  shouldRetry(error, attempt) {
    return attempt < this.maxAttempts && error.retryable; // Check if we should retry based on attempt count and error
  }

  retryBackoff(attempt) {
    return 100 + attempt * 1000; // Default backoff time increasing with attempt number
  }
}

export class ConfiguredRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttempts, backoffFunction) {
    super(maxAttempts);
    this.backoffFunction = backoffFunction;
  }

  retryBackoff(attempt) {
    return this.backoffFunction(attempt); // Use custom backoff function
  }
}

export class S3Client {
  constructor(config = {}) {
    const { maxAttempts, retryStrategy } = config;
    this.retryStrategy = retryStrategy || new StandardRetryStrategy(maxAttempts); // Assign strategy
  }

  async sendRequest(request, attempt = 1) {
    try {
      return await this.performRequest(request); // Try to perform request
    } catch (error) {
      if (this.retryStrategy.shouldRetry(error, attempt)) { // Check if retry is necessary
        const backoff = this.retryStrategy.retryBackoff(attempt); // Get backoff time
        await this.wait(backoff); // Wait before retry
        return this.sendRequest(request, attempt + 1); // Retry request
      } else {
        throw error; // If not retryable, throw error
      }
    }
  }

  async performRequest(request) {
    return Promise.resolve("Request successful"); // Simulate a successful request
  }

  async wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration)); // Wait for a specific duration
  }
}

// Usage example
const defaultClient = new S3Client(); // Client with default retry strategy
const configuredClient = new S3Client({
  retryStrategy: new ConfiguredRetryStrategy(4, attempt => 100 + attempt * 1000), // Client with custom retry strategy
});

export default {
  S3Client,
  StandardRetryStrategy,
  ConfiguredRetryStrategy
};

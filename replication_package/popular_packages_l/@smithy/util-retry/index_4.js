// @smithy/util-retry/index.js

// Base class for retry strategy with functionality to decide when to retry and calculate delay between retries
export class StandardRetryStrategy {
  constructor(maxAttempts = 3) {
    this.maxAttempts = maxAttempts; // Maximum number of retry attempts
  }

  shouldRetry(error, attempt) {
    // Determines if a request should be retried based on error and current attempt
    return attempt < this.maxAttempts && error.retryable;
  }

  retryBackoff(attempt) {
    // Default strategy for calculating wait time before retrying, increases with each attempt
    return 100 + attempt * 1000; // Backoff calculation (milliseconds)
  }
}

// Specialized retry strategy allowing a custom backoff function
export class ConfiguredRetryStrategy extends StandardRetryStrategy {
  constructor(maxAttempts, backoffFunction) {
    super(maxAttempts); // Inherit max attempts from base class
    this.backoffFunction = backoffFunction; // Custom function to control backoff delay
  }

  retryBackoff(attempt) {
    return this.backoffFunction(attempt); // Use custom backoff logic
  }
}

// Mock S3 client implementing retry functionality using a retry strategy
export class S3Client {
  constructor(config = {}) {
    const { maxAttempts, retryStrategy } = config;
    // Use provided retryStrategy or default to StandardRetryStrategy
    this.retryStrategy = retryStrategy || new StandardRetryStrategy(maxAttempts);
  }

  async sendRequest(request, attempt = 1) {
    try {
      // Actual request handling logic (simulated here)
      return await this.performRequest(request);
    } catch (error) {
      // Determine if a retry is justified and attempt further with delay
      if (this.retryStrategy.shouldRetry(error, attempt)) {
        const backoff = this.retryStrategy.retryBackoff(attempt); // Calculate backoff duration
        await this.wait(backoff); // Wait before retry
        return this.sendRequest(request, attempt + 1);
      } else {
        throw error; // Propagate error if no retry is warranted
      }
    }
  }

  async performRequest(request) {
    // Placeholder for performing actual request logic
    return Promise.resolve("Request successful");
  }

  async wait(duration) {
    // Wait for a specified duration (milliseconds)
    return new Promise((resolve) => setTimeout(resolve, duration));
  }
}

// Usage examples of the S3Client with different retry strategies
const defaultClient = new S3Client(); // Instance with default retry strategy, 3 max attempts
const configuredClient = new S3Client({
  // Instance with a customized retry strategy
  retryStrategy: new ConfiguredRetryStrategy(4, (attempt) => 100 + attempt * 1000), // 4 max attempts, custom backoff
});

// Export functionalities for external use
export default {
  S3Client,
  StandardRetryStrategy,
  ConfiguredRetryStrategy
};

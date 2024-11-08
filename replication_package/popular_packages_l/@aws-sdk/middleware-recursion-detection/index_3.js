// index.js

class RecursionDetectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecursionDetectionError';
  }
}

class RecursionDetectionMiddleware {
  constructor() {
    // Stores the number of invocations for each operation
    this.operationCallCount = new Map();
  }

  handle(request, next) {
    const operationName = request.operationName;

    // Increment operation call count
    this.operationCallCount.set(
      operationName,
      (this.operationCallCount.get(operationName) || 0) + 1
    );

    try {
      // If it's already been called recursively, throw an error
      if (this.operationCallCount.get(operationName) > 1) {
        throw new RecursionDetectionError(`Recursion detected for operation: ${operationName}`);
      }

      return next(request); // Continue with the next handler/middleware
    } finally {
      // Decrement the count after processing to ensure correct state 
      this.operationCallCount.set(
        operationName,
        this.operationCallCount.get(operationName) - 1
      );
    }
  }
}

// Method to integrate the middleware into a client
function applyRecursionDetectionMiddleware(client) {
  const middleware = new RecursionDetectionMiddleware();
  client.addMiddleware((request, next) => middleware.handle(request, next));
}

// Example usage (hypothetical, assuming a compatible AWS SDK client exists)

// const client = initializeAwsSdkClient();
// applyRecursionDetectionMiddleware(client);

// Exports for external usage or tests
module.exports = {
  RecursionDetectionMiddleware,
  applyRecursionDetectionMiddleware,
  RecursionDetectionError,
};

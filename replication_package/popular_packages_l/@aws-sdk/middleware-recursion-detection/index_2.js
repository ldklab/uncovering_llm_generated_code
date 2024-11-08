// index.js

class RecursionDetectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecursionDetectionError';
  }
}

class RecursionDetectionMiddleware {
  constructor() {
    this.operationStack = new Map(); // Holds counts of operation calls
  }

  handle(request, next) {
    const operationName = request.operationName;

    // Increment operation count
    this.operationStack.set(
      operationName,
      (this.operationStack.get(operationName) || 0) + 1
    );

    try {
      if (this.operationStack.get(operationName) > 1) {
        throw new RecursionDetectionError(`Recursion detected in operation: ${operationName}`);
      }

      return next(request); // Proceed to next middleware/handler
    } finally {
      // Decrement operation count after processing
      this.operationStack.set(
        operationName,
        this.operationStack.get(operationName) - 1
      );
    }
  }
}

function applyRecursionDetectionMiddleware(client) {
  const middleware = new RecursionDetectionMiddleware();
  client.addMiddleware((request, next) => middleware.handle(request, next));
}

// Example usage (hypothetical)
// Assuming an AWS SDK client with middleware support

// const client = getAwsSdkClientSomehow();
// applyRecursionDetectionMiddleware(client);

// Export for testing or further enhancement
module.exports = {
  RecursionDetectionMiddleware,
  applyRecursionDetectionMiddleware,
  RecursionDetectionError,
};

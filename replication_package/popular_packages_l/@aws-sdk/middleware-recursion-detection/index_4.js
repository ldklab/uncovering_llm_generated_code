// index.js

// Custom Error class for recursion detection
class RecursionDetectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecursionDetectionError';
  }
}

// Middleware class to detect recursion in operation requests
class RecursionDetectionMiddleware {
  constructor() {
    this.operationStack = new Map(); // Map to track operation call counts
  }

  handle(request, next) {
    const operationName = request.operationName; // Get the operation name from the request

    // Increment the count for the current operation
    this.operationStack.set(
      operationName, 
      (this.operationStack.get(operationName) || 0) + 1
    );

    try {
      if (this.operationStack.get(operationName) > 1) {
        // Throw error if the operation is detected to be recursive
        throw new RecursionDetectionError(`Recursion detected in operation: ${operationName}`);
      }

      return next(request); // Proceed to the next middleware or request handler
    } finally {
      // Decrement the operation count after processing to reset state
      this.operationStack.set(
        operationName, 
        this.operationStack.get(operationName) - 1
      );
    }
  }
}

// Function to apply recursion detection middleware to a client
function applyRecursionDetectionMiddleware(client) {
  const middleware = new RecursionDetectionMiddleware();
  client.addMiddleware((request, next) => middleware.handle(request, next));
}

// Hypothetical usage with an SDK client supporting middleware
// const client = getAwsSdkClientSomehow();
// applyRecursionDetectionMiddleware(client);

// Exporting classes and functions for testing and further use
module.exports = {
  RecursionDetectionMiddleware,
  applyRecursionDetectionMiddleware,
  RecursionDetectionError,
};

// index.js

class RecursionDetectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecursionDetectionError';
  }
}

class RecursionDetectionMiddleware {
  constructor() {
    // Map to track the number of calls for each operation to detect recursion
    this.operationStack = new Map();
  }

  handle(request, next) {
    const operationName = request.operationName;

    // Increment the call count for the current operation
    this.operationStack.set(
      operationName, 
      (this.operationStack.get(operationName) || 0) + 1
    );

    try {
      // If an operation is called more than once simultaneously, throw an error
      if (this.operationStack.get(operationName) > 1) {
        throw new RecursionDetectionError(`Recursion detected in operation: ${operationName}`);
      }

      // Proceed to the next middleware or operation handler
      return next(request);
    } finally {
      // Ensure the counter is decremented after the operation is processed
      this.operationStack.set(
        operationName, 
        this.operationStack.get(operationName) - 1
      );
    }
  }
}

// Function to add the recursion detection middleware to a client
function applyRecursionDetectionMiddleware(client) {
  const middleware = new RecursionDetectionMiddleware();
  client.addMiddleware((request, next) => middleware.handle(request, next));
}

// Usage example (hypothetical)
// Assume there's an AWS SDK client that supports adding middleware

// const client = getAwsSdkClientSomehow();
// applyRecursionDetectionMiddleware(client);

// Export modules for testing or future use
module.exports = {
  RecursionDetectionMiddleware,
  applyRecursionDetectionMiddleware,
  RecursionDetectionError,
};

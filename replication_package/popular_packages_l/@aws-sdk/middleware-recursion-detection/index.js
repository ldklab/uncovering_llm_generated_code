// index.js

class RecursionDetectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RecursionDetectionError';
  }
}

class RecursionDetectionMiddleware {
  constructor() {
    // This map holds counts of operation calls to detect recursion
    this.operationStack = new Map();
  }

  handle(request, next) {
    const operationName = request.operationName;

    // Track the current operation count
    this.operationStack.set(
      operationName, 
      (this.operationStack.get(operationName) || 0) + 1
    );

    try {
      if (this.operationStack.get(operationName) > 1) {
        throw new RecursionDetectionError(`Recursion detected in operation: ${operationName}`);
      }

      return next(request); // Pass request to the next middleware/handler
    } finally {
      // Decrement operation count after processing
      this.operationStack.set(
        operationName, 
        this.operationStack.get(operationName) - 1
      );
    }
  }
}

// Middleware application function
function applyRecursionDetectionMiddleware(client) {
  const middleware = new RecursionDetectionMiddleware();
  client.addMiddleware((request, next) => middleware.handle(request, next));
}

// Usage (hypothetical)
// Considering there's an AWS SDK client that supports middleware

// const client = getAwsSdkClientSomehow();
// applyRecursionDetectionMiddleware(client);

// Exporting for testing purposes or further implementation
module.exports = {
  RecursionDetectionMiddleware,
  applyRecursionDetectionMiddleware,
  RecursionDetectionError,
};

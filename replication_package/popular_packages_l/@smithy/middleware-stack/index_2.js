// index.js
class MiddlewareStack {
  constructor() {
    // Initialize an object holding arrays for each step of middleware processing
    this.steps = {
      initialize: [],
      serialize: [],
      build: [],
      finalizeRequest: [],
      deserialize: []
    };
  }

  // Method to add middleware to the stack
  add(middleware, { step, priority = 'normal', name, tags = [] }) {
    // Ensure the step is valid
    if (!this.steps[step]) {
      throw new Error(`Invalid step: ${step}`);
    }
    // Create an entry for the middleware with specified properties
    const middlewareEntry = { middleware, priority, name, tags };
    // Add the middleware to the specified processing step
    this.steps[step].push(middlewareEntry);

    // Sort the step array based on priority
    if (priority === 'high') {
      this.steps[step].sort((a, b) => (b.priority === 'high' ? 1 : -1));
    } else if (priority === 'low') {
      this.steps[step].sort((a, b) => (a.priority === 'low' ? 1 : -1));
    }
  }

  // Method to add middleware relatively to another middleware
  addRelativeTo(middleware, { relation, toMiddleware, step }) {
    const stepMiddlewares = this.steps[step];
    // Check if the step is valid
    if (!stepMiddlewares) {
      throw new Error(`Invalid step: ${step}`);
    }
    // Find the index of the target middleware
    const index = stepMiddlewares.findIndex(mw => mw.name === toMiddleware);
    if (index === -1) {
      throw new Error(`Middleware not found: ${toMiddleware}`);
    }

    // Insert the new middleware at the determined position
    const position = relation === 'before' ? index : index + 1;
    stepMiddlewares.splice(position, 0, { middleware });
  }

  // Method to remove a middleware by its name
  remove(name) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => mw.name !== name);
    }
  }

  // Method to remove middleware by a specific tag
  removeByTag(tag) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => !mw.tags.includes(tag));
    }
  }

  // Method to execute the middleware steps, resolving to the final handler
  async resolve(handler, context = {}) {
    // Iterate over each step in the middleware stack
    for (const stepName of Object.keys(this.steps)) {
      for (const { middleware } of this.steps[stepName]) {
        // Pass handler through each middleware function
        handler = middleware(handler, context);
      }
    }
    return handler;
  }
}

module.exports = { MiddlewareStack };

// Example usage of the MiddlewareStack
const stack = new MiddlewareStack();

// Define a sample middleware function
const sampleMiddleware = (next, context) => async (args) => {
  console.log('Sample Middleware');
  return next(args);
};

// Add the sample middleware to the 'initialize' step
stack.add(sampleMiddleware, { step: 'initialize', name: 'sampleMiddleware' });

// Resolve and execute the final handler through the middleware stack
stack.resolve((args) => {
  console.log('Final Handler');
})(null);

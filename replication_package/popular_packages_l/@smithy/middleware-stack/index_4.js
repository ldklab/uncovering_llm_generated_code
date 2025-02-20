// index.js
class MiddlewareStack {
  constructor() {
    // Initializes the middleware stack with designated steps.
    this.steps = {
      initialize: [],
      serialize: [],
      build: [],
      finalizeRequest: [],
      deserialize: []
    };
  }

  // Method to add middlewares to specific steps with optional priority, name, and tags.
  add(middleware, { step, priority = 'normal', name, tags = [] }) {
    if (!this.steps[step]) {
      throw new Error(`Invalid step: ${step}`);
    }
    const middlewareEntry = { middleware, priority, name, tags };
    this.steps[step].push(middlewareEntry);

    // Sorts middlewares if priority is defined.
    if (priority === 'high') {
      this.steps[step].sort((a, b) => (b.priority === 'high' ? 1 : -1));
    } else if (priority === 'low') {
      this.steps[step].sort((a, b) => (a.priority === 'low' ? 1 : -1));
    }
  }

  // Method to insert middleware relative to another middleware.
  addRelativeTo(middleware, { relation, toMiddleware, step }) {
    const stepMiddlewares = this.steps[step];
    if (!stepMiddlewares) {
      throw new Error(`Invalid step: ${step}`);
    }
    const index = stepMiddlewares.findIndex(mw => mw.name === toMiddleware);
    if (index === -1) {
      throw new Error(`Middleware not found: ${toMiddleware}`);
    }

    const position = relation === 'before' ? index : index + 1;
    stepMiddlewares.splice(position, 0, { middleware });
  }

  // Method to remove a middleware by its name.
  remove(name) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => mw.name !== name);
    }
  }

  // Method to remove middlewares by a specific tag.
  removeByTag(tag) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => !mw.tags.includes(tag));
    }
  }

  // Resolves the entire stack into a handler function by chaining middlewares.
  async resolve(handler, context = {}) {
    for (const stepName of Object.keys(this.steps)) {
      for (const { middleware } of this.steps[stepName]) {
        handler = middleware(handler, context);
      }
    }
    return handler;
  }
}

module.exports = { MiddlewareStack };

// Example usage of MiddlewareStack
const stack = new MiddlewareStack();

// Sample middleware logs a message.
const sampleMiddleware = (next, context) => async (args) => {
  console.log('Sample Middleware');
  return next(args);
};

// Adds sampleMiddleware to the 'initialize' step.
stack.add(sampleMiddleware, { step: 'initialize', name: 'sampleMiddleware' });

// Resolves stack with a final handler logging another message.
stack.resolve((args) => {
  console.log('Final Handler');
})(null);

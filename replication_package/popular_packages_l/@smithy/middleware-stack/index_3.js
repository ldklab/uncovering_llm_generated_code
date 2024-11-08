// index.js
class MiddlewareStack {
  constructor() {
    this.steps = {
      initialize: [],
      serialize: [],
      build: [],
      finalizeRequest: [],
      deserialize: []
    };
  }

  add(middleware, { step, priority = 'normal', name, tags = [] }) {
    if (!this.steps[step]) {
      throw new Error(`Invalid step: ${step}`);
    }
    const middlewareEntry = { middleware, priority, name, tags };
    this.steps[step].push(middlewareEntry);

    this._sortStep(step);
  }

  _sortStep(step) {
    const priorities = { 'high': 1, 'normal': 2, 'low': 3 };
    this.steps[step].sort((a, b) => priorities[a.priority] - priorities[b.priority]);
  }

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
    stepMiddlewares.splice(position, 0, { middleware, relation, toMiddleware });
  }

  remove(name) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => mw.name !== name);
    }
  }

  removeByTag(tag) {
    for (const step in this.steps) {
      this.steps[step] = this.steps[step].filter(mw => !mw.tags.includes(tag));
    }
  }

  async resolve(handler, context = {}) {
    for (const stepName in this.steps) {
      for (const { middleware } of this.steps[stepName]) {
        handler = middleware(handler, context);
      }
    }
    return handler;
  }
}

module.exports = { MiddlewareStack };

// Example usage
const stack = new MiddlewareStack();

const sampleMiddleware = (next, context) => async (args) => {
  console.log('Sample Middleware');
  return next(args);
};

stack.add(sampleMiddleware, { step: 'initialize', name: 'sampleMiddleware' });

stack.resolve((args) => {
  console.log('Final Handler');
})(null);

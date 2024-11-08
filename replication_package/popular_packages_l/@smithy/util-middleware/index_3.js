// middleware.js

class MiddlewareStack {
    constructor() {
        this.middleware = [];
    }

    use(fn) {
        this.middleware.push(fn);
    }

    async execute(context) {
        for (const fn of this.middleware) {
            await fn(context);
        }
    }
}

const compose = (...middlewares) => (context) => 
    middlewares.reduceRight(
        (next, fn) => () => fn(context, next), 
        () => Promise.resolve()
    )();

const withErrorHandling = (fn) => async (context, next) => {
    try {
        await fn(context, next);
    } catch (error) {
        console.error('An error occurred:', error);
        context.error = error;
    }
};

const withLogging = (fn) => async (context, next) => {
    console.log('Processing:', context);
    await fn(context, next);
    console.log('Processed:', context);
};

module.exports = {
    MiddlewareStack,
    compose,
    withErrorHandling,
    withLogging
};

// example.js

const { MiddlewareStack, withErrorHandling, withLogging } = require('./middleware');

const stack = new MiddlewareStack();

const firstMiddleware = async (ctx, next) => {
    ctx.first = true;
    await next();
};

const secondMiddleware = async (ctx, next) => {
    ctx.second = true;
    await next();
};

stack.use(withLogging(withErrorHandling(firstMiddleware)));
stack.use(withLogging(withErrorHandling(secondMiddleware)));

(async () => {
    const context = {};
    await stack.execute(context);
    console.log('Final context:', context);
})();

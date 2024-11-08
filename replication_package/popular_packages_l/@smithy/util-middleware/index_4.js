// index.js

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

function compose(...middlewares) {
    return (context) => {
        return middlewares.reduceRight(
            (next, fn) => () => fn(context, next),
            () => Promise.resolve()
        )();
    };
}

function withErrorHandling(fn) {
    return async (context, next) => {
        try {
            await fn(context, next);
        } catch (error) {
            console.error('An error occurred:', error);
            context.error = error;
        }
    };
}

function withLogging(fn) {
    return async (context, next) => {
        console.log('Processing:', context);
        await fn(context, next);
        console.log('Processed:', context);
    };
}

module.exports = {
    MiddlewareStack,
    compose,
    withErrorHandling,
    withLogging
};

// Example Usage

const { MiddlewareStack, withErrorHandling, withLogging } = require('./index');

const stack = new MiddlewareStack();

function firstMiddleware(ctx, next) {
    ctx.first = true;
    next();
}

function secondMiddleware(ctx, next) {
    ctx.second = true;
    next();
}

stack.use(withLogging(withErrorHandling(firstMiddleware)));
stack.use(withLogging(withErrorHandling(secondMiddleware)));

(async () => {
    const context = {};
    await stack.execute(context);
    console.log('Final context:', context);
})();

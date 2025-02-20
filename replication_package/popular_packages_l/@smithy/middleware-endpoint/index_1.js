// index.js

class MiddlewareProcessor {
    constructor() {
        console.log("MiddlewareProcessor: Initialized");
    }

    // Middleware function to process the request and response
    process(req, res, next) {
        console.log("MiddlewareProcessor: Processing request");

        // Transform 'old-endpoint' in the URL to 'new-endpoint'
        if (req.url.includes("old-endpoint")) {
            req.url = req.url.replace("old-endpoint", "new-endpoint");
            console.log(`MiddlewareProcessor: Changed request URL to ${req.url}`);
        }

        // Proceed to the next middleware or request handler
        next();
    }
}

// Factory function to create the middleware instance
function createMiddleware() {
    return (req, res, next) => {
        const processor = new MiddlewareProcessor();
        processor.process(req, res, next);
    };
}

// Export the middleware creation function
module.exports = {
    createMiddleware
};

// Integration with an Express application
/*
const express = require('express');
const { createMiddleware } = require('./index');

const app = express();

// Register the middleware in the Express application
app.use(createMiddleware());

// Define an endpoint using the transformed URL
app.get('/new-endpoint', (req, res) => {
    res.send('This is the new endpoint');
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
*/

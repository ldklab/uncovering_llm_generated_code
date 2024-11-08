// index.js

class MiddlewareEndpoint {
    constructor() {
        console.log("MiddlewareEndpoint: Initialized");
    }

    // Middleware function to handle request and response
    handleRequest(req, res, next) {
        // Log and modify request if necessary
        console.log("MiddlewareEndpoint: Handling request");

        // Check if the URL contains "old-endpoint" and replace it
        if (req.url.includes("old-endpoint")) {
            req.url = req.url.replace("old-endpoint", "new-endpoint");
            console.log(`MiddlewareEndpoint: Updated request URL to ${req.url}`);
        }

        // Proceed to the next middleware
        next();
    }
}

// Example Middleware Factory Function
function exampleMiddleware() {
    return (req, res, next) => {
        const middlewareEndpoint = new MiddlewareEndpoint();
        middlewareEndpoint.handleRequest(req, res, next);
    };
}

// Export the middleware function for use in other parts of the application
module.exports = {
    exampleMiddleware
};

// Example usage in an Express application:
// const express = require('express');
// const { exampleMiddleware } = require('./index');
// const app = express();
// app.use(exampleMiddleware());
// app.get('/new-endpoint', (req, res) => {
//     res.send('This is the new endpoint');
// });
// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

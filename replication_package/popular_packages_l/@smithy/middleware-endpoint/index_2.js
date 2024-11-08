// index.js

class MiddlewareManager {
    constructor() {
        console.log("MiddlewareManager: Initialized");
    }

    processRequest(req, res, next) {
        console.log("MiddlewareManager: Processing request");
        
        // Update the request URL if it contains "old-endpoint"
        if (req.url.includes("old-endpoint")) {
            req.url = req.url.replace("old-endpoint", "new-endpoint");
            console.log(`MiddlewareManager: URL updated to ${req.url}`);
        }
        
        // Proceed to the next middleware
        next();
    }
}

function createMiddleware() {
    return (req, res, next) => {
        const middlewareManager = new MiddlewareManager();
        middlewareManager.processRequest(req, res, next);
    };
}

module.exports = {
    createMiddleware
};

// Usage in an Express application
/*
const express = require('express');
const { createMiddleware } = require('./index');

const app = express();

app.use(createMiddleware());

app.get('/new-endpoint', (req, res) => {
    res.send('This is the new endpoint');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
*/

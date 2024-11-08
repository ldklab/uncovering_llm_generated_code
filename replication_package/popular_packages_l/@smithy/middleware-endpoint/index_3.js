// index.js

class MiddlewareEndpoint {
    constructor() {
        console.log("MiddlewareEndpoint: Initialized");
    }

    handleRequest(req, res, next) {
        console.log("MiddlewareEndpoint: Handling request");

        if (req.url.includes("old-endpoint")) {
            req.url = req.url.replace("old-endpoint", "new-endpoint");
            console.log(`MiddlewareEndpoint: Updated request URL to ${req.url}`);
        }

        next();
    }
}

function exampleMiddleware() {
    return (req, res, next) => {
        const middlewareEndpoint = new MiddlewareEndpoint();
        middlewareEndpoint.handleRequest(req, res, next);
    };
}

module.exports = {
    exampleMiddleware
};

// Usage in an Express application
/*
const express = require('express');
const { exampleMiddleware } = require('./index');

const app = express();

app.use(exampleMiddleware());

app.get('/new-endpoint', (req, res) => {
    res.send('This is the new endpoint');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
*/

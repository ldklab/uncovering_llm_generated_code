"use strict";

// Define a named export for the createProxyMiddleware function
exports.createProxyMiddleware = createProxyMiddleware;

// Import the HttpProxyMiddleware class from a local module named './http-proxy-middleware'
const { HttpProxyMiddleware } = require("./http-proxy-middleware");

// Define the createProxyMiddleware function that returns a middleware instance
function createProxyMiddleware(context, options) {
    // Create an instance of HttpProxyMiddleware with the provided context and options
    const proxyMiddlewareInstance = new HttpProxyMiddleware(context, options);
    
    // Extract the middleware property from the created instance
    const { middleware } = proxyMiddlewareInstance;
    
    // Return the middleware to be used in the application
    return middleware;
}


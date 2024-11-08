"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxyMiddleware = void 0;

// Importing the HttpProxyMiddleware class from the local http-proxy-middleware module
const { HttpProxyMiddleware } = require("./http-proxy-middleware");

/**
 * Factory function to create a proxy middleware.
 *
 * @param {Object} context - Configuration context for the proxy middleware.
 * @param {Object} options - Options for customizing the proxy middleware.
 * @returns {Function} - The proxy middleware function.
 */
function createProxyMiddleware(context, options) {
    // Creating an instance of HttpProxyMiddleware with the given context and options
    const proxyInstance = new HttpProxyMiddleware(context, options);

    // Returning the middleware function from the HttpProxyMiddleware instance
    return proxyInstance.middleware;
}

// Exporting the createProxyMiddleware function
exports.createProxyMiddleware = createProxyMiddleware;

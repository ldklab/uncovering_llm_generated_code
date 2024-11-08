"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxyMiddleware = void 0;

const { HttpProxyMiddleware } = require("./http-proxy-middleware");

function createProxyMiddleware(context, options) {
    // Create an instance of HttpProxyMiddleware
    const proxyInstance = new HttpProxyMiddleware(context, options);
    // Return the middleware function
    return proxyInstance.middleware;
}

exports.createProxyMiddleware = createProxyMiddleware;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxyMiddleware = void 0;

const { HttpProxyMiddleware } = require("./http-proxy-middleware");

function createProxyMiddleware(context, options) {
    const proxy = new HttpProxyMiddleware(context, options);
    return proxy.middleware;
}

exports.createProxyMiddleware = createProxyMiddleware;

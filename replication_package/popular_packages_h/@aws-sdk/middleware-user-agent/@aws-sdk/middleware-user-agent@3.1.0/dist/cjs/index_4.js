"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const configurations = require("./configurations");
const userAgentMiddleware = require("./user-agent-middleware");

Object.keys(configurations).forEach((key) => {
    if (key !== "default" && !exports.hasOwnProperty(key)) {
        exports[key] = configurations[key];
    }
});

Object.keys(userAgentMiddleware).forEach((key) => {
    if (key !== "default" && !exports.hasOwnProperty(key)) {
        exports[key] = userAgentMiddleware[key];
    }
});

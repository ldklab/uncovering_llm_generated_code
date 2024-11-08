"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Re-export everything from the 'loggerMiddleware' module
const loggerMiddleware = require("./loggerMiddleware");
Object.keys(loggerMiddleware).forEach(key => {
    if (key !== "default" && key !== "__esModule") {
        exports[key] = loggerMiddleware[key];
    }
});
